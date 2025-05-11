/**
 * Dashboard Service - Handles API calls related to dashboard data
 */

/**
 * Get weekly activity data (completed routines, tasks, and habits per day)
 * @returns {Promise<Object>} Weekly activity data
 */
export const getWeeklyActivity = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    // Include client timezone offset to ensure server uses correct date
    const now = new Date();
    const timezoneOffset = -now.getTimezoneOffset();
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/weekly-activity`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-timezone-offset': timezoneOffset.toString()
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch weekly activity data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching weekly activity:', error);
    throw error;
  }
};

/**
 * Get productivity trend data for the last 4 weeks
 * @returns {Promise<Object>} Productivity trend data
 */
export const getProductivityTrend = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    // Include client timezone offset
    const now = new Date();
    const timezoneOffset = -now.getTimezoneOffset();
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/productivity-trend`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-timezone-offset': timezoneOffset.toString()
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch productivity trend data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching productivity trend:', error);
    throw error;
  }
};

/**
 * Get today's schedule data including routines, tasks, habits, and goals
 * @returns {Promise<Object>} Today's schedule data
 */
export const getTodaySchedule = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    // Get current local date and format it for display
    const now = new Date();
    
    // Include client timezone offset to ensure server uses correct date
    // getTimezoneOffset returns minutes WEST of UTC, but we need to send minutes to ADD to UTC
    // So we negate the value to get the correct offset
    const timezoneOffset = -now.getTimezoneOffset();
    
    const localizedDateString = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    
    console.log(`Client timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
    console.log(`Client timezone offset (minutes): ${timezoneOffset} (negated from getTimezoneOffset value: ${now.getTimezoneOffset()})`);
    console.log(`Current client date: ${now.toISOString()}`);
    console.log(`Client local date string: ${localizedDateString}`);
    console.log(`Client date object: ${now.toString()}`);
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/today-schedule`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-timezone-offset': timezoneOffset.toString()
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch today\'s schedule data');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch today\'s schedule data');
    }
    
    // Log the date info we received for debugging
    if (data.data && data.data.today) {
      console.log(`Received date from server: ${data.data.today.date}`);
      console.log(`Received day of week: ${data.data.today.dayOfWeek}`);
      console.log(`Received full date: ${data.data.today.fullDate}`);
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching today\'s schedule:', error);
    throw error;
  }
};

/**
 * Get category distribution data
 * @returns {Promise<Object>} Category distribution data
 */
export const getCategoryDistribution = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    console.log('Fetching category distribution data...');
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/category-distribution`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response from category distribution API:', errorData);
      throw new Error(errorData.message || 'Failed to fetch category distribution data');
    }

    const data = await response.json();
    console.log('Raw category distribution API response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching category distribution:', error);
    throw error;
  }
};

export default {
  getWeeklyActivity,
  getProductivityTrend,
  getTodaySchedule,
  getCategoryDistribution
}; 