import { timeLogsAPI } from './api';

/**
 * Time tracking utility for tasks
 */
class TimeTracker {
  constructor() {
    this.activeTask = null;
    this.startTime = null;
    this.timerInterval = null;
    this.activeLogId = null;
    this.onTimeUpdate = null;
    this.token = null;
  }

  /**
   * Initialize the time tracker with a token
   * @param {string} token - JWT token
   */
  init(token) {
    this.token = token;
  }
  
  /**
   * Start tracking time for a task
   * @param {number} taskId - The ID of the task to track
   * @param {function} onTimeUpdate - Callback function for time updates
   * @returns {Promise<Object>} - The created time log
   */
  async startTracking(taskId, onTimeUpdate) {
    if (this.activeTask) {
      await this.stopTracking();
    }
    
    try {
      // Create a new time log entry
      const timeLog = await timeLogsAPI.startTimeLog(taskId, this.token);
      
      this.activeTask = taskId;
      this.activeLogId = timeLog.id;
      this.startTime = new Date(timeLog.start_time);
      this.onTimeUpdate = onTimeUpdate;
      
      // Start the timer
      this.startTimer();
      
      return timeLog;
    } catch (error) {
      console.error('Error starting time tracking:', error);
      throw error;
    }
  }
  
  /**
   * Stop tracking time for the active task
   * @returns {Promise<Object>} - The updated time log
   */
  async stopTracking() {
    if (!this.activeTask || !this.activeLogId) {
      return null;
    }
    
    try {
      // Stop the time log entry
      const timeLog = await timeLogsAPI.stopTimeLog(this.activeLogId, this.token);
      
      // Clear the timer
      this.clearTimer();
      
      // Reset state
      const taskId = this.activeTask;
      this.activeTask = null;
      this.activeLogId = null;
      this.startTime = null;
      this.onTimeUpdate = null;
      
      return { timeLog, taskId };
    } catch (error) {
      console.error('Error stopping time tracking:', error);
      throw error;
    }
  }
  
  /**
   * Check if a task is currently being tracked
   * @param {number} taskId - The ID of the task to check
   * @returns {boolean} - True if the task is being tracked
   */
  isTracking(taskId) {
    return this.activeTask === taskId;
  }
  
  /**
   * Get the currently tracked task
   * @returns {number|null} - The ID of the currently tracked task, or null
   */
  getActiveTask() {
    return this.activeTask;
  }
  
  /**
   * Get the elapsed time for the current tracking session
   * @returns {number} - Elapsed time in seconds
   */
  getElapsedTime() {
    if (!this.startTime) {
      return 0;
    }
    
    const now = new Date();
    const elapsedMs = now - this.startTime;
    return Math.floor(elapsedMs / 1000);
  }
  
  /**
   * Format seconds into a readable time string (HH:MM:SS)
   * @param {number} seconds - Seconds to format
   * @returns {string} - Formatted time string
   */
  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  }
  
  /**
   * Start the timer interval
   */
  startTimer() {
    this.clearTimer(); // Clear any existing timer
    
    this.timerInterval = setInterval(() => {
      const elapsedTime = this.getElapsedTime();
      if (this.onTimeUpdate) {
        this.onTimeUpdate(elapsedTime, this.formatTime(elapsedTime));
      }
    }, 1000);
  }
  
  /**
   * Clear the timer interval
   */
  clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}

// Export a singleton instance
export default new TimeTracker(); 