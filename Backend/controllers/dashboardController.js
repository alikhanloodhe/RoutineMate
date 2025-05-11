import db from '../config/db.js';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

// Configure dayjs to use timezone plugin
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Get weekly activity data (completed routines, tasks, and habits per day)
 * for the last 7 days using database function
 */
export const getWeeklyActivity = async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Call the database function to get completion summary
    const query = `SELECT * FROM get_dashboard_completion_summary($1)`;
    const result = await db.query(query, [userId]);
    
    // Transform the data into a format suitable for the frontend chart
    const weeklyData = result.rows.map(row => {
      return {
        date: row.date,
        day: row.day,
        routines: parseInt(row.routines),
        tasks: parseInt(row.tasks),
        habits: parseInt(row.habits)
      };
    });
    
    // Calculate the daily average for each activity type
    const totals = weeklyData.reduce(
      (acc, day) => {
        acc.routines += day.routines;
        acc.tasks += day.tasks;
        acc.habits += day.habits;
        return acc;
      },
      { routines: 0, tasks: 0, habits: 0 }
    );
    
    const averages = {
      routines: parseFloat((totals.routines / 7).toFixed(1)),
      tasks: parseFloat((totals.tasks / 7).toFixed(1)),
      habits: parseFloat((totals.habits / 7).toFixed(1))
    };
    
    // Send data back to client
    res.status(200).json({
      weeklyData,
      averages,
      dateRange: weeklyData.map(item => item.date)
    });
    
  } catch (error) {
    console.error('Error fetching weekly activity:', error);
    res.status(500).json({ message: 'Server error while fetching weekly activity data' });
  }
};

/**
 * Get productivity trend data for the last 4 weeks using database function
 * Includes tasks, routines, habits, and goal milestones completion rates
 */
export const getProductivityTrend = async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Call the database function to get productivity trend data
    const query = `SELECT * FROM get_dashboard_productivity_trend($1)`;
    const result = await db.query(query, [userId]);
    
    // If no results, return default values
    if (result.rows.length === 0) {
      return res.status(200).json({
        weeklyData: [0, 0, 0, 0],
        change: 0,
        detailedStats: Array(4).fill().map((_, i) => ({
          week: i + 1,
          productivityScore: 0,
          tasks: { completed: 0, total: 0, due: 0 },
          milestones: { completed: 0, due: 0 }, // Added milestone data
          routines: { completed: 0, total: 0 },
          habits: { completed: 0, opportunities: 0 },
          hasData: false,
          hasRealData: false,
          weekLabel: null
        })),
        isNewUser: true
      });
    }
    
    // Process the data from the database function
    const weeklyStats = result.rows.map((row, index) => {
      // Calculate individual component scores
      const taskScore = row.tasks_due > 0 
        ? Math.min(100, Math.round((row.tasks_completed / row.tasks_due) * 100)) 
        : 0;
      
      const milestoneScore = row.milestones_due > 0 
        ? Math.min(100, Math.round((row.milestones_completed / row.milestones_due) * 100)) 
        : 0;
      
      const routineScore = row.routines_total > 0 
        ? Math.min(100, Math.round((row.routines_completed / row.routines_total) * 100)) 
        : 0;
      
      const habitScore = row.habits_opportunities > 0 
        ? Math.min(100, Math.round((row.habits_completed / row.habits_opportunities) * 100)) 
        : 0;
      
      // Determine if this week actually has activity data
      const hasRealData = row.tasks_due > 0 || row.milestones_due > 0 || 
                        row.routines_total > 0 || row.habits_opportunities > 0;
                        
      // Format the week_start as ISO date string for consistency
      const weekLabel = row.week_start ? row.week_start.toISOString().split('T')[0] : row.week_label;
      
      return {
        week: 4 - index, // Week numbers are in reverse order (newest first)
        weekLabel: weekLabel,
        productivityScore: row.productivity_score,
        taskScore,
        milestoneScore, // Added milestone score
        routineScore,
        habitScore,
        tasks: {
          completed: row.tasks_completed,
          due: row.tasks_due,
          total: 0 // Not used in the new calculation but kept for backward compatibility
        },
        milestones: { // Added milestones data
          completed: row.milestones_completed,
          due: row.milestones_due
        },
        routines: {
          completed: row.routines_completed,
          total: row.routines_total
        },
        habits: {
          completed: row.habits_completed,
          opportunities: row.habits_opportunities,
          total: 0 // Not used but kept for backward compatibility
        },
        hasData: true,
        hasRealData: hasRealData
      };
    });
    
    // Reverse the array to have newest week first
    weeklyStats.reverse();
    
    // Extract productivity scores for the chart (only from weeks with real data)
    const weeklyScores = weeklyStats.map(week => week.hasRealData ? week.productivityScore : 0);
    
    // Calculate change between most recent weeks with real data
    let change = 0;
    const weeksWithRealData = weeklyStats.filter(w => w.hasRealData);
    if (weeksWithRealData.length >= 2) {
      change = weeksWithRealData[0].productivityScore - weeksWithRealData[1].productivityScore;
    }
    
    // Get user creation date (for new users)
    const userQuery = `SELECT created_at FROM users WHERE id = $1`;
    const userResult = await db.query(userQuery, [userId]);
    const userCreatedAt = userResult.rows.length > 0 ? new Date(userResult.rows[0].created_at) : new Date();
    
    // Calculate how many days the user has been active
    const daysSinceCreation = Math.floor((new Date() - userCreatedAt) / (1000 * 60 * 60 * 24)) + 1;
    const fullWeeks = Math.min(4, Math.ceil(daysSinceCreation / 7));
    
    res.status(200).json({
      weeklyData: weeklyScores,
      change,
      detailedStats: weeklyStats,
      userCreatedAt: userCreatedAt.toISOString(),
      fullWeeks,
      isNewUser: daysSinceCreation < 7 // Consider user new if less than a week
    });
    
  } catch (error) {
    console.error('Error calculating productivity trend:', error);
    res.status(500).json({ 
      message: 'Server error while calculating productivity trend',
      error: error.message
    });
  }
};

/**
 * Get today's schedule data including routines, tasks, habits, and goal milestones
 * using database function
 */
export const getTodaySchedule = async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Call the database function to get today's schedule
    const query = `SELECT * FROM get_dashboard_today_schedule($1)`;
    const result = await db.query(query, [userId]);

    // Helper function to convert PostgreSQL boolean to JavaScript boolean
    function convertPgBoolean(value) {
      // Check for null or undefined
      if (value === null || value === undefined) {
        return false;
      }
      
      // Handle string representations
      if (typeof value === 'string') {
        const upperValue = value.toUpperCase();
        return upperValue === 'TRUE' || upperValue === 'T' || upperValue === 'YES' || upperValue === 'Y' || upperValue === '1';
      }
      
      // Handle boolean or numeric values directly
      return Boolean(value);
    }
    
    // Process items returned from the database function
    const dbItems = result.rows.map(item => ({
      id: item.id,
      title: item.title,
      type: item.type,
      time: item._time ? new Date(`1970-01-01T${item._time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : null,
      endTime: item.end_time ? new Date(`1970-01-01T${item.end_time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : null,
      category: item.category_id ? String(item.category_id) : "Other",
      priority: item.priority_id ? parseInt(item.priority_id) : null,
      completed: convertPgBoolean(item.completed),
      status: item.status
    }));
    
    // Add interval for routines with start and end times
    dbItems.forEach(item => {
      if (item.type === 'routine' && item.time && item.endTime) {
        item.interval = `${item.time} - ${item.endTime}`;
      }
    });
    
    // Separate items into those with time slots and those without
    const schedule = dbItems.filter(item => item.time !== null);
    const tasksWithoutTime = dbItems.filter(item => item.type === 'task' && item.time === null);
    const habitsWithoutTime = dbItems.filter(item => item.type === 'habit' && item.time === null);
    const goalsWithoutTime = dbItems.filter(item => item.type === 'goal');
    
    // Sort schedule by time
    schedule.sort((a, b) => {
      if (!a.time) return 1;
      if (!b.time) return -1;
      return a.time.localeCompare(b.time);
    });
    
    // Get today's date information
    const clientDate = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayDayName = dayNames[clientDate.getDay()];
    
    res.status(200).json({
      success: true,
      data: {
        schedule,
        tasksWithoutTime,
        habitsWithoutTime,
        goalsWithoutTime,
        today: {
          date: clientDate.toISOString().split('T')[0],
          dayOfWeek: todayDayName,
          fullDate: clientDate.toDateString()
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching today\'s schedule:', error);
    console.error('Error details:', error.stack);
    
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching today\'s schedule',
      error: error.message 
    });
  }
};

export const getCategoryDistribution = async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Call the get_category_distribution database function with the user's ID
    const query = `SELECT * FROM get_category_distribution($1)`;
    const result = await db.query(query, [userId]);
    
    // The function returns rows in format (category_name, category_percentage)
    const categoryData = result.rows.map(row => {
      // Extract category name and percentage from each row
      const categoryName = row.category_name || 'Other';
      const percentage = parseFloat(row.category_percentage) || 0;
      
      return {
        category: categoryName,
        percentage
      };
    });
    
    res.status(200).json({
      success: true,
      categoryData
    });
    
  } catch (error) {
    console.error('Error fetching category distribution:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching category distribution',
      error: error.message 
    });
  }
};

/**
 * Get recent user activity log with pagination
 * Handles timezone conversion (UTC+0 to client timezone)
 */
export const getUserActivityLog = async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  
  try {
    // Get timezone offset from request header (in minutes)
    const clientTimezoneOffset = req.headers['x-timezone-offset'] ? 
      parseInt(req.headers['x-timezone-offset']) : 
      300; // Default to +5 hours (300 minutes) for Pakistan if not provided
    
    // Convert minutes to hours for the interval
    const offsetHours = clientTimezoneOffset / 60;
    
    // Fetch activities with pagination and convert timestamp to client timezone
    const activitiesQuery = `
      SELECT 
        ual.id,
        ual.activity_type,
        ual.activity_id,
        ual.title,
        ual.operation,
        -- Convert UTC time to client timezone by adding the offset
        (ual.performed_at AT TIME ZONE 'UTC') AT TIME ZONE 'UTC' + INTERVAL '${offsetHours} hours' AS performed_at_local,
        ual.performed_at AS performed_at_utc
      FROM user_activity_log ual
      WHERE ual.user_id = $1
      ORDER BY ual.performed_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const countQuery = `
      SELECT COUNT(*) FROM user_activity_log WHERE user_id = $1
    `;
    
    const [activitiesResult, countResult] = await Promise.all([
      db.query(activitiesQuery, [userId, limit, offset]),
      db.query(countQuery, [userId])
    ]);
    
    const activities = activitiesResult.rows;
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    
    // Format the time display for each activity
    const formattedActivities = activities.map(activity => {
      // Format the timestamp using client timezone
      const timestamp = new Date(activity.performed_at_local);
      
      // Get time formatted as 12-hour with AM/PM
      const timeFormatted = timestamp.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      
      // Format the date display based on how recent it is
      const now = new Date();
      const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const activityDate = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate());
      const diffDays = Math.floor((todayDate - activityDate) / (1000 * 60 * 60 * 24));
      
      let dateDisplay;
      if (diffDays === 0) {
        dateDisplay = 'Today';
      } else if (diffDays === 1) {
        dateDisplay = 'Yesterday';
      } else if (diffDays < 7) {
        dateDisplay = `${diffDays} days ago`;
      } else {
        dateDisplay = timestamp.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: timestamp.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
      }
      
      // Format readable description based on operation type
      let description;
      switch (activity.operation) {
        case 'insert':
          description = `Created new ${activity.activity_type} "${activity.title}"`;
          break;
        case 'update':
          description = `Updated ${activity.activity_type} "${activity.title}"`;
          break;
        case 'complete':
          description = `Completed "${activity.title}" ${activity.activity_type}`;
          break;
        case 'delete':
          description = `Deleted ${activity.activity_type} "${activity.title}"`;
          break;
        default:
          description = `${activity.operation} ${activity.activity_type} "${activity.title}"`;
      }
      
      return {
        id: activity.id,
        type: activity.activity_type,
        description,
        time: `${dateDisplay}, ${timeFormatted}`,
        timestamp: activity.performed_at_local,
        activityId: activity.activity_id
      };
    });
    
    res.status(200).json({
      success: true,
      data: {
        activities: formattedActivities,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasMore: page < totalPages
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching user activity log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity log',
      error: error.message
    });
  }
};

export default {
  getWeeklyActivity,
  getProductivityTrend,
  getTodaySchedule,
  getCategoryDistribution,
  getUserActivityLog
}; 