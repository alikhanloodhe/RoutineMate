const express = require('express');
const router = express.Router();
const { 
  getHabits, 
  getHabitById, 
  createHabit, 
  updateHabit, 
  deleteHabit 
} = require('../controllers/habitController');
const { authenticate } = require('../middleware/auth');

// Apply authentication middleware to all habit routes
router.use(authenticate);

// GET /api/habits/getHabits - Get all habits for the logged-in user
router.get('/getHabits', getHabits);

// GET /api/habits/:id - Get a specific habit by ID
router.get('/:id', getHabitById);

// POST /api/habits/createHabit - Create a new habit
router.post('/createHabit', createHabit);

// PUT /api/habits/updateHabit/:id - Update a specific habit
router.put('/updateHabit/:id', updateHabit);

// DELETE /api/habits/deleteHabit/:id - Delete a specific habit
router.delete('/deleteHabit/:id', deleteHabit);

module.exports = router; 