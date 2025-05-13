import pool from '../config/db.js';
import cloudinary from '../config/cloudinary.js';

export const addGroupGoals = async (req, res) => {
    const { 
        title, 
        description, 
        category, 
        start_date, 
        end_date, 
        milestones, 
        members, 
        progress, 
        goal_type 
    } = req.body;
    
    const user_id = req.user.id; // From authentication middleware
    const status = 'active'; // Default status for new goals

    // Begin transaction as we need to insert into multiple tables
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        // 1. Insert into goals table
        // Get category ID from the category name
        const categoryResult = await client.query('SELECT id FROM categories WHERE name = $1', [category]);
        if (categoryResult.rows.length === 0) {
            throw new Error('Category not found');
        }
        const category_id = categoryResult.rows[0].id;
        
        // Insert the goal
        const newGoal = await client.query(
            'INSERT INTO goals (creator_id, title, description, goal_type, category_id, start_date, end_date, status, progress) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [user_id, title, description, goal_type, category_id, start_date, end_date, status, progress]
        );
        
        const goal_id = newGoal.rows[0].goal_id;
        
        // 2. Insert goal members
        if (Array.isArray(members) && members.length > 0) {
            // First, add the creator as admin
            await client.query(
                'INSERT INTO goal_members (goal_id, user_id, role) VALUES ($1, $2, $3)',
                [goal_id, user_id, 'admin']
            );
            
            // Then add other members with 'collaborator' role
            for (const member of members) {
                // Skip if it's the current user (creator) as they're already added
                if (member.id === 'current-user-id' || member.id === user_id.toString()) {
                    continue;
                }
                
                await client.query(
                    'INSERT INTO goal_members (goal_id, user_id, role) VALUES ($1, $2, $3)',
                    [goal_id, member.id, 'collaborator']
                );
                
            }
        }
        
        // 3. Insert milestones if any
        if (Array.isArray(milestones) && milestones.length > 0) {
            const milestoneStatus = 'in_progress'; // Default status for new milestones
            
            for (const milestone of milestones) {
                const milestone_id = await client.query(
                    'INSERT INTO goal_milestones (goal_id, title, description, due_date, status) VALUES ($1, $2, $3, $4, $5) RETURNING milestone_id',
                    [goal_id, milestone.title, milestone.description, milestone.due_date || null, milestoneStatus]
                );
     
                for(const member of members){
                    await client.query(
                        'INSERT INTO milestone_users (milestone_id,user_id,status) VALUES ($1, $2, $3)',
                        [milestone_id.rows[0].milestone_id, member.id, 'in_progress']
                    );
                }
            }
        }
        
        // Commit the transaction
        await client.query('COMMIT');
        
        // Send response with the created goal data
        res.status(201).json({
            message: 'Group goal created successfully',
            goal: {
                ...newGoal.rows[0],
                members: members,
                milestones: milestones || []
            }
        });
        
    } catch (error) {
        // Rollback in case of error
        await client.query('ROLLBACK');
        console.error('Error adding group goal:', error);
        res.status(500).json({ message: 'Error adding group goal', error: error.message });
    } finally {
        // Release the client
        client.release();
    }
};

export const updateGroupGoals = async (req, res) => {
    const { goalId } = req.params;
    const { 
        title, 
        description, 
        category, 
        start_date, 
        end_date, 
        status, 
        milestones, 
        members, 
        progress 
    } = req.body;
    
    const user_id = req.user.id;

    // Begin transaction
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // 1. Check if the goal exists and the user has permission to update it
        const goalCheck = await client.query(
            `SELECT g.* FROM goals g
             JOIN goal_members gm ON g.goal_id = gm.goal_id
             WHERE g.goal_id = $1 AND gm.user_id = $2 AND gm.role = 'admin'`,
            [goalId, user_id]
        );
        
        if (goalCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Goal not found or you do not have permission to update it' });
        }
        
        // 2. Update the goal
        let categoryId = null;
        if (category) {
            const categoryResult = await client.query('SELECT id FROM categories WHERE name = $1', [category]);
            if (categoryResult.rows.length > 0) {
                categoryId = categoryResult.rows[0].id;
            }
        }
        
        const updatedGoal = await client.query(
            `UPDATE goals
             SET title = COALESCE($1, title),
                 description = COALESCE($2, description),
                 category_id = COALESCE($3, category_id),
                 start_date = COALESCE($4, start_date),
                 end_date = COALESCE($5, end_date),
                 status = COALESCE($6, status),
                 progress = COALESCE($7, progress),
                 updated_at = CURRENT_TIMESTAMP
             WHERE goal_id = $8
             RETURNING *`,
            [
                title, 
                description, 
                categoryId, 
                start_date || null, 
                end_date || null, 
                status, 
                progress, 
                goalId
            ]
        );
        
        // 3. Update members if provided
        if (Array.isArray(members) && members.length > 0) {
            // Get current members
            const currentMembers = await client.query(
                'SELECT user_id, role FROM goal_members WHERE goal_id = $1',
                [goalId]
            );
            
            const currentMemberIds = new Set(currentMembers.rows.map(m => m.user_id ? m.user_id.toString() : ''));
            const newMemberIds = new Set(members.filter(m => m && m.id).map(m => m.id.toString()));
            
            // Find members to add
            for (const member of members) {
                if (member.id === 'current-user-id' || member.id === user_id.toString()) {
                    continue; // Skip the current user
                }
                
                if (!currentMemberIds.has(member.id.toString())) {
                    // Add new member
                    await client.query(
                        'INSERT INTO goal_members (goal_id, user_id, role) VALUES ($1, $2, $3)',
                        [goalId, member.id, 'collaborator']
                    );
                }
            }
            
            // Find members to remove
            for (const currentMemberId of currentMemberIds) {
                // Don't remove the admin (creator)
                const memberRole = currentMembers.rows.find(m => m.user_id ? m.user_id.toString() === currentMemberId : false)?.role;
                
                if (
                    memberRole !== 'admin' && 
                    currentMemberId !== user_id.toString() && 
                    !newMemberIds.has(currentMemberId)
                ) {
                    // Remove member
                    await client.query(
                        'DELETE FROM goal_members WHERE goal_id = $1 AND user_id = $2',
                        [goalId, currentMemberId]
                    );
                }
            }
        }
        
        if (Array.isArray(milestones) && milestones.length > 0) {
            // For simplicity, we're just adding new milestones
            // A more sophisticated approach would involve comparing existing milestones
            const milestoneStatus = 'in_progress';
            
            for (const milestone of milestones) {
                // Insert new milestone and get its ID
                const newMilestoneResult = await client.query(
                    'INSERT INTO goal_milestones (goal_id, title, description, due_date, status) VALUES ($1, $2, $3, $4, $5) RETURNING milestone_id',
                    [goalId, milestone.title, milestone.description, milestone.due_date || null, milestoneStatus]
                );
                
                const milestone_id = newMilestoneResult.rows[0].milestone_id;
                
                // Get all current members of this goal
                const membersResult = await client.query(
                    'SELECT user_id FROM goal_members WHERE goal_id = $1',
                    [goalId]
                );
                
                // Add all members to this milestone in milestone_users table
                for (const member of membersResult.rows) {
                    await client.query(
                        'INSERT INTO milestone_users (milestone_id, user_id, status) VALUES ($1, $2, $3)',
                        [milestone_id, member.user_id, 'in_progress']
                    );
                }
            }
        }
        
        // Commit transaction
        await client.query('COMMIT');
        
        // Fetch the updated goal with its members and milestones
        const fullGoal = await fetchFullGroupGoal(client, goalId);
        
        res.status(200).json({  
            message: 'Group goal updated successfully',
            goal: fullGoal
        });
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating group goal:', error);
        res.status(500).json({ message: 'Error updating group goal', error: error.message });
    } finally {
        client.release();
    }
};

export const fetchGroupGoals = async (req, res) => {
    const userId = req.user.id;
    
    try {
        // Query Optimized Previously N+1 
         const result = await pool.query(`
       SELECT 
        g.goal_id,
        g.title,
        g.description,
        g.goal_type,
        g.start_date,
        g.end_date,
        g.status,
        g.progress,
        g.created_at,
        c.name AS category,

        -- Milestones subquery per goal
        COALESCE((
          SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
              'milestone_id', m.milestone_id,
              'title', m.title,
              'description', m.description,
              'due_date', m.due_date,
              'status', m.status
            )
            ORDER BY m.due_date
          )
          FROM goal_milestones m
          WHERE m.goal_id = g.goal_id
        ), '[]') AS milestones,

        -- Members subquery per goal
        COALESCE((
          SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
              'user_id', u.id,
              'name', u.name,
              'email', u.email,
              'role', gm_inner.role
            )
          )
          FROM goal_members gm_inner
          JOIN users u ON u.id = gm_inner.user_id
          WHERE gm_inner.goal_id = g.goal_id
        ), '[]') AS members

      FROM goals g
      JOIN goal_members gm ON g.goal_id = gm.goal_id
      LEFT JOIN categories c ON g.category_id = c.id
      WHERE gm.user_id = $1 AND g.goal_type = 'group'
      ORDER BY g.created_at DESC
    `, [userId]);
        
        res.status(200).json({ goals: result.rows });
    } catch (error) {
        console.error('Error fetching group goals:', error);
        res.status(500).json({ message: 'Error fetching group goals', error: error.message });
    }
};

export const fetchGroupGoalById = async (req, res) => {
    const userId = req.user.id;
    const { goalId } = req.params;

    try {
        // Check if the user is a member of this goal
        const memberCheck = await pool.query(
            'SELECT * FROM goal_members WHERE goal_id = $1 AND user_id = $2',
            [goalId, userId]
        );
        
        if (memberCheck.rows.length === 0) {
            return res.status(403).json({ message: 'You do not have access to this goal' });
        }
        
        // Fetch full goal details
        const client = await pool.connect();
        try {
            const fullGoal = await fetchFullGroupGoal(client, goalId);
            if (!fullGoal) {
                return res.status(404).json({ message: 'Goal not found' });
            }
            
            res.status(200).json({ goal: fullGoal });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error fetching group goal:', error);
        res.status(500).json({ message: 'Error fetching group goal', error: error.message });
    }
};

export const deleteGroupGoal = async (req, res) => {
    const userId = req.user.id;
    const { goalId } = req.params;
    
    // Begin transaction
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Check if the user is an admin of this goal
        const adminCheck = await client.query(
            `SELECT * FROM goal_members 
             WHERE goal_id = $1 AND user_id = $2 AND role = 'admin'`,
            [goalId, userId]
        );
        
        if (adminCheck.rows.length === 0) {
            return res.status(403).json({ message: 'You do not have permission to delete this goal' });
        }
        
        // Get all post IDs for this goal to delete associated photos
        const postsWithPhotos = await client.query(
            'SELECT post_id, photo_url FROM goal_posts WHERE goal_id = $1 AND photo_url IS NOT NULL',
            [goalId]
        );
        
        // Delete photos from Cloudinary
        for (const post of postsWithPhotos.rows) {
            if (post.photo_url) {
                try {
                    // Extract the public_id from the URL
                    const urlParts = post.photo_url.split('/');
                    const publicIdWithVersion = urlParts.slice(-2).join('/');
                    
                    // Remove version number if present
                    const publicId = publicIdWithVersion.includes('v') && publicIdWithVersion.includes('/')
                        ? publicIdWithVersion.split('/').slice(1).join('/')
                        : publicIdWithVersion;
                    
                    // Delete from Cloudinary
                    await cloudinary.uploader.destroy(publicId);
                } catch (cloudinaryErr) {
                    console.error('Error deleting photo from Cloudinary:', cloudinaryErr);
                    // Continue with deletion process
                }
            }
        }
        
        // Delete related records
        // Goal likes and comments will be deleted automatically via CASCADE constraint
        await client.query('DELETE FROM goal_posts WHERE goal_id = $1', [goalId]);
        await client.query('DELETE FROM goal_milestones WHERE goal_id = $1', [goalId]);
        await client.query('DELETE FROM activities WHERE goal_id = $1', [goalId]);
        await client.query('DELETE FROM goal_members WHERE goal_id = $1', [goalId]);
        
        // Delete the goal
        await client.query('DELETE FROM goals WHERE goal_id = $1', [goalId]);
        
        // Commit transaction
        await client.query('COMMIT');
        
        res.status(200).json({ message: 'Group goal deleted successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting group goal:', error);
        res.status(500).json({ message: 'Error deleting group goal', error: error.message });
    } finally {
        client.release();
    }
};

// Helper function to fetch full goal details including members and milestones
async function fetchFullGroupGoal(client, goalId) {
    // Fetch goal
    const goalResult = await client.query(`
        SELECT g.*, c.name AS category
        FROM goals g
        LEFT JOIN categories c ON g.category_id = c.id
        WHERE g.goal_id = $1 AND g.goal_type = 'group'
    `, [goalId]);
    
    if (goalResult.rows.length === 0) {
        return null;
    }
    
    const goal = goalResult.rows[0];
    
    // Fetch members
    const membersResult = await client.query(`
        SELECT gm.role, u.id, u.name, u.email
        FROM goal_members gm
        JOIN users u ON gm.user_id = u.id
        WHERE gm.goal_id = $1
    `, [goalId]);
    
    // Fetch milestones
    const milestonesResult = await client.query(`
        SELECT * FROM goal_milestones
        WHERE goal_id = $1
        ORDER BY due_date ASC
    `, [goalId]);
    
    // // Fetch activities
    // const activitiesResult = await client.query(`
    //     SELECT * FROM activities
    //     WHERE goal_id = $1
    //     ORDER BY created_at DESC
    // `, [goalId]);
    
    // // For each activity, get its photos
    // const activitiesWithPhotos = await Promise.all(
    //     activitiesResult.rows.map(async (activity) => {
    //         const photos = await client.query(
    //             `SELECT id, photo_url, uploaded_at FROM activity_photos 
    //              WHERE activity_id = $1`,
    //             [activity.id]
    //         );
            
    //         return {
    //             ...activity,
    //             photos: photos.rows
    //         };
    //     })
    // );
    
    // // Fetch goal posts with user info, likes count and comments
    // const postsResult = await client.query(`
    //     SELECT gp.*, u.name as user_name, u.email as user_email,
    //         (SELECT COUNT(*) FROM goal_likes WHERE post_id = gp.post_id) as likes_count
    //     FROM goal_posts gp
    //     JOIN users u ON gp.user_id = u.id
    //     WHERE gp.goal_id = $1
    //     ORDER BY gp.created_at DESC
    // `, [goalId]);
    
    // // For each post, get its comments
    // const postsWithComments = await Promise.all(
    //     postsResult.rows.map(async (post) => {
    //         const commentsResult = await client.query(`
    //             SELECT gc.*, u.name as user_name, u.email as user_email
    //             FROM goal_comments gc
    //             JOIN users u ON gc.user_id = u.id
    //             WHERE gc.post_id = $1
    //             ORDER BY gc.created_at ASC
    //         `, [post.post_id]);
            
    //         return {
    //             ...post,
    //             comments: commentsResult.rows
    //         };
    //     })
    // );
    const activitiesResult = await client.query(`
    SELECT * FROM activities
    WHERE goal_id = $1
    ORDER BY created_at DESC
`, [goalId]);

const activities = activitiesResult.rows;

// Fetch all activity photos in a single query
let activitiesWithPhotos = activities;
if (activities.length > 0) {
    const activityIds = activities.map(a => a.id);
    const photosResult = await client.query(`
        SELECT activity_id, id, photo_url, uploaded_at
        FROM activity_photos
        WHERE activity_id = ANY($1)
    `, [activityIds]);

    const photosGrouped = {};
    for (const photo of photosResult.rows) {
        if (!photosGrouped[photo.activity_id]) {
            photosGrouped[photo.activity_id] = [];
        }
        photosGrouped[photo.activity_id].push(photo);
    }

    activitiesWithPhotos = activities.map(activity => ({
        ...activity,
        photos: photosGrouped[activity.id] || []
    }));
}

// Fetch goal posts with user info, likes count
const postsResult = await client.query(`
    SELECT gp.*, u.name as user_name, u.email as user_email,
        (SELECT COUNT(*) FROM goal_likes WHERE post_id = gp.post_id) as likes_count
    FROM goal_posts gp
    JOIN users u ON gp.user_id = u.id
    WHERE gp.goal_id = $1
    ORDER BY gp.created_at DESC
`, [goalId]);

const posts = postsResult.rows;

// Fetch all post comments in one go
let postsWithComments = posts;
if (posts.length > 0) {
    const postIds = posts.map(p => p.post_id);
    const commentsResult = await client.query(`
        SELECT gc.*, u.name as user_name, u.email as user_email
        FROM goal_comments gc
        JOIN users u ON gc.user_id = u.id
        WHERE gc.post_id = ANY($1)
        ORDER BY gc.created_at ASC
    `, [postIds]);

    const commentsGrouped = {};
    for (const comment of commentsResult.rows) {
        if (!commentsGrouped[comment.post_id]) {
            commentsGrouped[comment.post_id] = [];
        }
        commentsGrouped[comment.post_id].push(comment);
    }

    postsWithComments = posts.map(post => ({
        ...post,
        comments: commentsGrouped[post.post_id] || []
    }));
}
    
    return {
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
        members: membersResult.rows,
        milestones: milestonesResult.rows,
        activities: activitiesWithPhotos,
        posts: postsWithComments
    };
}

export const addMember = async (req, res) => {
    const user_id = req.user.id; // From authentication middleware
    const { goalId } = req.params;
    const { members } = req.body; // Expecting an array of member objects with id and role
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Check if the user making the request is an admin of this goal
        const adminCheck = await client.query(
            `SELECT * FROM goal_members 
             WHERE goal_id = $1 AND user_id = $2 AND role = 'admin'`,
            [goalId, user_id]
        );
        
        if (adminCheck.rows.length === 0) {
            return res.status(403).json({ message: 'You do not have permission to add members to this goal' });
        }
        
        // Arrays to track newly added members
        const addedMemberIds = [];
        
        // Then add other members with 'collaborator' role
        for (const member of members) {
            // Skip if it's the current user (creator) as they're already added
            if (member.user_id === 'current-user-id' || member.user_id === user_id.toString()) {
                continue;
            }
            
            // Check if the member is already part of the goal
            const memberCheck = await client.query(
                'SELECT * FROM goal_members WHERE goal_id = $1 AND user_id = $2',
                [goalId, member.user_id]
            );
            
            if (memberCheck.rows.length === 0) {
                await client.query(
                    'INSERT INTO goal_members (goal_id, user_id, role) VALUES ($1, $2, $3)',
                    [goalId, member.user_id, 'collaborator']
                );
                
                // Track this member as newly added
                addedMemberIds.push(member.user_id);
            }
        }
        
        // If new members were added, add them to all existing milestones
        if (addedMemberIds.length > 0) {
            // Get all milestones for this goal
            const milestonesResult = await client.query(
                'SELECT milestone_id FROM goal_milestones WHERE goal_id = $1',
                [goalId]
            );
            
            // For each new member, add them to each milestone
            for (const memberId of addedMemberIds) {
                for (const milestone of milestonesResult.rows) {
                    // Add the member to the milestone_users table
                    await client.query(
                        'INSERT INTO milestone_users (milestone_id, user_id, status) VALUES ($1, $2, $3)',
                        [milestone.milestone_id, memberId, 'in_progress']
                    );
                }
            }
        }
        
        await client.query('COMMIT');
        
        // Fetch updated members list
        const updatedMembers = await client.query(
            `SELECT gm.role, u.id, u.name, u.email
             FROM goal_members gm
             JOIN users u ON gm.user_id = u.id
             WHERE gm.goal_id = $1`,
            [goalId]
        );
        
        res.status(200).json({ 
            message: 'Members added successfully',
            members: updatedMembers.rows
        });
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error adding members:', error);
        res.status(500).json({ message: 'Error adding members', error: error.message });
    } finally {
        client.release();
    }
}

export const removeMember = async (req, res) => {  
    const user_id = req.user.id; // From authentication middleware
    const { goalId, memberId } = req.params;
    // req. params will show the goalId and memberId of the member to remove
    // user_id is the person who is trying to remove the member
    
    const client = await pool.connect();
    
    try {
        // If user is removing themselves, don't need admin check
        if (parseInt(user_id) !== parseInt(memberId)) {
            // Check if the user is an admin of this goal
            const isAdmin = await client.query(
                `SELECT gm.* FROM goal_members gm
                 WHERE gm.goal_id = $1 AND gm.user_id = $2 AND gm.role = 'admin'`,
                [goalId, user_id]
            );
            
            if (isAdmin.rows.length === 0) {
                console.log('Not authorized to remove member');
                return res.status(403).json({ error: 'You do not have permission to remove this member' });
            }
        }
        
        // Begin transaction
        await client.query('BEGIN');
        
        // Remove member from goal_members
        await client.query(
            'DELETE FROM goal_members WHERE goal_id = $1 AND user_id = $2',
            [goalId, memberId]
        );
        
        // Remove member from all milestone_users for this goal
        await client.query(`
            DELETE FROM milestone_users 
            WHERE user_id = $1 
            AND milestone_id IN (
                SELECT milestone_id 
                FROM goal_milestones 
                WHERE goal_id = $2
            )`,
            [memberId, goalId]
        );
        
        await client.query('COMMIT');
        
        res.status(200).json({ message: 'Member removed successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error removing member:', error);
        res.status(500).json({ message: 'Error removing member', error: error.message });
    } finally {
        client.release();
    }
}

// Update milestone status for a group goal
export const updateMilestone = async (req, res) => {
    const { goalId, milestoneId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    console.log('Updating milestone with data:', { 
        goalId, 
        milestoneId, 
        userId,
        updateData 
    });

    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // 1. First check if user is member of this goal
        const memberCheck = await client.query(
            'SELECT role FROM goal_members WHERE goal_id = $1 AND user_id = $2',
            [goalId, userId]
        );
        
        if (memberCheck.rows.length === 0) {
            return res.status(403).json({ error: 'You are not a member of this goal' });
        }
        
        const userRole = memberCheck.rows[0].role;
        const isAdmin = userRole === 'admin';
        
        // 2. Check if milestone exists for this goal
        const milestoneCheck = await client.query(
            'SELECT * FROM goal_milestones WHERE milestone_id = $1 AND goal_id = $2',
            [milestoneId, goalId]
        );
        
        if (milestoneCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Milestone not found for this goal' });
        }

        // Format dates if they're provided
        let formattedDueDate = null;
        let formattedReminderAt = null;
        
        if (updateData.due_date) {
            try {
                formattedDueDate = new Date(updateData.due_date).toISOString();
            } catch (dateError) {
                console.error('Error formatting due_date:', dateError);
                return res.status(400).json({ 
                    message: 'Invalid due date format', 
                    error: dateError.message 
                });
            }
        }
        
        if (updateData.reminder_at) {
            try {
                formattedReminderAt = new Date(updateData.reminder_at).toISOString();
            } catch (dateError) {
                console.error('Error formatting reminder_at:', dateError);
                return res.status(400).json({ 
                    message: 'Invalid reminder date format', 
                    error: dateError.message 
                });
            }
        }

        // 3. Handle title/description updates (admin only)
        if (isAdmin && (updateData.title || updateData.description || formattedDueDate)) {
            await client.query(
                `UPDATE goal_milestones 
                 SET title = COALESCE($1, title),
                     description = COALESCE($2, description),
                     due_date = COALESCE($3, due_date),
                     reminder_at = COALESCE($4, reminder_at)
                 WHERE milestone_id = $5`,
                [
                    updateData.title, 
                    updateData.description,
                    formattedDueDate,
                    formattedReminderAt,
                    milestoneId
                ]
            );
        }
        
        // 4. Handle status update for both admin and members
        if (updateData.status) {
            await client.query(
                'UPDATE goal_milestones SET status = $1 WHERE milestone_id = $2',
                [updateData.status, milestoneId]
            );
            
            // Also update the user's specific milestone status in milestone_users
            await client.query(
                'UPDATE milestone_users SET status = $1 WHERE milestone_id = $2 AND user_id = $3',
                [updateData.status, milestoneId, userId]
            );
            
            // If status is 'completed', add completion_date
            if (updateData.status === 'completed') {
                const completionDate = updateData.completion_date ? 
                    new Date(updateData.completion_date).toISOString() : 
                    new Date().toISOString();
                
                await client.query(
                    'UPDATE goal_milestones SET completion_date = $1 WHERE milestone_id = $2',
                    [completionDate, milestoneId]
                );
            } else if (updateData.status === 'in_progress' && !updateData.completion_date) {
                // If status is changed back to in_progress, remove completion_date
                await client.query(
                    'UPDATE goal_milestones SET completion_date = NULL WHERE milestone_id = $2',
                    [milestoneId]
                );
            }
        }
        
        // Fetch the updated milestone
        const updatedMilestone = await client.query(
            'SELECT * FROM goal_milestones WHERE milestone_id = $1',
            [milestoneId]
        );
        
        // Calculate and update the goal's progress
        const totalMilestonesResult = await client.query(
            'SELECT COUNT(*) FROM goal_milestones WHERE goal_id = $1',
            [goalId]
        );
        
        const completedMilestonesResult = await client.query(
            'SELECT COUNT(*) FROM goal_milestones WHERE goal_id = $1 AND status = $2',
            [goalId, 'completed']
        );
        
        const totalMilestones = parseInt(totalMilestonesResult.rows[0].count);
        const completedMilestones = parseInt(completedMilestonesResult.rows[0].count);
        
        // Calculate progress percentage (rounded to nearest integer)
        const progress = totalMilestones > 0 
            ? Math.round((completedMilestones / totalMilestones) * 100) 
            : 0;
        
        // Update the goal's progress
        await client.query(
            'UPDATE goals SET progress = $1 WHERE goal_id = $2',
            [progress, goalId]
        );
        
        await client.query('COMMIT');
        
        res.status(200).json({
            message: 'Milestone updated successfully',
            milestone: updatedMilestone.rows[0],
            goal_progress: progress
        });
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating milestone:', error);
        res.status(500).json({ 
            message: 'Error updating milestone', 
            error: error.message,
            details: error.stack
        });
    } finally {
        client.release();
    }
};

// Get all users associated with a milestone along with their status
export const getMilestoneUsers = async (req, res) => {
    const { milestoneId } = req.params;
    
    try {
        // Get all users assigned to this milestone
        const usersResult = await pool.query(
            `SELECT mu.*, u.name, u.email 
             FROM milestone_users mu
             JOIN users u ON mu.user_id = u.id
             WHERE mu.milestone_id = $1`,
            [milestoneId]
        );
        
        res.status(200).json({ users: usersResult.rows });
    } catch (error) {
        console.error('Error fetching milestone users:', error);
        res.status(500).json({ error: 'Server error', message: error.message });
    }
};