import express from 'express';
import routineController from '../controllers/routineController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Protect all routine routes with authentication
router.use(authenticate);

// Get all routines for the current user
router.get('/', routineController.getAllRoutines);

// Get max current streak and max longest streak for user's routines
router.get('/streaks', routineController.getRoutineStreaks);

// Get completion history for a specific routine
router.get('/completion-history/:routineId', routineController.getRoutineCompletionHistory);

// Toggle completion status for a routine on a specific date
router.post('/completion', routineController.toggleRoutineCompletion);

// Create a new routine
router.post('/', routineController.createRoutine);

// Get a specific routine by ID
router.get('/:id', routineController.getRoutineById);

// Update a routine
router.put('/:id', routineController.updateRoutine);

// Delete a routine
router.delete('/:id', routineController.deleteRoutine);

// Toggle routine active status
router.patch('/:id/toggle-active', routineController.toggleRoutineActive);

export default router; 