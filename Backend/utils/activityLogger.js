/**
 * Utility for logging user activities to the user_activity_log table
 */
import db from '../config/db.js';

/**
 * Log a user activity to the database
 * 
 * @param {Object} activityData - The activity data to log
 * @param {number} activityData.userId - User ID
 * @param {string} activityData.activityType - Type of activity ('task', 'goal', 'habit', 'routine')
 * @param {number} activityData.activityId - ID of the specific activity
 * @param {string} activityData.title - Title of the activity
 * @param {string} activityData.operation - Type of operation ('insert', 'update', 'delete', 'complete')
 * @returns {Promise<boolean>} - Success or failure
 */
export const logUserActivity = async (activityData) => {
  const { userId, activityType, activityId, title, operation } = activityData;
  
  try {
    if (!userId || !activityType || !activityId || !title || !operation) {
      console.error('Missing required parameters for activity logging:', activityData);
      return false;
    }
    
    // Validate activity type
    const validActivityTypes = ['task', 'goal', 'habit', 'routine'];
    if (!validActivityTypes.includes(activityType)) {
      console.error(`Invalid activity type: ${activityType}. Must be one of: ${validActivityTypes.join(', ')}`);
      return false;
    }
    
    // Validate operation
    const validOperations = ['insert', 'update', 'delete', 'complete'];
    if (!validOperations.includes(operation)) {
      console.error(`Invalid operation: ${operation}. Must be one of: ${validOperations.join(', ')}`);
      return false;
    }
    
    // Insert the activity log entry
    await db.query(
      `INSERT INTO user_activity_log 
        (user_id, activity_type, activity_id, title, operation)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, activityType, activityId, title, operation]
    );
    
    return true;
  } catch (error) {
    console.error('Error logging user activity:', error);
    return false;
  }
};

/**
 * Helper function to format activity data for logging
 * 
 * @param {number} userId - User ID
 * @param {string} activityType - Type of activity ('task', 'goal', 'habit', 'routine')
 * @param {number} activityId - ID of the activity
 * @param {string} title - Title of the activity
 * @param {string} operation - Operation type ('insert', 'update', 'delete', 'complete')
 * @returns {Object} - Formatted activity data
 */
export const formatActivityData = (userId, activityType, activityId, title, operation) => {
  return {
    userId,
    activityType,
    activityId,
    title,
    operation
  };
};

export default {
  logUserActivity,
  formatActivityData
}; 