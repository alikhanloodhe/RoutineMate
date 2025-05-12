import pool from '../config/db.js';
import { getClientAdjustedTime, parseClientDate } from '../utils/timeUtils.js';

export const addGoal = async (req, res) => {

    const {title,description,category,start_date,end_date,milestones,progress,goal_type } = req.body;
    const user_id = req.user.id; // Assuming you have user ID from authentication middleware

    const status = 'active'; // Default status for new goals

    try {
      const categoryText =category;
      const categoryResult = await pool.query('SELECT id FROM categories where name = $1',[categoryText]);
      if (categoryResult.rows.length === 0) {
        throw new Error('status not found');
      }
      const category_id = categoryResult.rows[0].id;
    
        const newGoal = await pool.query(
        'INSERT INTO goals (creator_id, title, description, goal_type,category_id,start_date,end_date,status,progress) VALUES ($1, $2, $3, $4, $5,$6,$7,$8,$9) RETURNING *',
        [user_id, title, description, goal_type,category_id,start_date || null,end_date || null,status,progress]
        );

        const goal_id = newGoal.rows[0].goal_id; // Get the goal_id of the newly created goal
        const status2 = 'in_progress'; // Default status for new milestones
        if (Array.isArray(milestones) &&  milestones.length > 0) {
            for (let i = 0; i < milestones.length; i++) {
              await pool.query(
                'INSERT INTO goal_milestones(goal_id,title,description,due_date,reminder_at,status) VALUES($1, $2, $3, $4, $5, $6)',
                [
                  goal_id, 
                  milestones[i].title, 
                  milestones[i].description, 
                  milestones[i].due_date || null, 
                  milestones[i].reminder_at || null, 
                  status2
                ]
              );
            }
        }
    
        res.status(201).json({ goal: newGoal.rows[0] });
    } catch (error) {
        console.error('Error adding goal:', error);
        res.status(500).json({ message: 'Error adding goal', error: error.message });
    }
    }

    export const addMilestone = async (req, res) => {
        const status2 = 'in_progress';
        const { title, description, due_date, reminder_at } = req.body;
        const { goalId } = req.params;
        // If a milestone is added against a goal it must be entered in the milestone_user table as well
        try {
            // First insert the milestone and get its ID
            const newMilestone = await pool.query(
                'INSERT INTO goal_milestones(goal_id, title, description, due_date, reminder_at, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [
                    goalId, 
                    title, 
                    description, 
                    due_date || null, 
                    reminder_at || null, 
                    status2
                ]
            );
            
            const milestone_id = newMilestone.rows[0].milestone_id;
            
            // Check if this is a group goal
            const goalTypeResult = await pool.query(
                'SELECT goal_type FROM goals WHERE goal_id = $1',
                [goalId]
            );
            
            // If it's a group goal, add all members to milestone_users table
            if (goalTypeResult.rows.length > 0 && goalTypeResult.rows[0].goal_type === 'group') {
                // Get all members of this group goal
                const membersResult = await pool.query(
                    'SELECT user_id FROM goal_members WHERE goal_id = $1',
                    [goalId]
                );
                
                // Add each member to the milestone_users table
                for (const member of membersResult.rows) {
                    await pool.query(
                        'INSERT INTO milestone_users (milestone_id, user_id, status) VALUES ($1, $2, $3)',
                        [milestone_id, member.user_id, 'in_progress']
                    );
                }
            }

            res.status(201).json({ milestone: newMilestone.rows[0] });
        } catch (error) {
            console.error('Error adding milestone:', error);
            res.status(500).json({ message: 'Error adding milestone', error: error.message });
        }
    }

export const fetchGoals = async (req, res) => {
        const userId = req.user.id; // from auth middleware
      
        try {
          // Fetch all personal goals of this user
          const goalsResult = await pool.query(`
            SELECT g.*, c.name AS category
            FROM goals g
            LEFT JOIN categories c ON g.category_id = c.id
            WHERE g.creator_id = $1 AND g.goal_type = 'personal'
          `, [userId]);
      
          const goals = goalsResult.rows;
      
          // Prepare to attach milestones and activities
          const fullGoals = [];
      
          for (const goal of goals) {
            // Fetch milestones for this goal
            const milestonesResult = await pool.query(`
              SELECT * FROM goal_milestones
              WHERE goal_id = $1
              ORDER BY due_date ASC
            `, [goal.goal_id]);
      
            // Fetch activities for this goal
            // const activitiesResult = await pool.query(`
            //   SELECT * FROM activities
            //   WHERE goal_id = $1
            //   ORDER BY created_at DESC
            // `, [goal.goal_id]);
      
            fullGoals.push({
              goal_id: goal.goal_id,
              title: goal.title,
              description: goal.description,
              goal_type: goal.goal_type,
              category: goal.category,
              start_date: goal.start_date,
              end_date: goal.end_date,
              status: goal.status,
              progress: goal.progress,
              created_at: goal.created_at,
              milestones: milestonesResult.rows,
              // activities: activitiesResult.rows,
            });
          }
      
          res.status(200).json({ goals: fullGoals });
        } catch (error) {
          console.error('Error fetching goals:', error.message);
          res.status(500).json({ error: 'Internal server error' });
        }
      };
      
export const fetchGoalById = async (req, res) => {
  const userId = req.user.id; // from auth middleware
  const { goalId } = req.params;

  try {
    // Fetch the specific goal
    const goalResult = await pool.query(`
      SELECT g.*, c.name AS category
      FROM goals g
      LEFT JOIN categories c ON g.category_id = c.id
      WHERE g.creator_id = $1 AND g.goal_id = $2
    `, [userId, goalId]);

    if (goalResult.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const goal = goalResult.rows[0];

    // Fetch milestones for this goal
    const milestonesResult = await pool.query(`
      SELECT * FROM goal_milestones
      WHERE goal_id = $1
      ORDER BY due_date ASC
    `, [goalId]);

    // Fetch activities for this goal
    const activitiesResult = await pool.query(`
      SELECT * FROM activities
      WHERE goal_id = $1
      ORDER BY created_at DESC
    `, [goalId]);
    
    // For each activity, get its photos
    const activitiesWithPhotos = await Promise.all(
      activitiesResult.rows.map(async (activity) => {
        const photos = await pool.query(
          `SELECT id, photo_url, uploaded_at FROM activity_photos 
           WHERE activity_id = $1`,
          [activity.id]
        );

        return {
          ...activity,
          photos: photos.rows
        };
      })
    );
    const fullGoal = {
      goal_id: goal.goal_id,
      title: goal.title,
      description: goal.description,
      goal_type: goal.goal_type,
      category: goal.category,
      start_date: goal.start_date,
      end_date: goal.end_date,
      status: goal.status,
      progress: goal.progress,
      created_at: goal.created_at,
      milestones: milestonesResult.rows,
      activities: activitiesWithPhotos,
    };

    res.status(200).json({ goal: fullGoal });
  } catch (error) {
    console.error('Error fetching goal:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const fetchMilestoneById = async (req, res) => {
  const { goalId, milestoneId } = req.params; 
  const userId = req.user.id; // from auth middleware
  


}
export const updateMilestone = async (req, res) => {
  const { goalId, milestoneId } = req.params;
  const userId = req.user.id;
  const updateData = req.body;

  // Get timezone-adjusted timestamp functions
  const { timestamp } = getClientAdjustedTime(req.clientTimezone?.name);
  
  try {
    // Check if this is a personal or group goal
    const goalTypeResult = await pool.query(
      'SELECT goal_type FROM goals WHERE goal_id = $1',
      [goalId]
    );
    
    if (goalTypeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    const goalType = goalTypeResult.rows[0].goal_type;
    let updatedMilestone = null;
    
    if (goalType === 'personal') {
      // For personal goals, update the milestone directly
      updatedMilestone = await pool.query(
        `UPDATE goal_milestones 
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             due_date = COALESCE($3, due_date),
             reminder_at = COALESCE($4, reminder_at),
             status = COALESCE($5, status),
             completion_date = COALESCE($6, completion_date)
         WHERE milestone_id = $7 AND goal_id = $8
         RETURNING *`,
        [
          updateData.title, 
          updateData.description,
          updateData.due_date || null,
          updateData.reminder_at || null,
          updateData.status,
          updateData.completion_date || null,
          milestoneId,
          goalId
        ]
      );
      
      if (updatedMilestone.rows.length === 0) {
        return res.status(404).json({ error: 'Milestone not found' });
      }
    } else if (goalType === 'group') {
      // For group goals, we need to check if this user is an admin or a regular member
      const memberRole = await pool.query(
        'SELECT role FROM goal_members WHERE goal_id = $1 AND user_id = $2',
        [goalId, userId]
      );
      
      if (memberRole.rows.length === 0) {
        return res.status(403).json({ error: 'You are not a member of this goal' });
      }
      
      const isAdmin = memberRole.rows[0].role === 'admin';
      
      if (isAdmin && updateData.title) {
        // If admin is updating milestone details
        updatedMilestone = await pool.query(
          `UPDATE goal_milestones 
           SET title = COALESCE($1, title),
               description = COALESCE($2, description),
               due_date = COALESCE($3, due_date),
               reminder_at = COALESCE($4, reminder_at),
               completion_date = COALESCE($5, completion_date)
           WHERE milestone_id = $6 AND goal_id = $7
           RETURNING *`,
          [
            updateData.title, 
            updateData.description,
            updateData.due_date || null,
            updateData.reminder_at || null,
            updateData.completion_date || null,
            milestoneId,
            goalId
          ]
        );
        
        if (updatedMilestone.rows.length === 0) {
          return res.status(404).json({ error: 'Milestone not found' });
        }
      } else {
        // This is for updating the user's personal status for this milestone
        // Check if a record exists first
        const existingRecord = await pool.query(
          'SELECT * FROM milestone_users WHERE milestone_id = $1 AND user_id = $2',
          [milestoneId, userId]
        );
        
        if (existingRecord.rows.length === 0) {
          // If no record exists, insert a new one
          updatedMilestone = await pool.query(
            'INSERT INTO milestone_users (milestone_id, user_id, status, completion_date) VALUES ($1, $2, $3, $4) RETURNING *',
            [milestoneId, userId, updateData.status, updateData.completion_date || null]
          );
        } else {
          // Update existing record
          updatedMilestone = await pool.query(
            `UPDATE milestone_users 
             SET status = COALESCE($1, status),
                 completion_date = COALESCE($2, completion_date)
             WHERE milestone_id = $3 AND user_id = $4
             RETURNING *`,
            [
              updateData.status,
              updateData.completion_date || null,
              milestoneId,
              userId
            ]
          );
        }
        
        // After individual update, check if all members have completed this milestone
        // and update the overall milestone status if needed
        if (isAdmin) {
          const allMembers = await pool.query(
            'SELECT user_id FROM goal_members WHERE goal_id = $1',
            [goalId]
          );
          
          const completedMembers = await pool.query(
            `SELECT user_id FROM milestone_users 
             WHERE milestone_id = $1 AND status = 'completed'`,
            [milestoneId]
          );
          
          // If all members have completed the milestone, update the milestone's overall status
          if (completedMembers.rows.length === allMembers.rows.length) {
            await pool.query(
              `UPDATE goal_milestones
               SET status = 'completed', 
                   completion_date = ${timestamp}
               WHERE milestone_id = $1`,
              [milestoneId]
            );
          }
        }
      }
    }
    
    // Return the updated milestone record
    res.status(200).json({ 
      milestone: updatedMilestone.rows[0],
      message: 'Milestone updated successfully'
    });
  } catch (error) {
    console.error('Error updating milestone:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

// exports.updateGoal = async (req, res) => {
//   const { goalId } = req.params;
//   const userId = req.user.id;
//   const updateData = req.body;

//   try {
//     // First verify that the goal belongs to this user
//     const goalCheck = await pool.query(
//       'SELECT * FROM goals WHERE goal_id = $1 AND creator_id = $2',
//       [goalId, userId]
//     );

//     if (goalCheck.rows.length === 0) {
//       return res.status(403).json({ error: 'You do not have permission to update this goal' });
//     }

//     // Build the SET part of the query dynamically based on what fields are provided
//     const updateFields = [];
//     const queryParams = [];
//     let paramCounter = 1;

//     // Add each field that exists in the request
//     if (updateData.title !== undefined) {
//       updateFields.push(`title = $${paramCounter++}`);
//       queryParams.push(updateData.title);
//     }
//     if (updateData.description !== undefined) {
//       updateFields.push(`description = $${paramCounter++}`);
//       queryParams.push(updateData.description);
//     }
//     if (updateData.status !== undefined) {
//       updateFields.push(`status = $${paramCounter++}`);
//       queryParams.push(updateData.status);
//     }
//     if (updateData.progress !== undefined) {
//       updateFields.push(`progress = $${paramCounter++}`);
//       queryParams.push(updateData.progress);
//     }
//     if (updateData.start_date !== undefined) {
//       updateFields.push(`start_date = $${paramCounter++}`);
//       queryParams.push(updateData.start_date);
//     }
//     if (updateData.end_date !== undefined) {
//       updateFields.push(`end_date = $${paramCounter++}`);
//       queryParams.push(updateData.end_date);
//     }
//     if (updateData.category_id !== undefined) {
//       updateFields.push(`category_id = $${paramCounter++}`);
//       queryParams.push(updateData.category_id);
//     }

//     // If no fields to update, return early
//     if (updateFields.length === 0) {
//       return res.status(400).json({ error: 'No fields to update' });
//     }

//     // Add goal_id as the last parameter
//     queryParams.push(goalId);

//     // Execute the update query
//     const updatedGoal = await pool.query(
//       `UPDATE goals 
//        SET ${updateFields.join(', ')}
//        WHERE goal_id = $${paramCounter}
//        RETURNING *`,
//       queryParams
//     );

//     if (updatedGoal.rows.length === 0) {
//       return res.status(404).json({ error: 'Goal not found' });
//     }

//     res.status(200).json({ goal: updatedGoal.rows[0] });
//   } catch (error) {
//     console.error('Error updating goal:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// };
export const updateGoal = async (req, res) => {
    const { goalId } = req.params;
    const {
      title,
      description,
      goal_type,
      category_id,
      start_date,
      end_date,
      status,
      progress,
      milestones,
    } = req.body;

    const user_id = req.user.id; 
    
    // Get timezone-adjusted timestamp functions
    const { timestamp } = getClientAdjustedTime(req.clientTimezone?.name);
    
    try {
      // Optional: Verify if goal exists and belongs to the user
      const existingGoal = await pool.query(
        'SELECT * FROM goals WHERE goal_id = $1 AND creator_id = $2',
        [goalId, user_id]
      );
  
      if (existingGoal.rows.length === 0) {
        return res.status(404).json({ message: 'Goal not found or unauthorized' });
      }
  
      const updatedGoal = await pool.query(
        `
        UPDATE goals
        SET
          title = COALESCE($1, title),
          description = COALESCE($2, description),
          goal_type = COALESCE($3, goal_type),
          category_id = COALESCE($4, category_id),
          start_date = COALESCE($5, start_date),
          end_date = COALESCE($6, end_date),
          status = COALESCE($7, status),
          progress = COALESCE($8, progress),
          updated_at = ${timestamp}
        WHERE goal_id = $9 AND creator_id = $10
        RETURNING *;
        `,
        [
          title,
          description,
          goal_type,
          category_id,
          start_date || null,
          end_date || null,
          status,
          progress,
          goalId,
          req.user.id,
        ]
      );
      const status2 = 'in_progress'; // Default status for new milestones
      if (Array.isArray(milestones) &&  milestones.length > 0) {
          for (let i = 0; i < milestones.length; i++) {
            await pool.query(
              'INSERT INTO goal_milestones(goal_id,title,description,due_date,reminder_at,status) VALUES($1, $2, $3, $4, $5, $6)',
              [
                goalId, 
                milestones[i].title, 
                milestones[i].description, 
                milestones[i].due_date || null, 
                milestones[i].reminder_at || null, 
                status2
              ]
            );
          }
      }
      res.status(200).json(updatedGoal.rows[0]);
    } catch (error) {
      console.error('Error updating goal:', error);
      res.status(500).json({ message: 'Server error while updating goal' });
    }
  };


export const deleteMilestone = async (req, res) => {
  const { goalId, milestoneId } = req.params;
  const userId = req.user.id;

  try {
    // First verify that the goal belongs to this user
    const goalCheck = await pool.query(
      'SELECT * FROM goals WHERE goal_id = $1 AND creator_id = $2',
      [goalId, userId]
    );

    if (goalCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You do not have permission to update this goal' });
    }

    // Delete the milestone
    const deletedMilestone = await pool.query(
      'DELETE FROM goal_milestones WHERE milestone_id = $1 AND goal_id = $2 RETURNING *',
      [milestoneId, goalId]
    );

    if (deletedMilestone.rows.length === 0) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    res.status(200).json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteGoal = async (req, res) => {
    const { goalId } = req.params;
    const userId = req.user.id; // from auth middleware
    
    try {
        // First verify that the goal belongs to this user
        const goalCheck = await pool.query(
        'SELECT * FROM goals WHERE goal_id = $1 AND creator_id = $2',
        [goalId, userId]
        );
    
        if (goalCheck.rows.length === 0) {
        return res.status(403).json({ error: 'You do not have permission to delete this goal' });
        }
    
        // Delete the goal and its associated milestones and activities
        await pool.query('DELETE FROM goal_milestones WHERE goal_id = $1', [goalId]);
        await pool.query('DELETE FROM activities WHERE goal_id = $1', [goalId]);
        await pool.query('DELETE FROM goals WHERE goal_id = $1', [goalId]);
    
        res.status(200).json({ message: 'Goal deleted successfully' });
    } catch (error) {
        console.error('Error deleting goal:', error);
        res.status(500).json({ error: 'Server error' });
    }
    }
      