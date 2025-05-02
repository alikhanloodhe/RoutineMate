const pool = require('../config/db');

exports.addTask = async (req, res) => {
  console.log("Received:", req.body);
  const user_id = req.user.id; 
console.log(req.body);
    // const { title, description, type, user_id, dueDate, priority_id, tags, subTasks } = req.body;
    const { name, description,dueDate,category_id, priority_id, subtasks,status,estimated_time } = req.body;
    console.log(category_id);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // 2. Insert task
      const insertTaskResult = await client.query(
        'INSERT INTO tasks(user_id,name, description,category_id, priority_id,status,estimated_time,due_date) VALUES($1, $2, $3,$4, $5, $6, $7,$8) RETURNING task_id',
        [user_id,name, description,category_id,priority_id,status,estimated_time,dueDate]
      );
      const task_id = insertTaskResult.rows[0].task_id;
  
      console.log(subtasks);
      // 4. Insert subtasks
      if (Array.isArray(subtasks) &&  subtasks.length > 0) {
        for (let i = 0; i < subtasks.length; i++) {
          await client.query(
            'INSERT INTO subtasks(task_id, name, status) VALUES($1, $2, $3)',
            [task_id, subtasks[i].name,subtasks[i].status]
          );
        }
      }
  
      await client.query('COMMIT');
      res.status(201).json({ message: 'Task, tags, and subtasks added successfully',taskId: task_id });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(err);
      res.status(500).json({ message: 'Error adding task', error: err.message });
    } finally {
      client.release();
    }
  };
  
  exports.fetchTasks = async (req, res) => {
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
          sb.subtask_id,
          sb.name AS subtask_title,
          sb.status AS subtask_status,
          ts.duration AS time_spent
        FROM tasks t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN priorities p ON t.priority_id = p.id
        LEFT JOIN subtasks sb ON t.task_id = sb.task_id
        LEFT JOIN (
          SELECT task_id, SUM(duration) AS duration
          FROM task_sessions
          WHERE user_id = $1
          GROUP BY task_id
        ) ts ON t.task_id = ts.task_id
        WHERE t.user_id = $1
      `, [userId]);
  
      const tasksMap = new Map();
  
      result.rows.forEach(row => {
        const {
          task_id, title, description, due_date, status,
          estimated_time, created_at, category, priority,
          subtask_id, subtask_title, subtask_status, time_spent
        } = row;
        if (!tasksMap.has(task_id)) {
          tasksMap.set(task_id, {
            id: task_id,
            title,
            description,
            dueDate: due_date,
            estimated_time:  formatInterval(estimated_time),
            completed: status === 'completed',
            status: status,
            category,
            priority,  
            timeSpent: time_spent ? formatInterval(time_spent) : '0h 0m',
            createdAt: new Date(created_at).getTime(),
            subtasks: []
          });
        }
  
        if (subtask_id) {
          tasksMap.get(task_id).subtasks.push({
            id: subtask_id,
            title: subtask_title,
            completed: subtask_status === 'completed'
          });
        }
      });
  
      const tasks = Array.from(tasksMap.values());
      res.status(200).json(tasks);
  
    } catch (err) {
      console.error('Error fetching tasks:', err);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    } finally {
      client.release();
    }
  };

  function formatInterval(interval) {
    if (!interval || typeof interval !== 'object') {
      return { hours: 0, minutes: 0, formatted: '0m' };
    }
  
    const hours = interval.hours || 0;
    const minutes = interval.minutes || 0;
    const formatted = `${hours}h ${minutes}m`;
  
    return { hours, minutes, formatted };
  }
  
  

  exports.deleteTask = async (req, res) => {
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


  exports.editTask = async (req, res) => {
    const user_id = req.user.id;
    const { task_id } = req.params;
    console.log('Rceived',req.body); 
    const { title, name, description, dueDate, priority, category, subtasks, status, estimatedHours,estimatedMinutes } = req.body;

    const priorityText = priority.toUpperCase();
      const priorityResult = await pool.query('SELECT id FROM priorities where name = $1',[priorityText]);
      if (priorityResult.rows.length === 0) {
        throw new Error('Priority not found');
      }
      const priority_id = priorityResult.rows[0].id;
    const categoryText =category;
      const categoryResult = await pool.query('SELECT id FROM categories where name = $1',[categoryText]);
      if (categoryResult.rows.length === 0) {
        throw new Error('status not found');
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
      let estimated_time = null;

      const hours = estimatedHours || 0;
      const minutes = estimatedMinutes || 0;
      estimated_time = `${hours} hours ${minutes} minutes`;

    console.log(estimated_time);      // Update task
      await client.query(
        `UPDATE tasks 
         SET name = $1, 
             description = $2, 
             due_date = $3, 
             priority_id = $4, 
             category_id = $5,
             status = $6,
             estimated_time = $7,
             updated_at = NOW()
         WHERE task_id = $8 AND user_id = $9`,
        [taskName, description, dueDate, priority_id, category_id,status, estimated_time, task_id, user_id]
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
  
  exports.startSession = async (req, res) => {
    const { taskId } = req.body;
    const userId = req.user.id;
    console.log('I am in start session')
    try {
      // First check if there's an active session for this task
      const activeSession = await pool.query(
        `SELECT session_id FROM task_sessions 
         WHERE task_id = $1 AND user_id = $2 AND end_time IS NULL`,
        [taskId, userId]
      );
      
      // If there's already an active session, return it
      if (activeSession.rows.length > 0) {
        console.log('A session in progress');
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
  
  exports.endSession = async (req, res) => {
    const { sessionId, taskId, duration } = req.body;
    const userId = req.user.id;
    console.log('Ending session with data:', req.body);
  
    try {
      let result;
      
      // If sessionId is provided, end that specific session
      if (sessionId) {
        // Calculate duration based on start and end times
        const sessionData = await pool.query(
          `SELECT start_time FROM task_sessions 
           WHERE session_id = $1 AND user_id = $2 AND end_time IS NULL`,
          [sessionId, userId]
        );
        
        if (sessionData.rows.length === 0) {
          return res.status(404).json({ error: 'Session not found or already ended' });
        }
        
        const startTime = new Date(sessionData.rows[0].start_time);
        const endTime = new Date();
        const durationInSeconds = Math.floor((endTime - startTime) / 1000);
        const hours = Math.floor(durationInSeconds / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        const calculatedDuration = `${hours} hours ${minutes} minutes`;
        // console.log(calculatedDuration);
        // Set end_time to now and update the duration
        result = await pool.query(
          `UPDATE task_sessions
           SET end_time = NOW()
           WHERE session_id = $1 AND user_id = $2 AND end_time IS NULL
           RETURNING session_id, start_time, end_time, duration`,
          [sessionId, userId]
        );
      }
      // If taskId is provided, end the latest active session for that task
      else if (taskId && !duration) {
        // Calculate duration based on start and end times for the latest session
        const sessionData = await pool.query(
          `SELECT session_id, start_time FROM task_sessions 
           WHERE task_id = $1 AND user_id = $2 AND end_time IS NULL
           ORDER BY start_time DESC LIMIT 1`,
          [taskId, userId]
        );
        
        if (sessionData.rows.length === 0) {
          return res.status(404).json({ error: 'No active session found for this task' });
        }
        
        const startTime = new Date(sessionData.rows[0].start_time);
        const endTime = new Date();
        const durationInSeconds = Math.floor((endTime - startTime) / 1000);
        const hours = Math.floor(durationInSeconds / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        const calculatedDuration = `${hours} hours ${minutes} minutes`;
        
        result = await pool.query(
          `UPDATE task_sessions
           SET end_time = NOW()
           WHERE session_id = $1 AND end_time IS NULL
           RETURNING session_id, start_time, end_time, duration`,
          [sessionData.rows[0].session_id, userId]
        );
      }
      // If duration is provided, create a completed session with the specified duration
      else if (duration && taskId) {
        const durationObj = parseHumanReadableDuration(duration);
        const durationInSeconds = durationObj.totalSeconds;
        
        // Calculate start time by subtracting duration from current time
        result = await pool.query(
          `INSERT INTO task_sessions (task_id, user_id, start_time, end_time)
           VALUES ($1, $2, NOW() - INTERVAL '${durationInSeconds} seconds', NOW())
           RETURNING session_id, start_time, end_time, duration`,
          [taskId, userId]
        );
      }
      else {
        return res.status(400).json({ error: 'Missing required parameters: either sessionId, taskId, or both taskId and duration are required' });
      }
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Session not found or already ended' });
      }
  
      res.status(200).json({
        message: 'Session ended successfully',
        sessionData: result.rows[0]
      });
    } catch (error) {
      console.error('Error ending session:', error);
      res.status(500).json({ error: 'Failed to end session', details: error.message });
    }
  };
  
  // Helper function to parse duration like "2h 30m" into seconds
  function parseHumanReadableDuration(durationStr) {
    let totalSeconds = 0;
    
    // Extract hours if present
    const hoursMatch = durationStr.match(/(\d+)h/);
    if (hoursMatch) {
      totalSeconds += parseInt(hoursMatch[1], 10) * 3600;
    }
    
    // Extract minutes if present
    const minutesMatch = durationStr.match(/(\d+)m/);
    if (minutesMatch) {
      totalSeconds += parseInt(minutesMatch[1], 10) * 60;
    }
    
    return {
      totalSeconds,
      hours: hoursMatch ? parseInt(hoursMatch[1], 10) : 0,
      minutes: minutesMatch ? parseInt(minutesMatch[1], 10) : 0
    };
  }
  
