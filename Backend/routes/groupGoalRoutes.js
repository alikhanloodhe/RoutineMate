import express from 'express';
import pool from '../config/db.js';

import {
  addGroupGoals,
  updateGroupGoals,
  fetchGroupGoals,
  fetchGroupGoalById,
  deleteGroupGoal,
  addMember,
  removeMember
} from '../controllers/groupGoalController.js';

import { addMilestone,updateMilestone,deleteMilestone } from '../controllers/goalController.js';

import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

// Group Goal Routes
router.post('/addGroupGoal', addGroupGoals);
router.put('/updateGroupGoal/:goalId', updateGroupGoals);
router.get('/fetchGroupGoals', fetchGroupGoals);
router.get('/fetchGroupGoal/:goalId', fetchGroupGoalById);
router.delete('/deleteGroupGoal/:goalId', deleteGroupGoal);


router.post('/addMilestone/:goalId', addMilestone);
router.put('/updateMilestone/:goalId/:milestoneId', updateMilestone);
router.delete('/deleteMilestone/:goalId/:milestoneId', deleteMilestone);

router.post('/addMembers/:goalId', addMember);
router.delete('/removeMember/:goalId/:memberId', removeMember);

// Add a new route to get milestone users
router.get('/getMilestoneUsers/:milestoneId', async (req, res) => {
  try {
    const { milestoneId } = req.params;
    const userId = req.user.id;
    
    // Get all users for this milestone
    const usersResult = await pool.query(
      `SELECT mu.user_id, mu.status, mu.completion_date
       FROM milestone_users mu
       WHERE mu.milestone_id = $1`,
      [milestoneId]
    );
    
    res.status(200).json({ 
      users: usersResult.rows 
    });
  } catch (error) {
    console.error('Error fetching milestone users:', error);
    res.status(500).json({ message: 'Error fetching milestone users', error: error.message });
  }
});

export default router;