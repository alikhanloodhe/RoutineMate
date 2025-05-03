// routes/activityRoutes.js
import express from 'express';
import { 
  addActivityWithPhoto, 
  getActivitiesByGoal,
  getActivityById,
  updateActivity,
  deleteActivity,
  getAllUserActivities
} from '../controllers/activityController.js';
import { authenticate } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Add activity with optional photo
router.post('/addActivity/:goalId', upload.array('photos', 5), addActivityWithPhoto);

// Get all activities for a specific goal
router.get('/goal/:goalId', getActivitiesByGoal);

// Get a specific activity by ID
router.get('/:activityId', getActivityById);

// Update an activity
router.put('/:activityId', upload.array('photos', 5), updateActivity);

// Delete an activity
router.delete('/:activityId', deleteActivity);

// Get all activities for the current user
router.get('/', getAllUserActivities);

export default router;
