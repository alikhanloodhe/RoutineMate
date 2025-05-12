/**
 * Notification Service - Handles API calls related to user notifications
 */

/**
 * Get unread notifications for the current user
 * @param {number} limit - Maximum number of notifications to fetch
 * @returns {Promise<Array>} Array of notification objects
 */
export const getUnreadNotifications = async (limit = 20) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/notifications/unread?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch notifications');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Get all notifications for the current user
 * @param {number} page - Page number (starts from 1)
 * @param {number} limit - Number of items per page
 * @returns {Promise<Object>} Notifications with pagination info
 */
export const getAllNotifications = async (page = 1, limit = 20) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/notifications?page=${page}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch notifications');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Mark a single notification as read
 * @param {number} notificationId - ID of the notification to mark as read
 * @returns {Promise<Object>} Success status
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}/read`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to mark notification as read');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all unread notifications as read
 * @returns {Promise<Object>} Success status
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/notifications/mark-all-read`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to mark all notifications as read');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

export default {
  getUnreadNotifications,
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
}; 