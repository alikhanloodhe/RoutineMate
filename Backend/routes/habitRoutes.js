import express from 'express';
import habitController from '../controllers/habitController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Protect all habit routes with authentication
router.use(authenticate);

// Get all habits for the current user
router.get('/', habitController.getHabits);

// Create a new habit
router.post('/', habitController.createHabit);

// Get a specific habit by ID
router.get('/:id', habitController.getHabitById);

// Update a habit
router.put('/:id', habitController.updateHabit);

// Delete a habit
router.delete('/:id', habitController.deleteHabit);

export default router; 