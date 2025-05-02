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

// GET /api/habits - Get all habits for the logged-in user
router.get('/', getHabits);

// GET /api/habits/:id - Get a specific habit by ID
router.get('/:id', getHabitById);

// POST /api/habits - Create a new habit
router.post('/', createHabit);

// PUT /api/habits/:id - Update a habit
router.put('/:id', updateHabit);

// DELETE /api/habits/:id - Delete a habit
router.delete('/:id', deleteHabit);

module.exports = router; 