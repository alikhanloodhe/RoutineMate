import express from 'express';
import habitTrackingController from '../controllers/habitTrackingController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Protect all habit tracking routes with authentication
router.use(authenticate);

// Get tracking records for a specific habit
router.get('/habit/:habitId', habitTrackingController.getTrackingByHabit);

// Get tracking records for a specific date
router.get('/date/:date', habitTrackingController.getTrackingByDate);

// Get max current and max longest habit streaks for the user
router.get('/streaks', habitTrackingController.getHabitStreaks);

// Toggle completion status for a habit on a specific date
router.post('/toggle', habitTrackingController.toggleCompletion);

// Create a new tracking record
router.post('/', habitTrackingController.createTracking);

// Update a tracking record
router.put('/:id', habitTrackingController.updateTracking);

// Delete a tracking record
router.delete('/:id', habitTrackingController.deleteTracking);

export default router; 