import db from '../config/db.js';

/**
 * Get unread notifications for the current user
 * @route GET /api/notifications/unread
 */
export const getUnreadNotifications = async (req, res) => {
  const userId = req.user.id;
  const limit = req.query.limit ? parseInt(req.query.limit) : 20;
  
  try {
    const query = `
      SELECT id, type, entity_type, entity_id, title, message, is_read, created_at, read_at
      FROM notifications
      WHERE user_id = $1
      AND is_read = FALSE
      ORDER BY created_at DESC
      LIMIT $2
    `;
    
    const result = await db.query(query, [userId, limit]);
    
    return res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch unread notifications'
    });
  }
};

/**
 * Get all notifications for the current user with pagination
 * @route GET /api/notifications
 */
export const getAllNotifications = async (req, res) => {
  const userId = req.user.id;
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit) : 20;
  const offset = (page - 1) * limit;
  
  try {
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM notifications
      WHERE user_id = $1
    `;
    
    const countResult = await db.query(countQuery, [userId]);
    const total = parseInt(countResult.rows[0].total);
    
    // Get notifications with pagination
    const query = `
      SELECT id, type, entity_type, entity_id, title, message, is_read, created_at, read_at
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await db.query(query, [userId, limit, offset]);
    
    return res.status(200).json({
      success: true,
      data: {
        notifications: result.rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

/**
 * Mark a notification as read
 * @route PUT /api/notifications/:id/read
 */
export const markNotificationAsRead = async (req, res) => {
  const userId = req.user.id;
  const notificationId = req.params.id;
  
  try {
    // First, check if the notification exists and belongs to the user
    const checkQuery = `
      SELECT id FROM notifications
      WHERE id = $1 AND user_id = $2
    `;
    
    const checkResult = await db.query(checkQuery, [notificationId, userId]);
    
    if (checkResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or not authorized'
      });
    }
    
    // Update the notification
    const query = `
      UPDATE notifications
      SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, is_read, read_at
    `;
    
    const result = await db.query(query, [notificationId]);
    
    return res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
};

/**
 * Mark all unread notifications as read for the current user
 * @route PUT /api/notifications/mark-all-read
 */
export const markAllNotificationsAsRead = async (req, res) => {
  const userId = req.user.id;
  
  try {
    const query = `
      UPDATE notifications
      SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND is_read = FALSE
      RETURNING id
    `;
    
    const result = await db.query(query, [userId]);
    
    return res.status(200).json({
      success: true,
      message: `${result.rowCount} notifications marked as read`,
      count: result.rowCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
};

/**
 * Create a new notification for a user (internal use)
 * Not exposed as an API endpoint, but used by other controllers
 */
export const createNotification = async ({
  userId,
  type,
  entityType,
  entityId,
  title,
  message
}) => {
  try {
    const query = `
      INSERT INTO notifications
        (user_id, type, entity_type, entity_id, title, message)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;
    
    const values = [userId, type, entityType, entityId, title, message];
    const result = await db.query(query, values);
    
    return {
      success: true,
      notificationId: result.rows[0].id
    };
  } catch (error) {
    console.error('Error creating notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  getUnreadNotifications,
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification
}; 