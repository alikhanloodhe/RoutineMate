import express from 'express';
import { 
  getHabits, 
  getHabitById, 
  createHabit, 
  updateHabit, 
  deleteHabit 
} from '../controllers/habitController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

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

export default router;