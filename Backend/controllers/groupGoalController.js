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
                        [goalId, member.id, 'collaborator']
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

        // 3. Handle title/description updates (admin only)
        if (isAdmin && (updateData.title || updateData.description || updateData.due_date)) {
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
                    updateData.due_date || null,
                    updateData.reminder_at || null,
                    milestoneId
                ]
            );
        }
        
        // 4. Handle user's personal milestone status update
        if (updateData.status) {
            // Check if user already has a record in milestone_users
            const userMilestoneCheck = await client.query(
                'SELECT * FROM milestone_users WHERE milestone_id = $1 AND user_id = $2',
                [milestoneId, userId]
            );
            
            if (userMilestoneCheck.rows.length === 0) {
                // Create new record if doesn't exist
                await client.query(
                    'INSERT INTO milestone_users (milestone_id, user_id, status) VALUES ($1, $2, $3)',
                    [milestoneId, userId, updateData.status]
                );
            } else {
                // Update existing record
                await client.query(
                    'UPDATE milestone_users SET status = $1, completion_date = $2 WHERE milestone_id = $3 AND user_id = $4',
                    [
                        updateData.status,
                        updateData.status === 'completed' ? new Date() : null,
                        milestoneId,
                        userId
                    ]
                );
            }
            
            // If admin, check if all members have completed the milestone
            // Update milestone's overall status if all members have completed it
            if (isAdmin) {
                const allMembersResult = await client.query(
                    'SELECT user_id FROM goal_members WHERE goal_id = $1',
                    [goalId]
                );
                
                const completedMembersResult = await client.query(
                    'SELECT user_id FROM milestone_users WHERE milestone_id = $1 AND status = $2',
                    [milestoneId, 'completed']
                );
                
                const allMembers = allMembersResult.rows;
                const completedMembers = completedMembersResult.rows;
                
                // If all members have completed, update milestone status
                if (completedMembers.length === allMembers.length) {
                    await client.query(
                        'UPDATE goal_milestones SET status = $1, completion_date = $2 WHERE milestone_id = $3',
                        ['completed', new Date(), milestoneId]
                    );
                } else if (completedMembers.length > 0) {
                    // If some members have completed but not all, ensure status is in_progress
                    await client.query(
                        'UPDATE goal_milestones SET status = $1 WHERE milestone_id = $2 AND status != $3',
                        ['in_progress', milestoneId, 'completed']
                    );
                }
            }
            
            // Update overall goal progress
            const milestonesResult = await client.query(
                'SELECT * FROM goal_milestones WHERE goal_id = $1',
                [goalId]
            );
            
            const milestones = milestonesResult.rows;
            const totalMilestones = milestones.length;
            
            // Count user-completed milestones
            const userCompletedMilestonesResult = await client.query(
                `SELECT COUNT(*) FROM milestone_users 
                 WHERE user_id = $1 
                 AND status = 'completed' 
                 AND milestone_id IN (SELECT milestone_id FROM goal_milestones WHERE goal_id = $2)`,
                [userId, goalId]
            );
            
            const userCompletedMilestones = parseInt(userCompletedMilestonesResult.rows[0].count || 0);
            const userProgress = totalMilestones > 0 
                ? Math.round((userCompletedMilestones / totalMilestones) * 100) 
                : 0;
            
            // Calculate team progress
            const completedMilestonesResult = await client.query(
                `SELECT COUNT(*) FROM goal_milestones 
                 WHERE goal_id = $1 AND status = 'completed'`,
                [goalId]
            );
            
            const completedMilestones = parseInt(completedMilestonesResult.rows[0].count || 0);
            const teamProgress = totalMilestones > 0 
                ? Math.round((completedMilestones / totalMilestones) * 100) 
                : 0;
            
            // Update overall goal progress
            await client.query(
                'UPDATE goals SET progress = $1 WHERE goal_id = $2',
                [teamProgress, goalId]
            );
        }
        
        await client.query('COMMIT');
        
        // Return the updated milestone data and milestone_users data
        const updatedMilestone = await client.query(
            'SELECT * FROM goal_milestones WHERE milestone_id = $1',
            [milestoneId]
        );
        
        const milestoneUsers = await client.query(
            'SELECT mu.*, u.name FROM milestone_users mu JOIN users u ON mu.user_id = u.id WHERE mu.milestone_id = $1',
            [milestoneId]
        );
        
        res.status(200).json({
            message: 'Milestone updated successfully',
            milestone: updatedMilestone.rows[0],
            users: milestoneUsers.rows
        });
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating milestone:', error);
        res.status(500).json({ error: 'Server error', message: error.message });
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