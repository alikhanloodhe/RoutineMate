/**
 * Utility functions for handling timezones and date/time operations
 */

/**
 * Get timezone-adjusted SQL timestamp expressions based on client timezone
 * @param {string} timezone - Client's timezone (e.g., 'America/New_York', 'Asia/Karachi')
 * @returns {Object} Object with different SQL timestamp expressions
 */
export const getClientAdjustedTime = (timezone) => {
  // Default to UTC if no timezone provided
  const tz = timezone || 'UTC';
  
  return {
    now: `NOW() AT TIME ZONE 'UTC' AT TIME ZONE '${tz}'`,
    today: `CURRENT_DATE AT TIME ZONE 'UTC' AT TIME ZONE '${tz}'`,
    timestamp: `CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE '${tz}'`,
    
    // Function to adjust a column to client timezone
    adjustColumn: (columnName) => `${columnName} AT TIME ZONE 'UTC' AT TIME ZONE '${tz}'`,
    
    // Function to convert a date string to client timezone
    dateToClientTZ: (dateStr) => `'${dateStr}'::timestamp AT TIME ZONE 'UTC' AT TIME ZONE '${tz}'`
  };
};

/**
 * Parse a date string from client and format it for PostgreSQL in a timezone-safe way
 * @param {string} dateStr - Date string from client
 * @param {string} timezone - Client's timezone (optional)
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
export const parseClientDate = (dateStr) => {
  // If date is already in YYYY-MM-DD format without time component, use it directly
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateStr;
  }
  
  // Otherwise, parse and format it properly, keeping the client's date
  const parsedDate = new Date(dateStr);
  return `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`;
};

/**
 * Get interval SQL for a specified number of days from now in client timezone
 * @param {number} days - Number of days (positive for future, negative for past)
 * @param {string} timezone - Client's timezone
 * @returns {string} SQL interval expression
 */
export const getDaysInterval = (days, timezone) => {
  const tz = timezone || 'UTC';
  const direction = days >= 0 ? '+' : ''; // + is implicit for positive numbers
  return `(CURRENT_DATE AT TIME ZONE 'UTC' AT TIME ZONE '${tz}') ${direction} INTERVAL '${days} days'`;
}; 