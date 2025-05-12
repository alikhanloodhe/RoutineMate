import pool from '../config/db.js';
import { getClientAdjustedTime, parseClientDate } from '../utils/timeUtils.js';

export const addTask = async (req, res) => {

  const user_id = req.user.id; 

  const { name, description, dueDate, category_id, priority_id, subtasks, status, estimatedHours, estimatedMinutes, estimated_time } = req.body;

  // Debug logging for the request body
  console.log('Request body in addTask:', req.body);
  console.log('Due date from request:', dueDate);

  // Get timezone-adjusted timestamp functions
  const { timestamp } = getClientAdjustedTime(req.clientTimezone?.name);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // If estimated_time was directly provided, use it
    let task_estimated_time = estimated_time;
    
    // If estimated_time is an object with formatted property, extract it
    if (task_estimated_time && typeof task_estimated_time === 'object' && task_estimated_time.formatted) {
      // Extract formatted time string or convert to proper interval format
      if (task_estimated_time.hours !== undefined && task_estimated_time.minutes !== undefined) {
        const hours = Number(task_estimated_time.hours || 0);
        const minutes = Number(task_estimated_time.minutes || 0);
        task_estimated_time = `${hours} hours ${minutes} minutes`;
      } else {
        // Use the formatted string directly if present
        task_estimated_time = task_estimated_time.formatted.replace('h', ' hours').replace('m', ' minutes');
      }
    }
    
    // If not provided but we have hours or minutes, create it
    if ((!task_estimated_time || task_estimated_time === '') && (estimatedHours !== undefined || estimatedMinutes !== undefined)) {
      const hours = Number(estimatedHours || 0);
      const minutes = Number(estimatedMinutes || 0);
      task_estimated_time = `${hours} hours ${minutes} minutes`;
    }
    


    // 2. Insert task
    const insertTaskResult = await client.query(
      'INSERT INTO tasks(user_id,name, description,category_id, priority_id,status,estimated_time,due_date) VALUES($1, $2, $3,$4, $5, $6, $7,$8) RETURNING task_id',
      [user_id, name, description, category_id, priority_id, status, task_estimated_time, dueDate]
    );
    const task_id = insertTaskResult.rows[0].task_id;



    // 4. Insert subtasks
    if (Array.isArray(subtasks) && subtasks.length > 0) {
      for (let i = 0; i < subtasks.length; i++) {
        await client.query(
          'INSERT INTO subtasks(task_id, name, status) VALUES($1, $2, $3)',
          [task_id, subtasks[i].title || subtasks[i].name, subtasks[i].status || (subtasks[i].completed ? 'completed' : 'pending')]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Task, tags, and subtasks added successfully', taskId: task_id });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Error adding task', error: err.message });
  } finally {
    client.release();
  }
};

export const fetchTasks = async (req, res) => {
  const userId = req.user.id;
  const client = await pool.connect();

  try {
     const result = await client.query(`
      SELECT 
        t.task_id,
        t.name AS title,
        t.description,
        t.due_date,
        t.status,
        t.estimated_time,
        t.created_at,
        c.name AS category,
        p.name AS priority,
        ts.duration AS time_spent,
        COALESCE(
          json_agg(
            json_build_object(
              'id', sb.subtask_id,
              'title', sb.name,
              'completed', sb.status = 'completed'
            )
          ) FILTER (WHERE sb.subtask_id IS NOT NULL), '[]'
        ) AS subtasks
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN priorities p ON t.priority_id = p.id
      LEFT JOIN (
        SELECT task_id, SUM(duration) AS duration
        FROM task_sessions
        WHERE user_id = $1
        GROUP BY task_id
      ) ts ON t.task_id = ts.task_id
      LEFT JOIN subtasks sb ON t.task_id = sb.task_id
      WHERE t.user_id = $1
      GROUP BY t.task_id, c.name, p.name, ts.duration
    `, [userId]);

    const tasks = result.rows.map(row => ({
      id: row.task_id,
      title: row.title,
      description: row.description,
      dueDate: row.due_date,
      estimated_time: formatInterval(row.estimated_time),
      completed: row.status === 'completed',
      status: row.status,
      category: row.category,
      priority: row.priority,
      timeSpent: row.time_spent ? formatInterval(row.time_spent) : '0h 0m',
      createdAt: new Date(row.created_at).getTime(),
      subtasks: row.subtasks
    }));

    res.status(200).json(tasks);

  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  } finally {
    client.release();
  }
};

function formatInterval(interval) {
  if (!interval) {
    return { hours: 0, minutes: 0, formatted: '0h 0m' };
  }

  // Handle string format like "X hours Y minutes"
  if (typeof interval === 'string') {
    const hoursMatch = interval.match(/(\d+)\s*hours?/);
    const minutesMatch = interval.match(/(\d+)\s*minutes?/);
    
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
    
    return { hours, minutes, formatted: `${hours}h ${minutes}m` };
  }
  
  // Handle PostgreSQL interval object
  if (typeof interval === 'object') {
    const hours = interval.hours || 0;
    const minutes = interval.minutes || 0;
    const days = interval.days || 0;
    
    const totalHours = hours + (days * 24);
    const formatted = `${totalHours}h ${minutes}m`;
    
    return { hours: totalHours, minutes, formatted };
  }

  return { hours: 0, minutes: 0, formatted: '0h 0m' };
}

export const deleteTask = async (req, res) => {
  const { task_id } = req.params;
  const user_id = req.user.id;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // First check if the task exists and belongs to the user
    const taskResult = await client.query(
      'SELECT * FROM tasks WHERE task_id = $1 AND user_id = $2',
      [task_id, user_id]
    );
    
    if (taskResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Task not found or you do not have permission to delete it' });
    }
    
    // Delete associated task sessions
    await client.query('DELETE FROM task_sessions WHERE task_id = $1', [task_id]);
    
    // Delete associated subtasks (this should cascade automatically due to the FK constraint, but being explicit)
    await client.query('DELETE FROM subtasks WHERE task_id = $1', [task_id]);
    
    // Delete the task
    await client.query('DELETE FROM tasks WHERE task_id = $1', [task_id]);
    
    await client.query('COMMIT');
    res.status(200).json({ message: 'Task deleted successfully' });
  }
  catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  } finally {
    client.release();
  }
};

export const editTask = async (req, res) => {
  const user_id = req.user.id;
  const { task_id } = req.params;
  const { title, name, description, dueDate, priority, category, subtasks, status, estimatedHours, estimatedMinutes, estimated_time } = req.body;

  // Debug logging for request parameters
  console.log('Edit task request body:', req.body);
  console.log('Due date in edit task:', dueDate);

  // Get timezone-adjusted timestamp functions
  const { timestamp } = getClientAdjustedTime(req.clientTimezone?.name);

  const priorityText = priority.toUpperCase();
    const priorityResult = await pool.query('SELECT id FROM priorities where name = $1',[priorityText]);
    if (priorityResult.rows.length === 0) {
      throw new Error('Priority not found');
    }
    const priority_id = priorityResult.rows[0].id;
  const categoryText = category;
    const categoryResult = await pool.query('SELECT id FROM categories where name = $1',[categoryText]);
    if (categoryResult.rows.length === 0) {
      throw new Error('Category not found');
    }
    const category_id = categoryResult.rows[0].id;

  // Use the provided title/name (frontend might send either)
  const taskName = title || name;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // First check if the task exists and belongs to the user
    const taskResult = await client.query(
      'SELECT * FROM tasks WHERE task_id = $1 AND user_id = $2',
      [task_id, user_id]
    );
    
    if (taskResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Task not found or you do not have permission to edit it' });
    }
    
    // Use existing estimated_time if provided, otherwise calculate from hours/minutes
    let task_estimated_time = estimated_time;
    
    // If estimated_time is an object with formatted property, extract it
    if (task_estimated_time && typeof task_estimated_time === 'object' && task_estimated_time.formatted) {
      // Extract formatted time string or convert to proper interval format
      if (task_estimated_time.hours !== undefined && task_estimated_time.minutes !== undefined) {
        const hours = Number(task_estimated_time.hours || 0);
        const minutes = Number(task_estimated_time.minutes || 0);
        task_estimated_time = `${hours} hours ${minutes} minutes`;
      } else {
        // Use the formatted string directly if present
        task_estimated_time = task_estimated_time.formatted.replace('h', ' hours').replace('m', ' minutes');
      }
    }
    
    // If estimated_time is not provided but we have hours or minutes, create it
    if ((!task_estimated_time || task_estimated_time === '') && (estimatedHours !== undefined || estimatedMinutes !== undefined)) {
      const hours = Number(estimatedHours || 0);
      const minutes = Number(estimatedMinutes || 0);
      task_estimated_time = `${hours} hours ${minutes} minutes`;
    } 
    
    // Update task - use timezone-adjusted timestamp
    await client.query(
      `UPDATE tasks 
       SET name = $1, 
           description = $2, 
           due_date = $3, 
           priority_id = $4, 
           category_id = $5,
           status = $6,
           estimated_time = $7,
           updated_at = ${timestamp}
       WHERE task_id = $8 AND user_id = $9`,
      [taskName, description, dueDate, priority_id, category_id, status, task_estimated_time, task_id, user_id]
    );

    // Update subtasks if provided
    if (Array.isArray(subtasks) && subtasks.length > 0) {
      // Delete existing subtasks
      await client.query('DELETE FROM subtasks WHERE task_id = $1', [task_id]);
      
      // Insert new subtasks
      for (const subtask of subtasks) {
        await client.query(
          'INSERT INTO subtasks(task_id, name, status) VALUES($1, $2, $3)',
          [task_id, subtask.title || subtask.name, subtask.status || (subtask.completed ? 'completed' : 'pending')]
        );
      }
    }

    await client.query('COMMIT');
    res.status(200).json({ message: 'Task updated successfully' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Error updating task', error: err.message });
  } finally {
    client.release();
  }
};

export const startSession = async (req, res) => {
  const { taskId } = req.body;
  const userId = req.user.id;
  
  // Get timezone-adjusted timestamp functions
  const { now } = getClientAdjustedTime(req.clientTimezone?.name);
  
  try {
    // First check if there's an active session for this task
    const activeSession = await pool.query(
      `SELECT session_id FROM task_sessions 
       WHERE task_id = $1 AND user_id = $2 AND end_time IS NULL`,
      [taskId, userId]
    );
    
    // If there's already an active session, return it
    if (activeSession.rows.length > 0) {
      return res.status(200).json({
        message: 'Session already in progress',
        session_id: activeSession.rows[0]
      });
    }
    
    // Start a new session
    const result = await pool.query(
      `INSERT INTO task_sessions (task_id, user_id)
       VALUES ($1, $2)
       RETURNING session_id, start_time`,
      [taskId, userId]
    );

    res.status(201).json({
      message: 'Session started successfully',
      sessionData: result.rows[0]
    });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
};

export const endSession = async (req, res) => {
  const { sessionId, taskId, duration } = req.body;
  const userId = req.user.id;

  // Get timezone-adjusted timestamp functions
  const { now } = getClientAdjustedTime(req.clientTimezone?.name);
 
  const client =  await pool.connect();
  try {
    let result;
     await client.query('BEGIN')
    // If sessionId is provided, end that specific session
    if (sessionId) {
      // Calculate duration based on start and end times
      const sessionData = await client.query(
        `SELECT start_time FROM task_sessions 
         WHERE session_id = $1 AND user_id = $2 AND end_time IS NULL`,
        [sessionId, userId]
      );
      
      if (sessionData.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Session not found or already ended' });
      }
      
      // Set end_time to now with timezone adjustment
      result = await client.query(
        `UPDATE task_sessions
         SET end_time = ${now}
         WHERE session_id = $1 AND user_id = $2 AND end_time IS NULL
         RETURNING session_id, start_time, end_time, duration`,
        [sessionId, userId]
      );
    }
    // If taskId is provided, end the latest active session for that task
    else if (taskId && !duration) {
      // Calculate duration based on start and end times for the latest session
      const sessionData = await client.query(
        `SELECT session_id, start_time FROM task_sessions 
         WHERE task_id = $1 AND user_id = $2 AND end_time IS NULL
         ORDER BY start_time DESC LIMIT 1`,
        [taskId, userId]
      );
      
      if (sessionData.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'No active session found for this task' });
      }
      
      result = await client.query(
        `UPDATE task_sessions
         SET end_time = ${now}
         WHERE session_id = $1 AND end_time IS NULL
         RETURNING session_id, start_time, end_time, duration`,
        [sessionData.rows[0].session_id]
      );
    }
    // If duration is provided, create a completed session with the specified duration
    else if (duration && taskId) {
      const durationObj = parseHumanReadableDuration(duration);
      const durationInSeconds = durationObj.totalSeconds;
      
      // Calculate start time by subtracting duration from current time
      result = await client.query(
        `INSERT INTO task_sessions (task_id, user_id, start_time, end_time)
         VALUES ($1, $2, ${now} - INTERVAL '${durationInSeconds} seconds', ${now})
         RETURNING session_id, start_time, end_time, duration`,
        [taskId, userId]
      );
    }
    else {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Missing required parameters: either sessionId, taskId, or both taskId and duration are required' });
    }

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Session not found or already ended' });
    }

    await client.query('COMMIT'); // Commiting  the transcation if all operations are performed successfully
    res.status(200).json({
      message: 'Session ended successfully',
      sessionData: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error ending session:', error);
    res.status(500).json({ error: 'Failed to end session', details: error.message });
  }finally{
    client.release();
  }
};

// Helper function to parse duration like "2h 30m" or "2 hours 30 minutes" into seconds
function parseHumanReadableDuration(durationStr) {
  // Check if input is valid
  if (!durationStr || typeof durationStr !== 'string') {
    return { totalSeconds: 0, hours: 0, minutes: 0 };
  }
  
  let totalSeconds = 0;
  let hours = 0;
  let minutes = 0;
  
  // Match formats like "2h" or "2 hours"
  const hoursMatch = durationStr.match(/(\d+)\s*h(?:ours?)?/i);
  if (hoursMatch) {
    hours = parseInt(hoursMatch[1], 10);
    totalSeconds += hours * 3600;
  }
  
  // Match formats like "30m" or "30 minutes"
  const minutesMatch = durationStr.match(/(\d+)\s*m(?:inutes?)?/i);
  if (minutesMatch) {
    minutes = parseInt(minutesMatch[1], 10);
    totalSeconds += minutes * 60;
  }
  return {
    totalSeconds,
    hours,
    minutes
  };
}

export const fetchTaskHistory = async (req, res) => {
  const userId = req.user.id;
  const timeFrame = req.query.timeFrame || 'all-time'; // Default to all-time if not specified
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const searchQuery = req.query.search || '';
  
  let timeCondition = '';
  const now = new Date();
  
  // Derive time frame dates for SQL functions
  let startDate = null; // Defaults to all time
  let endDate = 'NOW()';
  
  // Apply time filter for SQL functions
  switch (timeFrame) {
    case 'this-week':
      // Get the start of the current week (Sunday)
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      startDate = `'${startOfWeek.toISOString()}'`;
      timeCondition = `AND t.updated_at >= ${startDate}`;
      break;
    case 'this-month':
      // Get the start of the current month
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate = `'${startOfMonth.toISOString()}'`;
      timeCondition = `AND t.updated_at >= ${startDate}`;
      break;
    case 'last-month':
      // Get the start of the last month
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      startDate = `'${startOfLastMonth.toISOString()}'`;
      endDate = `'${endOfLastMonth.toISOString()}'`;
      timeCondition = `AND t.updated_at >= ${startDate} AND t.updated_at <= ${endDate}`;
      break;
    default:
      // All time - leave as null
      break;
  }
  
  // Search condition
  const searchCondition = searchQuery 
    ? `AND (t.name ILIKE '%${searchQuery}%' OR t.description ILIKE '%${searchQuery}%')` 
    : '';
  
  const client = await pool.connect();
  
  try {
    // Query for completed tasks with time tracking data
    const tasksQuery = `
      SELECT 
        t.task_id,
        t.name,
        t.status,
        t.updated_at,
        t.estimated_time,
        c.name AS category,
        p.name AS priority,
        (
          SELECT COALESCE(SUM(duration), interval '0 minutes')
          FROM task_sessions
          WHERE task_id = t.task_id AND user_id = $1
        ) AS actual_time
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN priorities p ON t.priority_id = p.id
      WHERE t.user_id = $1 
      AND t.status = 'completed'
      ${timeCondition}
      ${searchCondition}
      ORDER BY t.updated_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const countQuery = `
      SELECT COUNT(*) 
      FROM tasks t
      WHERE t.user_id = $1 
      AND t.status = 'completed'
      ${timeCondition}
      ${searchCondition}
    `;
    
    // Get statistical data
    const statsQuery = `
      SELECT 
        COUNT(*) AS total_completed_tasks,
        calculate_task_completion_rate($1, ${startDate}, ${endDate}) AS completion_rate,
        calculate_productivity_score($1, ${startDate}, ${endDate}) AS productivity_score
      FROM tasks t
      WHERE t.user_id = $1 AND t.status = 'completed'
      ${timeCondition}
    `;
    
    // Execute all queries
    const [tasksResult, countResult, statsResult] = await Promise.all([
      client.query(tasksQuery, [userId, limit, offset]),
      client.query(countQuery, [userId]),
      client.query(statsQuery, [userId])
    ]);
    
    // Process tasks to add performance indicators
    const tasks = tasksResult.rows.map(task => {
  
      // Calculate performance based on estimated vs actual time
      let performance = 'On Track';
      
      if (task.estimated_time && task.actual_time) {
        // Handle the estimated_time based on its type
        let estimatedMinutes = 0;
        
        if (typeof task.estimated_time === 'string') {
          // If it's a string like "X hours Y minutes", use parseHumanReadableDuration
          const estimatedInterval = parseHumanReadableDuration(task.estimated_time);
          estimatedMinutes = (estimatedInterval.hours || 0) * 60 + (estimatedInterval.minutes || 0);
        } else if (typeof task.estimated_time === 'object') {
          // If it's a PostgreSQL interval object
          estimatedMinutes = 
            (task.estimated_time.minutes || 0) + 
            (task.estimated_time.hours || 0) * 60 + 
            (task.estimated_time.days || 0) * 24 * 60;
        }
        
        // Extract components from the interval
        const actualInterval = task.actual_time;
        let actualMinutes = 0;
        
        // Handle PostgreSQL interval object format
        if (actualInterval) {
          actualMinutes = 
            (actualInterval.minutes || 0) + 
            (actualInterval.hours || 0) * 60 + 
            (actualInterval.days || 0) * 24 * 60;
        }
        
        const difference = actualMinutes - estimatedMinutes;
        
        if (difference > estimatedMinutes * 0.1) {
          performance = 'Delayed';
        } else if (difference < -estimatedMinutes * 0.1) {
          performance = 'Early';
        }
      }
      
      return {
        id: task.task_id,
        name: task.name,
        status: task.status,
        completionDate: new Date(task.updated_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        estimatedTime: formatTimeForDisplay(task.estimated_time),
        actualTime: formatTimeForDisplay(task.actual_time),
        performance,
        category: task.category,
        priority: task.priority
      };
    });
    
    // Get total count
    const totalTasks = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalTasks / limit);
    
    // Get stats
    const stats = {
      totalCompletedTasks: parseInt(statsResult.rows[0].total_completed_tasks) || 0,
      completionRate: parseFloat(statsResult.rows[0].completion_rate) || 0,
      productivityScore: parseFloat(statsResult.rows[0].productivity_score) || 0
    };
    
    // Log stats data for debugging
    console.log('Task history stats query:', statsQuery);
    console.log('Stats results:', statsResult.rows[0]);
    console.log('Final stats:', stats);
    
    res.status(200).json({
      tasks,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalTasks
      },
      stats
    });
    
  } catch (error) {
    console.error('Error fetching task history:', error);
    res.status(500).json({ error: 'Failed to fetch task history' });
  } finally {
    client.release();
  }
};

// Helper function to format time values for display
function formatTimeForDisplay(timeValue) {
  if (!timeValue) return 'Not set';
  
  if (timeValue === 0 || timeValue === '0') return 'Not tracked';
  
  // Handle string format
  if (typeof timeValue === 'string') {
    return timeValue;
  }
  
  // Handle PostgreSQL interval object
  if (typeof timeValue === 'object') {
    const hours = timeValue.hours || 0;
    const minutes = timeValue.minutes || 0;
    const days = timeValue.days || 0;
    
    const totalHours = hours + (days * 24);
    
    return `${totalHours}h ${minutes}m`;
  }
  
  return 'Unknown format';
}

export const handleSaveEdit = async (editedTask) => {
  try {
    setIsLoading(true);
    

    
    // Make sure estimated_time is properly formatted
    let estimated_time = editedTask.estimated_time;
    if (editedTask.estimatedHours !== undefined || editedTask.estimatedMinutes !== undefined) {
      const hours = editedTask.estimatedHours || 0;
      const minutes = editedTask.estimatedMinutes || 0;
      estimated_time = `${hours} hours ${minutes} minutes`;
    }
    
    const taskData = {
      ...editedTask,
      estimated_time: estimated_time
    };
    
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/updateTask/${editedTask.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(taskData),
    });
    
    if (!res.ok) {
      throw new Error(`Failed to update task: ${res.status}`);
    }
    
    // Fetch all tasks to ensure consistency with backend
    await fetchTasks();
    
    setShowEditModal(false);
  } catch (error) {
    console.error('Error updating task:', error);
    alert('Failed to update task. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

// Get task streaks for a user
export const getTaskStreaks = async (req, res) => {
  const userId = req.user.id;
  const client = await pool.connect();
  
  try {
    // Using the streak calculation SQL query to find the current and longest streaks
    const query = `
      -- 1. Get distinct days where tasks were completed
      WITH completed_days AS (
          SELECT DISTINCT
              user_id,
              DATE(updated_at) AS completion_date
          FROM tasks
          WHERE status = 'completed' AND user_id = $1
      ),

      -- 2. Group days into streaks
      streak_groups AS (
          SELECT
              user_id,
              completion_date,
              completion_date - (ROW_NUMBER() OVER (
                  PARTITION BY user_id ORDER BY completion_date
              ))::integer AS streak_group
          FROM completed_days
      ),

      -- 3. Identify each streak
      streaks AS (
          SELECT
              user_id,
              MIN(completion_date) AS streak_start,
              MAX(completion_date) AS streak_end,
              COUNT(*) AS streak_length
          FROM streak_groups
          GROUP BY user_id, streak_group
      ),

      -- 4. Longest streak per user
      longest_streaks AS (
          SELECT
              user_id,
              MAX(streak_length) AS longest_streak
          FROM streaks
          GROUP BY user_id
      ),

      -- 5. Current streak (must end today or yesterday)
      current_streaks AS (
          SELECT
              user_id,
              streak_length AS current_streak
          FROM streaks
          WHERE streak_end = CURRENT_DATE OR streak_end = CURRENT_DATE - INTERVAL '1 day'
      )

      -- Final result for the user
      SELECT
          $1 AS user_id,
          COALESCE(cs.current_streak, 0) AS current_streak,
          COALESCE(ls.longest_streak, 0) AS longest_streak
      FROM current_streaks cs
      FULL OUTER JOIN longest_streaks ls ON ls.user_id = cs.user_id
      LIMIT 1
    `;
    
    const result = await client.query(query, [userId]);
    
    // If no streaks are found (user hasn't completed any tasks yet)
    if (result.rows.length === 0) {
      return res.status(200).json({ 
        current: 0, 
        longest: 0 
      });
    }
    
    // Return the results formatted for the streak card
    res.status(200).json({
      current: result.rows[0].current_streak || 0,
      longest: result.rows[0].longest_streak || 0
    });
    
  } catch (error) {
    console.error('Error calculating task streaks:', error);
    res.status(500).json({ message: 'Server error while calculating task streaks' });
  } finally {
    client.release();
  }
};
  
