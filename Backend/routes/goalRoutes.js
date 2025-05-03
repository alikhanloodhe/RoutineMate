const express = require('express');
const { 
  addGoal, 
  fetchGoals, 
  fetchGoalById, 
  addMilestone, 
  updateMilestone, 
  deleteMilestone, 
  updateGoal,
  deleteGoal
} = require('../controllers/goalController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// Goal routes
router.post('/addGoal', addGoal);
router.get('/fetchGoals', fetchGoals);
router.get('/fetchGoal/:goalId', fetchGoalById);
router.put('/updateGoal/:goalId', updateGoal);
router.delete('/deleteGoal/:goalId', deleteGoal);

// Milestone routes
router.post('/addMilestone/:goalId', addMilestone);
router.put('/updateMilestone/:goalId/:milestoneId', updateMilestone);
router.delete('/deleteMilestone/:goalId/:milestoneId', deleteMilestone);

module.exports = router;