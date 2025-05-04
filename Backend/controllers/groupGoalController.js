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
                    [goal_id, member.id, member.role] // Using 'collabrator' role as specified
                );
            }
        }
        
        // 3. Insert milestones if any
        if (Array.isArray(milestones) && milestones.length > 0) {
            const milestoneStatus = 'in_progress'; // Default status for new milestones
            
            for (const milestone of milestones) {
                await client.query(
                    'INSERT INTO goal_milestones (goal_id, title, description, due_date, status) VALUES ($1, $2, $3, $4, $5)',
                    [goal_id, milestone.title, milestone.description, milestone.due_date, milestoneStatus]
                );
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
    console.log(user_id);
    console.log(req.body);
    
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
                start_date, 
                end_date, 
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
            
            const currentMemberIds = new Set(currentMembers.rows.map(m => m.user_id.toString()));
            const newMemberIds = new Set(members.map(m => m.id.toString()));
            
            // Find members to add
            for (const member of members) {
                if (member.id === 'current-user-id' || member.id === user_id.toString()) {
                    continue; // Skip the current user
                }
                
                if (!currentMemberIds.has(member.id.toString())) {
                    // Add new member
                    await client.query(
                        'INSERT INTO goal_members (goal_id, user_id, role) VALUES ($1, $2, $3)',
                        [goalId, member.id, 'collabrator']
                    );
                }
            }
            
            // Find members to remove
            for (const currentMemberId of currentMemberIds) {
                // Don't remove the admin (creator)
                const memberRole = currentMembers.rows.find(m => m.user_id.toString() === currentMemberId)?.role;
                
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
        
        // 4. Update milestones if provided
        console.log(milestones);
        if (Array.isArray(milestones) && milestones.length > 0) {
            // For simplicity, we're just adding new milestones
            // A more sophisticated approach would involve comparing existing milestones
            const milestoneStatus = 'in_progress';
            
            for (const milestone of milestones) {
                // Check if this is a new milestone (no ID) or existing (has ID)

                    await client.query(
                        'INSERT INTO goal_milestones (goal_id, title, description, due_date, status) VALUES ($1, $2, $3, $4, $5)',
                        [goalId, milestone.title, milestone.description, milestone.due_date, milestoneStatus]
                    );
                
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
        // Fetch all group goals where the user is a member
        const goalsResult = await pool.query(`
            SELECT g.*, c.name AS category
            FROM goals g
            JOIN goal_members gm ON g.goal_id = gm.goal_id
            LEFT JOIN categories c ON g.category_id = c.id
            WHERE gm.user_id = $1 AND g.goal_type = 'group'
            ORDER BY g.created_at DESC
        `, [userId]);
        
        const goals = goalsResult.rows;
        const fullGoals = [];
        
        for (const goal of goals) {
            // Fetch members
            const membersResult = await pool.query(`
                SELECT gm.role, u.id as user_id, u.name, u.email
                FROM goal_members gm
                JOIN users u ON gm.user_id = u.id
                WHERE gm.goal_id = $1
            `, [goal.goal_id]);
            
            // Fetch milestones
            const milestonesResult = await pool.query(`
                SELECT * FROM goal_milestones
                WHERE goal_id = $1
                ORDER BY due_date ASC
            `, [goal.goal_id]);
            
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
                members: membersResult.rows,
                milestones: milestonesResult.rows
            });
        }
        
        res.status(200).json({ goals: fullGoals });
    } catch (error) {
        console.error('Error fetching group goals:', error);
        res.status(500).json({ message: 'Error fetching group goals', error: error.message });
    }
};

export const fetchGroupGoalById = async (req, res) => {
    const userId = req.user.id;
    const { goalId } = req.params;
    // console.log('Fetching group goal with ID:', goalId);

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
    
    // Fetch activities
    const activitiesResult = await client.query(`
        SELECT * FROM activities
        WHERE goal_id = $1
        ORDER BY created_at DESC
    `, [goalId]);
    
    // For each activity, get its photos
    const activitiesWithPhotos = await Promise.all(
        activitiesResult.rows.map(async (activity) => {
            const photos = await client.query(
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
    
    // Fetch goal posts with user info, likes count and comments
    const postsResult = await client.query(`
        SELECT gp.*, u.name as user_name, u.email as user_email,
            (SELECT COUNT(*) FROM goal_likes WHERE post_id = gp.post_id) as likes_count
        FROM goal_posts gp
        JOIN users u ON gp.user_id = u.id
        WHERE gp.goal_id = $1
        ORDER BY gp.created_at DESC
    `, [goalId]);
    
    // For each post, get its comments
    const postsWithComments = await Promise.all(
        postsResult.rows.map(async (post) => {
            const commentsResult = await client.query(`
                SELECT gc.*, u.name as user_name, u.email as user_email
                FROM goal_comments gc
                JOIN users u ON gc.user_id = u.id
                WHERE gc.post_id = $1
                ORDER BY gc.created_at ASC
            `, [post.post_id]);
            
            return {
                ...post,
                comments: commentsResult.rows
            };
        })
    );
    
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
    console.log('Adding member to group goal',req.body);
    const { goalId } = req.params;
    const { members } = req.body; // Expecting an array of member objects with id and role
    const client =await  pool.connect();
     // Then add other members with 'collaborator' role
     for (const member of members) {
        // Skip if it's the current user (creator) as they're already added
        if (member.user_id === 'current-user-id' || member.id === user_id.toString()) {
            continue;
        }
        
        await client.query(
            'INSERT INTO goal_members (goal_id, user_id, role) VALUES ($1, $2, $3)',
            [goalId, member.user_id, member.role] // Using 'collabrator' role as specified
        );
    }
}

export const removeMember = async (req, res) => {  
    const user_id = req.user.id; // From authentication middleware
    const { goalId,memberId } = req.params;

    
    try {
        await pool.query(
            'DELETE FROM goal_members WHERE goal_id = $1 AND user_id = $2',
            [goalId, memberId]
        );
        
        res.status(200).json({ message: 'Member removed successfully' });
    } catch (error) {
        console.error('Error removing member:', error);
        res.status(500).json({ message: 'Error removing member', error: error.message });
    }
 }