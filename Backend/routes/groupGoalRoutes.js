import express from 'express';

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
export default router;