/**
 * Middleware to extract timezone information from client requests
 */
const timezoneMiddleware = (req, res, next) => {
  // Get timezone from header - can be updated to use a proper timezone string like 'America/New_York'
  const timezone = req.headers['x-timezone'] || 'UTC';
  
  // Get timezone offset in minutes for calculations if needed
  // This should be the offset in minutes *ahead* of UTC
  // For example, UTC+5 = 300 minutes, UTC-5 = -300 minutes
  const timezoneOffset = parseInt(req.headers['x-timezone-offset'] || '0');
  
  // Attach to request object for use in route handlers
  req.clientTimezone = {
    name: timezone,
    offset: timezoneOffset
  };
  
  // Log timezone information for debugging
  console.log(`Request timezone: ${timezone}, Offset: ${timezoneOffset} minutes`);
  
  next();
};

export default timezoneMiddleware; 