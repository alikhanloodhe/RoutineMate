/**
 * Format a date string in a readable format
 * @param {string} dateString - Date string in format 'YYYY-MM-DD'
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (err) {
    console.error('Error formatting date:', err);
    return dateString;
  }
};

/**
 * Format time in 12-hour format
 * @param {string} timeString - Time string in format 'HH:MM:SS'
 * @returns {string} Formatted time string
 */
export const formatTime = (timeString) => {
  if (!timeString) return '';
  
  try {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes} ${ampm}`;
  } catch (err) {
    console.error('Error formatting time:', err);
    return timeString;
  }
}; 