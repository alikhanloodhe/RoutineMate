import express from 'express';
import { 
  getUnreadNotifications, 
  getAllNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all notification routes
router.use(authenticate);

// Get unread notifications
router.get('/unread', getUnreadNotifications);

// Get all notifications with pagination
router.get('/', getAllNotifications);

// Mark a notification as read
router.put('/:id/read', markNotificationAsRead);

// Mark all notifications as read
router.put('/mark-all-read', markAllNotificationsAsRead);

export default router; 