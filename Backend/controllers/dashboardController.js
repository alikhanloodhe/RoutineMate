import db from '../config/db.js';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

// Configure dayjs to use timezone plugin
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Get weekly activity data (completed routines, tasks, and habits per day)
 * for the last 7 days
 */
export const getWeeklyActivity = async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Timezone constants - explicitly handling the 5-hour offset (Pakistan Standard Time/UTC+5)
    const DB_TO_CLIENT_HOURS = 5; // Hours to add to DB time to get client time
    
    // Extract the client's timezone offset if provided in the request header
    const clientTimezoneOffset = req.headers['x-timezone-offset'] ? 
      parseInt(req.headers['x-timezone-offset']) : 
      0; // Default to 0 if not provided
    
    // Calculate date range based on client's timezone
    // Get current date with time set to end of day to ensure today is fully included
    const clientDate = new Date();
    
    // Apply timezone offset - positive value adds to UTC
    clientDate.setTime(clientDate.getTime() + clientTimezoneOffset * 60 * 1000);
    
    // Create the correct date range with today fully included
    const endOfClientDay = new Date(clientDate);
    endOfClientDay.setHours(23, 59, 59, 999); // End of today in client's timezone
    
    const startOfClientDay = new Date(clientDate);
    startOfClientDay.setHours(0, 0, 0, 0); // Start of today in client's timezone
    
    // Calculate dates for the last 7 days including today
    const dateRange = [];
    
    // Helper for consistent date formatting - define it here before using it
    function formatDate(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    
    // Double-check the last date in range (should be today)
    const todayFormatted = formatDate(clientDate);
    
    // Calculate each day in range and ensure today is included
    // We want 7 days ENDING WITH today, not starting 7 days ago
    for (let i = 6; i >= 0; i--) {
      const date = new Date(clientDate);
      date.setDate(clientDate.getDate() - i);
      const formattedDate = formatDate(date);
      dateRange.push(formattedDate);
    }
    
    // IMPORTANT: Verify that the last date in range is today
    if (dateRange[dateRange.length-1] !== todayFormatted) {
      // Fix the date range to ensure it ends with today
      dateRange[dateRange.length-1] = todayFormatted;
    }
    
    // Create the dates needed for SQL queries
    const firstDateObj = new Date(dateRange[0]);
    firstDateObj.setHours(0, 0, 0, 0);
    const sevenDaysAgoFormatted = firstDateObj.toISOString();
    
    const lastDateObj = new Date(dateRange[dateRange.length-1]);
    lastDateObj.setHours(23, 59, 59, 999);
    const endOfDayFormatted = lastDateObj.toISOString();
    
    // Today's date in client's timezone for comparison
    const clientToday = todayFormatted;
    
    // Modify the task_completions query
    const query = `
      WITH date_range AS (
        SELECT generate_series(
          $1::timestamp, 
          $2::timestamp, 
          '1 day'::interval
        )::date AS day
      ),
      
      -- Force today's date to be included in the results even if it's outside the date range
      today_date AS (
        SELECT $4::date AS day
      ),
      
      -- Combine date range with today to ensure today is included
      all_dates AS (
        SELECT day FROM date_range
        UNION
        SELECT day FROM today_date
      ),
      
      -- Completed routines per day with direct timezone conversion
      routine_completions AS (
        SELECT 
          -- Direct timezone conversion - add 5 hours and check if date changed
          DATE(rch.completion_date + INTERVAL '${DB_TO_CLIENT_HOURS} hours') AS day,
          COUNT(*) AS count
        FROM routine_completion_history rch
        JOIN routines r ON rch.routine_id = r.routine_id
        WHERE r.user_id = $3
          AND rch.completed = TRUE
          AND rch.completion_date >= $1::timestamp - INTERVAL '1 day' 
          AND rch.completion_date <= $2::timestamp + INTERVAL '1 day'
        GROUP BY day
      ),
      
      -- Completed tasks per day with direct timezone conversion
      task_completions AS (
        SELECT 
          -- Direct timezone conversion - add 5 hours and check if date changed
          DATE(updated_at + INTERVAL '${DB_TO_CLIENT_HOURS} hours') AS day,
          COUNT(*) AS count
        FROM tasks
        WHERE user_id = $3
          AND status = 'completed'
          AND updated_at >= $1::timestamp - INTERVAL '1 day'
          AND updated_at <= $2::timestamp + INTERVAL '1 day'
        GROUP BY day
      ),
      
      -- Alternate tasks query using client's specific today date with direct timezone conversion
      -- This specifically checks for today's tasks
      task_completions_today AS (
        SELECT 
          $4::date AS day,
          COUNT(*) AS count
        FROM tasks
        WHERE user_id = $3
          AND status = 'completed'
          AND (
            -- Use the date after applying timezone offset
            DATE(updated_at + INTERVAL '${DB_TO_CLIENT_HOURS} hours') = $4::date
          )
      ),
      
      -- Completed habits per day (no change needed - habits already work correctly)
      habit_completions AS (
        SELECT 
          date::date AS day,
          COUNT(*) AS count
        FROM habit_tracking ht
        JOIN habits h ON ht.habit_id = h.id
        WHERE h.user_id = $3
          AND ht.completed = TRUE
          AND date >= $1::date
          AND date <= $2::date
        GROUP BY day
      ),
      
      -- Habits specific to today (no change needed - habits already work correctly)
      habit_completions_today AS (
        SELECT 
          $4::date AS day,
          COUNT(*) AS count
        FROM habit_tracking ht
        JOIN habits h ON ht.habit_id = h.id
        WHERE h.user_id = $3
          AND ht.completed = TRUE
          AND ht.date = $4::date
      ),
      
      -- Special query for Saturday's data with direct timezone conversion
      saturday_tasks AS (
        SELECT 
          $4::date AS day,
          COUNT(*) AS count
        FROM tasks
        WHERE user_id = $3
          AND status = 'completed'
          AND DATE(updated_at + INTERVAL '${DB_TO_CLIENT_HOURS} hours') = $4::date
          AND EXTRACT(DOW FROM $4::date) = 6  -- 6 = Saturday in PostgreSQL
      ),
      
      saturday_habits AS (
        SELECT 
          $4::date AS day,
          COUNT(*) AS count
        FROM habit_tracking ht
        JOIN habits h ON ht.habit_id = h.id
        WHERE h.user_id = $3
          AND ht.completed = TRUE
          AND ht.date = $4::date
          AND EXTRACT(DOW FROM $4::date) = 6  -- 6 = Saturday in PostgreSQL
      )
      
      -- Combine all data with the date range to ensure we have entries for all days
      SELECT 
        ad.day::text,
        COALESCE(rc.count, 0) AS routines_count,
        COALESCE(tc.count, 0) AS tasks_count,
        
        -- For today's date, use the specific today query as first priority
        CASE 
          WHEN ad.day = $4::date AND EXTRACT(DOW FROM $4::date) = 6 THEN COALESCE(st.count, tct.count, tc.count, 0)
          WHEN ad.day = $4::date THEN COALESCE(tct.count, tc.count, 0)
          ELSE COALESCE(tc.count, 0)
        END AS tasks_count_today,
        
        -- For today's date, use the specific today query as first priority
        CASE 
          WHEN ad.day = $4::date AND EXTRACT(DOW FROM $4::date) = 6 THEN COALESCE(sh.count, hct.count, hc.count, 0)
          WHEN ad.day = $4::date THEN COALESCE(hct.count, hc.count, 0)
          ELSE COALESCE(hc.count, 0)
        END AS habits_count_today
      FROM all_dates ad
      LEFT JOIN routine_completions rc ON ad.day = rc.day
      LEFT JOIN task_completions tc ON ad.day = tc.day
      LEFT JOIN habit_completions hc ON ad.day = hc.day
      LEFT JOIN task_completions_today tct ON ad.day = tct.day
      LEFT JOIN habit_completions_today hct ON ad.day = hct.day
      LEFT JOIN saturday_tasks st ON ad.day = st.day
      LEFT JOIN saturday_habits sh ON ad.day = sh.day
      ORDER BY ad.day ASC
    `;
    
    const result = await db.query(query, [
      dateRange[0],
      dateRange[dateRange.length-1],
      userId,
      todayFormatted
    ]);
    
    // Transform the data into a format suitable for the frontend chart
    const weeklyData = result.rows.map(row => {
      // Check if this row is for client's today
      const isToday = row.day === clientToday;
      
      // For today, always use the tasks_count_today value which is specifically focused on today's tasks
      // We want to prioritize any tasks that should appear today
      return {
        date: row.day,
        routines: parseInt(row.routines_count),
        tasks: parseInt(row.tasks_count_today || 0),
        tasksAlt: parseInt(row.tasks_count || 0),
        habits: parseInt(row.habits_count_today || row.habits_count || 0),
        dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(row.day).getDay()]
      };
    });
    
    // Also calculate the daily average for each activity type
    const totals = weeklyData.reduce(
      (acc, day) => {
        acc.routines += day.routines;
        acc.tasks += day.tasks;
        acc.tasksAlt += day.tasksAlt;
        acc.habits += day.habits;
        return acc;
      },
      { routines: 0, tasks: 0, tasksAlt: 0, habits: 0 }
    );
    
    const averages = {
      routines: parseFloat((totals.routines / 7).toFixed(1)),
      tasks: parseFloat((totals.tasks / 7).toFixed(1)),
      tasksAlt: parseFloat((totals.tasksAlt / 7).toFixed(1)),
      habits: parseFloat((totals.habits / 7).toFixed(1))
    };
    
    // Ensure correct order of days (oldest to newest)
    weeklyData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Send timezone-adjusted data back to client
    res.status(200).json({
      weeklyData,
      averages,
      dateRange, // Include expected date range for debugging
      clientToday, // Send today's date to help frontend synchronize
    });
    
  } catch (error) {
    console.error('Error fetching weekly activity:', error);
    res.status(500).json({ message: 'Server error while fetching weekly activity data' });
  }
};

/**
 * Get productivity trend data for the last 4 weeks
 * Calculates completion rates as a percentage of tasks, routines, and habits completed
 * out of total scheduled/created, taking into account when the user created their account
 */
export const getProductivityTrend = async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Timezone constants - explicitly handling the 5-hour offset (Pakistan Standard Time/UTC+5)
    const DB_TO_CLIENT_HOURS = 5; // Hours to add to DB time to get client time
    
    // Get the current date in client's timezone
    const clientTimezoneOffset = req.headers['x-timezone-offset'] ? 
      parseInt(req.headers['x-timezone-offset']) : 
      0;
    
    // Current client date adjusted for timezone
    const currentDate = new Date();
    currentDate.setTime(currentDate.getTime() + clientTimezoneOffset * 60 * 1000);
    
    // First, get the user's account creation date
    const userQuery = `
      SELECT created_at FROM users WHERE id = $1
    `;
    
    const userResult = await db.query(userQuery, [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's account creation date
    const userCreatedAt = new Date(userResult.rows[0].created_at);
    
    // Determine the actual start date (either 28 days ago or user creation date, whichever is more recent)
    const startDate = new Date(Math.max(
      userCreatedAt.getTime(),
      new Date(currentDate).setDate(currentDate.getDate() - 27)
    ));
    startDate.setHours(0, 0, 0, 0);
    
    const startDateFormatted = startDate.toISOString().split('T')[0]; 
    
    // We'll get data separately for each week to ensure accurate weekly aggregation
    const weeklyTasksQuery = `
      -- Get tasks created and completed per week for the last 4 weeks
      WITH date_series AS (
        SELECT generate_series($1::date, current_date, interval '1 day')::date AS day
      ),
      week_dates AS (
        SELECT
          date_trunc('week', day)::date AS week_start,
          to_char(date_trunc('week', day), 'YYYY-MM-DD') AS week_label
        FROM date_series
        GROUP BY date_trunc('week', day)
        ORDER BY date_trunc('week', day) DESC
        LIMIT 4
      )
      
      SELECT
        wd.week_label,
        -- Count tasks created before the end of this week
        COUNT(DISTINCT t.task_id) FILTER (
          WHERE t.user_id = $2 
          AND t.created_at::date <= (wd.week_start + interval '6 days')::date
        ) AS total_tasks,
        -- Count tasks completed during this week, with timezone adjustment
        COUNT(DISTINCT t.task_id) FILTER (
          WHERE t.user_id = $2 
          AND t.status = 'completed'
          AND DATE(t.updated_at + INTERVAL '${DB_TO_CLIENT_HOURS} hours')::date >= wd.week_start::date
          AND DATE(t.updated_at + INTERVAL '${DB_TO_CLIENT_HOURS} hours')::date <= (wd.week_start + interval '6 days')::date
        ) AS completed_this_week,
        -- Count tasks that were due this week
        COUNT(DISTINCT t.task_id) FILTER (
          WHERE t.user_id = $2 
          AND t.due_date IS NOT NULL
          AND t.due_date >= wd.week_start::date
          AND t.due_date <= (wd.week_start + interval '6 days')::date
        ) AS due_this_week
      FROM week_dates wd
      LEFT JOIN tasks t ON true
      GROUP BY wd.week_label, wd.week_start
      ORDER BY wd.week_start DESC
    `;
    
    const weeklyRoutinesQuery = `
      -- Get routines scheduled and completed per week for the last 4 weeks
      WITH date_series AS (
        SELECT generate_series($1::date, current_date, interval '1 day')::date AS day
      ),
      week_dates AS (
        SELECT
          date_trunc('week', day)::date AS week_start,
          to_char(date_trunc('week', day), 'YYYY-MM-DD') AS week_label
        FROM date_series
        GROUP BY date_trunc('week', day)
        ORDER BY date_trunc('week', day) DESC
        LIMIT 4
      )
      
      SELECT
        wd.week_label,
        -- Count routines created before the end of this week
        COUNT(DISTINCT r.routine_id) FILTER (
          WHERE r.user_id = $2 
          AND r.created_at::date <= (wd.week_start + interval '6 days')::date
        ) AS total_routines,
        -- Count routines completed during this week, with timezone adjustment
        COUNT(DISTINCT rch.routine_id) FILTER (
          WHERE r.user_id = $2
          AND rch.completed = TRUE
          AND DATE(rch.completion_date + INTERVAL '${DB_TO_CLIENT_HOURS} hours')::date >= wd.week_start::date
          AND DATE(rch.completion_date + INTERVAL '${DB_TO_CLIENT_HOURS} hours')::date <= (wd.week_start + interval '6 days')::date
        ) AS completed_this_week
      FROM week_dates wd
      LEFT JOIN routines r ON true
      LEFT JOIN routine_completion_history rch ON rch.routine_id = r.routine_id
      GROUP BY wd.week_label, wd.week_start
      ORDER BY wd.week_start DESC
    `;
    
    const weeklyHabitsQuery = `
      -- Get habits tracked and completed per week for the last 4 weeks
      WITH date_series AS (
        SELECT generate_series($1::date, current_date, interval '1 day')::date AS day
      ),
      week_dates AS (
        SELECT
          date_trunc('week', day)::date AS week_start,
          to_char(date_trunc('week', day), 'YYYY-MM-DD') AS week_label
        FROM date_series
        GROUP BY date_trunc('week', day)
        ORDER BY date_trunc('week', day) DESC
        LIMIT 4
      )
      
      SELECT
        wd.week_label,
        -- Count habits created before the end of this week
        COUNT(DISTINCT h.id) FILTER (
          WHERE h.user_id = $2 
          AND h.created_at::date <= (wd.week_start + interval '6 days')::date
        ) AS total_habits,
        -- Count DISTINCT habit+date combinations completed during this week
        -- This prevents multiple toggles from creating duplicate counts
        COUNT(DISTINCT (h.id, ht.date)) FILTER (
          WHERE h.user_id = $2
          AND ht.completed = TRUE
          AND ht.date >= wd.week_start::date
          AND ht.date <= (wd.week_start + interval '6 days')::date
        ) AS completed_this_week,
        -- Count habit tracking opportunities this week
        COUNT(DISTINCT (h.id, ht.date)) FILTER (
          WHERE h.user_id = $2
          AND ht.date >= wd.week_start::date
          AND ht.date <= (wd.week_start + interval '6 days')::date
        ) AS tracking_opportunities
      FROM week_dates wd
      LEFT JOIN habits h ON true
      LEFT JOIN habit_tracking ht ON ht.habit_id = h.id
      GROUP BY wd.week_label, wd.week_start
      ORDER BY wd.week_start DESC
    `;
    
    // Run all queries in parallel for better performance
    const [tasksResult, routinesResult, habitsResult] = await Promise.all([
      db.query(weeklyTasksQuery, [startDateFormatted, userId]),
      db.query(weeklyRoutinesQuery, [startDateFormatted, userId]), 
      db.query(weeklyHabitsQuery, [startDateFormatted, userId])
    ]);
    
    // Create a map to merge data from different queries by week label
    const weekMap = new Map();
    
    // Calculate how many full weeks we have data for (max 4)
    const daysSinceCreation = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const fullWeeks = Math.min(4, Math.ceil(daysSinceCreation / 7));
    
    // Process tasks data
    tasksResult.rows.forEach(row => {
      if (!weekMap.has(row.week_label)) {
        weekMap.set(row.week_label, {
          week_label: row.week_label,
          tasks: { total: 0, completed: 0, due: 0 },
          routines: { total: 0, completed: 0 },
          habits: { total: 0, completed: 0, opportunities: 0 }
        });
      }
      
      const weekData = weekMap.get(row.week_label);
      weekData.tasks.total = parseInt(row.total_tasks) || 0;
      weekData.tasks.completed = parseInt(row.completed_this_week) || 0;
      weekData.tasks.due = parseInt(row.due_this_week) || 0;
    });
    
    // Process routines data
    routinesResult.rows.forEach(row => {
      if (!weekMap.has(row.week_label)) {
        weekMap.set(row.week_label, {
          week_label: row.week_label,
          tasks: { total: 0, completed: 0, due: 0 },
          routines: { total: 0, completed: 0 },
          habits: { total: 0, completed: 0, opportunities: 0 }
        });
      }
      
      const weekData = weekMap.get(row.week_label);
      weekData.routines.total = parseInt(row.total_routines) || 0;
      weekData.routines.completed = parseInt(row.completed_this_week) || 0;
    });
    
    // Process habits data
    habitsResult.rows.forEach(row => {
      if (!weekMap.has(row.week_label)) {
        weekMap.set(row.week_label, {
          week_label: row.week_label,
          tasks: { total: 0, completed: 0, due: 0 },
          routines: { total: 0, completed: 0 },
          habits: { total: 0, completed: 0, opportunities: 0 }
        });
      }
      
      const weekData = weekMap.get(row.week_label);
      weekData.habits.total = parseInt(row.total_habits) || 0;
      weekData.habits.completed = parseInt(row.completed_this_week) || 0;
      weekData.habits.opportunities = parseInt(row.tracking_opportunities) || 0;
    });
    
    // If we have no data for any weeks, return default values
    if (weekMap.size === 0) {
      return res.status(200).json({
        weeklyData: [0, 0, 0, 0],
        change: 0,
        detailedStats: Array(4).fill().map((_, i) => ({
          week: i + 1,
          productivityScore: 0,
          tasks: { completed: 0, total: 0, due: 0 },
          routines: { completed: 0, total: 0 },
          habits: { completed: 0, total: 0, opportunities: 0 },
          hasData: false
        })),
        isNewUser: true
      });
    }
    
    // Convert the week map to an array, padded to ensure 4 weeks
    const weeklyStats = [];
    const weekMapArray = Array.from(weekMap.values());
    
    // First, fill in the stats for weeks we have data for
    for (let i = 0; i < Math.min(4, weekMapArray.length); i++) {
      const weekData = weekMapArray[i];
      
      // Calculate the weighted productivity score for this week
      // We base the score on:
      // 1. Completed tasks as % of due tasks (or total tasks if no due date)
      // 2. Completed routines 
      // 3. Completed habits as % of tracking opportunities
      
      let taskScore = 0;
      let routineScore = 0;
      let habitScore = 0;
      
      // Task productivity: Based on due tasks (or total tasks if no due tasks)
      const taskDenominator = weekData.tasks.due > 0 ? weekData.tasks.due : weekData.tasks.total;
      if (taskDenominator > 0) {
        taskScore = Math.min(100, Math.round((weekData.tasks.completed / taskDenominator) * 100));
      }
      
      // Routine productivity: Based on completed routines
      if (weekData.routines.total > 0) {
        routineScore = Math.min(100, Math.round((weekData.routines.completed / weekData.routines.total) * 100));
      }
      
      // Habit productivity: Based on completed habit tracking entries
      if (weekData.habits.opportunities > 0) {
        habitScore = Math.min(100, Math.round((weekData.habits.completed / weekData.habits.opportunities) * 100));
      }
      
      // Calculate overall score with weighting - more weight to components with more data
      let weights = {
        tasks: taskDenominator > 0 ? taskDenominator : 0,
        routines: weekData.routines.total,
        habits: weekData.habits.opportunities
      };
      
      // Calculate total weight
      const totalWeight = weights.tasks + weights.routines + weights.habits;
      
      // Calculate weighted score
      let productivityScore = 0;
      if (totalWeight > 0) {
        productivityScore = Math.round(
          (taskScore * weights.tasks + 
           routineScore * weights.routines + 
           habitScore * weights.habits) / totalWeight
        );
      }
      
      // Limit productivity score to 100% maximum
      productivityScore = Math.min(100, productivityScore);
      
      // Store the weekly stats
      weeklyStats.push({
        week: i + 1,
        weekLabel: weekData.week_label,
        productivityScore,
        taskScore,
        routineScore,
        habitScore,
        tasks: { 
          completed: weekData.tasks.completed,
          total: weekData.tasks.total,
          due: weekData.tasks.due
        },
        routines: {
          completed: weekData.routines.completed,
          total: weekData.routines.total
        },
        habits: {
          completed: weekData.habits.completed,
          total: weekData.habits.total,
          opportunities: weekData.habits.opportunities
        },
        hasData: true,
        hasRealData: totalWeight > 0
      });
    }
    
    // Fill in remaining weeks if we have less than 4
    for (let i = weekMapArray.length; i < 4; i++) {
      weeklyStats.push({
        week: i + 1,
        weekLabel: null,
        productivityScore: null, // null indicates no data for this week
        taskScore: 0,
        routineScore: 0,
        habitScore: 0,
        tasks: { completed: 0, total: 0, due: 0 },
        routines: { completed: 0, total: 0 },
        habits: { completed: 0, total: 0, opportunities: 0 },
        hasData: false,
        hasRealData: false
      });
    }
    
    // Get weekly scores for the chart, replacing null with 0
    const weeklyScores = weeklyStats.map(week => week.productivityScore === null ? 0 : week.productivityScore);
    
    // Calculate the change between the two most recent weeks with real data
    let change = 0;
    const weeksWithRealData = weeklyStats.filter(w => w.hasRealData);
    if (weeksWithRealData.length >= 2) {
      const currentWeek = weeksWithRealData[0].productivityScore;
      const previousWeek = weeksWithRealData[1].productivityScore;
      
      // Calculate relative change (limit to reasonable values)
      change = currentWeek - previousWeek;
    }
    
    // Return the results
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
 */
export const getTodaySchedule = async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Timezone constants - explicitly handling the 5-hour offset (Pakistan Standard Time/UTC+5)
    const DB_TO_CLIENT_HOURS = 5; // Hours to add to DB time to get client time
    
    // Extract the client's timezone offset if provided in the request header
    const clientTimezoneOffset = req.headers['x-timezone-offset'] ? 
      parseInt(req.headers['x-timezone-offset']) : 
      0; // Default to 0 if not provided
    
    // Calculate today's date in client's timezone
    const clientDate = new Date();
    
    // Apply timezone offset - positive value adds to UTC
    clientDate.setTime(clientDate.getTime() + clientTimezoneOffset * 60 * 1000);
    
    const startOfClientDay = new Date(clientDate);
    startOfClientDay.setHours(0, 0, 0, 0);
    
    const endOfClientDay = new Date(clientDate);
    endOfClientDay.setHours(23, 59, 59, 999);
    
    // Format dates for PostgreSQL - use full ISO date for timestamp comparisons
    const todayFormatted = startOfClientDay.toISOString().split('T')[0];
    const endOfDayFormatted = endOfClientDay.toISOString();
    const dayOfWeek = clientDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayDayName = dayNames[dayOfWeek];
    
    // Check what day values we have in the database
    const daysDebugQuery = `SELECT * FROM days`;
    const daysDebugResult = await db.query(daysDebugQuery);
    
    // Get today's date in client's timezone for comparison
    function formatDateForPostgres(date) {
      return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
    }
    
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
    
    // Format today's date for PostgreSQL
    const todayFormattedPostgres = formatDateForPostgres(clientDate);
    
    // Create an alternate date format specifically for habits using dayjs
    let todayFormattedPostgresforhabits;
    try {
      // Use the already timezone-adjusted clientDate instead of creating a new date with dayjs
      // This ensures consistency with other date calculations in the code
      todayFormattedPostgresforhabits = formatDateForPostgres(clientDate);
    } catch (error) {
      console.error('Error formatting date for habits:', error);
      todayFormattedPostgresforhabits = todayFormattedPostgres;
    }
    
    // 1. Simple query for routines scheduled for today
    const routinesQuery = `
      SELECT 
        r.routine_id,
        r.title,
        r.start_time,
        r.end_time,
        r.category_id,
        r.priority_id,
        'routine' AS type,
        (
          SELECT EXISTS(
            SELECT 1 FROM routine_completion_history rch 
            WHERE rch.routine_id = r.routine_id 
            AND DATE(rch.completion_date + INTERVAL '${DB_TO_CLIENT_HOURS} hours') = $3::date 
            AND rch.completed = true
          )
        ) AS completed
      FROM routines r
      JOIN routine_days rd ON r.routine_id = rd.routine_id
      JOIN days d ON d.day_id = rd.day_id
      WHERE r.user_id = $1
        AND (
          d.days ILIKE $2 
          OR d.days ILIKE SUBSTRING($2, 1, 3) -- Match 3-letter abbreviations (Mon, Tue, etc.)
          OR SUBSTRING(d.days, 1, 3) ILIKE SUBSTRING($2, 1, 3) -- Match full names with abbreviations
        )
      ORDER BY r.start_time ASC
    `;
    
    // 2. Improved query for tasks due today with better date handling - don't exclude completed tasks
    const tasksQuery = `
      SELECT 
        task_id,
        name AS title,
        description,
        category_id,
        priority_id,
        status,
        due_date,
        'task' AS type,
        status = 'completed' AS completed
      FROM tasks
      WHERE user_id = $1
        AND (
          -- Match based on date in the client's timezone using the exact date string
          (due_date IS NOT NULL AND (
            -- Match using the date string directly (YYYY-MM-DD)
            to_char(due_date, 'YYYY-MM-DD') = $2
          ))
          -- Fall back to created_at for tasks without due date, with timezone adjustment
          OR (due_date IS NULL AND DATE(created_at + INTERVAL '${DB_TO_CLIENT_HOURS} hours')::date = $2::date)
        )
      ORDER BY priority_id ASC NULLS LAST, due_date ASC NULLS LAST
    `;
    
    // 3. Simple query for habits scheduled for today
    const habitsQuery = `
      SELECT 
        id AS habit_id,
        title,
        frequency,
        reminder_time,
        category_id,
        'habit' AS type,
        (
          SELECT EXISTS(
            SELECT 1 FROM habit_tracking ht 
            WHERE ht.habit_id = id 
            AND ht.date = $2::date 
            AND ht.completed = TRUE
          )
        )::boolean AS completed
      FROM habits
      WHERE user_id = $1
        AND (
          frequency = 'daily' 
          OR (
            frequency = 'weekly' 
            AND EXTRACT(DOW FROM $2::date) = $3
          )
        )
      ORDER BY reminder_time ASC NULLS LAST
    `;
    
    // 4. Improved query for goal milestones due today with better date handling
    const goalsQuery = `
      SELECT 
        g.goal_id,
        g.title AS goal_title,
        gm.milestone_id,
        gm.title AS milestone_title,
        gm.due_date,
        g.category_id,
        'goal' AS type,
        gm.status,
        gm.status != 'completed' AS active
      FROM goals g
      JOIN goal_milestones gm ON g.goal_id = gm.goal_id
      WHERE g.creator_id = $1
        AND to_char(gm.due_date, 'YYYY-MM-DD') = $2
      ORDER BY gm.due_date ASC
    `;
    
    // Execute all queries in parallel for better performance
    try {
      const [routinesResult, tasksResult, habitsResult, goalsResult] = await Promise.all([
        db.query(routinesQuery, [userId, todayDayName, todayFormattedPostgres]),
        db.query(tasksQuery, [userId, todayFormattedPostgres]),
        db.query(habitsQuery, [userId, todayFormattedPostgresforhabits, dayOfWeek]),
        db.query(goalsQuery, [userId, todayFormattedPostgres])
      ]);
      
      // Process routines with time slots
      const routinesWithTime = routinesResult.rows.map(routine => ({
        id: routine.routine_id,
        title: routine.title,
        time: routine.start_time ? new Date(`1970-01-01T${routine.start_time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : null,
        endTime: routine.end_time ? new Date(`1970-01-01T${routine.end_time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : null,
        type: 'routine',
        interval: `${new Date(`1970-01-01T${routine.start_time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - ${new Date(`1970-01-01T${routine.end_time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`,
        priority: routine.priority_id ? parseInt(routine.priority_id) : null,
        category: routine.category_id ? String(routine.category_id) : "Other",
        completed: convertPgBoolean(routine.completed)
      }));
      
      // Process habits with time
      const habitsWithTime = habitsResult.rows
        .filter(habit => habit.reminder_time)
        .map(habit => ({
          id: habit.habit_id,
          title: habit.title,
          type: 'habit',
          time: new Date(`1970-01-01T${habit.reminder_time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          category: habit.category_id ? String(habit.category_id) : "Other",
          completed: convertPgBoolean(habit.completed)
        }));
      
      // Process habits without time
      const habitsWithoutTime = habitsResult.rows
        .filter(habit => !habit.reminder_time)
        .map(habit => ({
          id: habit.habit_id,
          title: habit.title,
          type: 'habit',
          frequency: habit.frequency,
          category: habit.category_id ? String(habit.category_id) : "Other",
          completed: convertPgBoolean(habit.completed)
        }));
      
      // Process tasks
      const tasksWithoutTime = tasksResult.rows.map(task => ({
        id: task.task_id,
        title: task.title,
        description: task.description,
        type: 'task',
        priority: task.priority_id ? parseInt(task.priority_id) : null,
        category: task.category_id ? String(task.category_id) : "Other",
        completed: task.completed || task.status === 'completed',
        dueDate: task.due_date ? new Date(task.due_date).toLocaleDateString() : null,
        status: task.status
      }));
      
      // Process goals
      const goalsWithoutTime = goalsResult.rows.map(goal => ({
        id: goal.milestone_id || goal.goal_id,
        title: goal.milestone_title ? `${goal.goal_title}: ${goal.milestone_title}` : goal.goal_title,
        type: 'goal',
        category: goal.category_id ? String(goal.category_id) : "Other",
        dueDate: goal.due_date ? new Date(goal.due_date).toLocaleDateString() : null,
        completed: !goal.active,
        status: goal.status
      }));
      
      // Combine all items WITH time slots into a single schedule
      const schedule = [
        ...routinesWithTime,
        ...habitsWithTime
      ];
      
      // Sort schedule by time
      schedule.sort((a, b) => {
        if (!a.time) return 1;
        if (!b.time) return -1;
        
        // Simple string comparison for times
        return a.time.localeCompare(b.time);
      });
      
      // Ensure all completed properties are proper booleans
      const allItems = [...schedule, ...tasksWithoutTime, ...habitsWithoutTime, ...goalsWithoutTime];
      allItems.forEach(item => {
        // Convert any non-boolean completed values to booleans
        if (typeof item.completed !== 'boolean') {
          item.completed = Boolean(item.completed);
        }
      });
      
      // Check for any items with null or undefined categories
      const itemsWithInvalidCategories = allItems.filter(item => item.category === null || item.category === undefined);
      if (itemsWithInvalidCategories.length > 0) {
        // Fix any invalid categories
        itemsWithInvalidCategories.forEach(item => {
          item.category = "Other";
        });
      }
      
      res.status(200).json({
        success: true,
        data: {
          schedule,
          tasksWithoutTime,
          habitsWithoutTime,
          goalsWithoutTime,
          today: {
            date: clientDate.toISOString().split('T')[0], // Use clientDate for both formats
            dayOfWeek: todayDayName,
            fullDate: clientDate.toDateString() // Already using clientDate
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

export default {
  getWeeklyActivity,
  getProductivityTrend,
  getTodaySchedule,
  getCategoryDistribution
}; 