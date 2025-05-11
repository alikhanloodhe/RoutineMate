import express from 'express';
import dashboardController from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Protect all dashboard routes with authentication
router.use(authenticate);

// Get weekly activity data (completed routines, tasks, and habits per day)
router.get('/weekly-activity', dashboardController.getWeeklyActivity);

// Get productivity trend data for the last 4 weeks
router.get('/productivity-trend', dashboardController.getProductivityTrend);

// Get today's schedule data
router.get('/today-schedule', dashboardController.getTodaySchedule);

// Get category distribution data
router.get('/category-distribution', dashboardController.getCategoryDistribution);

// Get user activity log with pagination
router.get('/activity-log', dashboardController.getUserActivityLog);

export default router; 