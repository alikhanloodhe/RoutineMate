import express from 'express';
import { generateSmartSchedule, getScheduleItemExplanation } from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Route to generate a smart schedule
// POST /api/ai/generate-schedule
router.post('/generate-schedule', authenticate, generateSmartSchedule);

// Route to get explanations for specific schedule items
// POST /api/ai/explain-schedule-item
router.post('/explain-schedule-item', authenticate, getScheduleItemExplanation);

export default router; 