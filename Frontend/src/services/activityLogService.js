/**
 * Activity Log Service - Handles API calls related to user activity logs
 */

/**
 * Get recent activity log for the current user with pagination
 * @param {number} page - Page number (starts from 1)
 * @param {number} limit - Number of items per page
 * @returns {Promise<Object>} Activity log data with pagination info
 */
export const getRecentActivities = async (page = 1, limit = 10) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    // Include client timezone offset to ensure correct time display
    const now = new Date();
    const timezoneOffset = -now.getTimezoneOffset();
    
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/dashboard/activity-log?page=${page}&limit=${limit}`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-timezone-offset': timezoneOffset.toString()
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch activity log');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching activity log:', error);
    throw error;
  }
};

export default {
  getRecentActivities
}; 