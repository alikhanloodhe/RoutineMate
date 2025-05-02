const express = require('express');
const router = express.Router();
const {
  getTrackingByHabit,
  getTrackingForDate,
  toggleHabitCompletion
} = require('../controllers/trackingController');
const { authenticate } = require('../middleware/auth');

// Apply authentication middleware to all tracking routes
router.use(authenticate);

// GET /api/tracking/habit/:habitId - Get tracking data for a specific habit
router.get('/habit/:habitId', getTrackingByHabit);

// GET /api/tracking/date/:date - Get tracking data for all habits on a specific date
router.get('/date/:date', getTrackingForDate);

// POST /api/tracking/toggleCompletion - Toggle habit completion status for a specific date
router.post('/toggleCompletion', toggleHabitCompletion);

module.exports = router; 