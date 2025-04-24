const pool = require('../config/db');

exports.addTask = async (req, res) => {
  console.log("Received:", req.body);
  const user_id = req.user.id; 

    // const { title, description, type, user_id, dueDate, priority_id, tags, subTasks } = req.body;
    const { title, description,dueDate, priority, tags, subtasks,status } = req.body;
    const type = 'personal';
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const priorityText = priority.toUpperCase();
      const priorityResult = await client.query('SELECT id FROM priorities where label = $1',[priorityText]);
      if (priorityResult.rows.length === 0) {
        throw new Error('Priority not found');
      }
      const priority_id = priorityResult.rows[0].id;

      // Extracting status_id from status
      const statusText = status;
      const statusResult = await client.query('SELECT id FROM statuses where label = $1',[statusText]);
      if (statusResult.rows.length === 0) {
        throw new Error('status not found');
      }
      const status_id = statusResult.rows[0].id;

      // 1. Handle tags (many-to-many)
      let tagIds = [];
      if (Array.isArray(tags) && tags.length > 0) {
        for (let i = 0; i < tags.length; i++) {
          const tagText = tags[i].toLowerCase();
          let tagResult = await client.query('SELECT id FROM tags WHERE name = $1', [tagText]);
  
          let tag_id;
          if (tagResult.rows.length === 0) {
            const insertTag = await client.query('INSERT INTO tags(name) VALUES($1) RETURNING id', [tagText]);
            tag_id = insertTag.rows[0].id;
          } else {
            tag_id = tagResult.rows[0].id;
          }
  
          tagIds.push(tag_id);
        }
      }
  
      // 2. Insert task
      const insertTaskResult = await client.query(
        'INSERT INTO tasks(title, description, type, user_id, due_date, priority_id, status_id) VALUES($1, $2, $3,$4, $5, $6, $7) RETURNING id',
        [title, description,type,user_id,dueDate,priority_id,status_id]
      );
      const task_id = insertTaskResult.rows[0].id;
  
      // 3. Associate tags with task
      for (let i = 0; i < tagIds.length; i++) {
        await client.query('INSERT INTO task_tags(task_id, tag_id) VALUES($1, $2)', [task_id, tagIds[i]]);
      }
      console.log(subtasks);
      // 4. Insert subtasks
      if (Array.isArray(subtasks) &&  subtasks.length > 0) {
        for (let i = 0; i < subtasks.length; i++) {
          await client.query(
            'INSERT INTO subtasks(task_id, title, is_completed) VALUES($1, $2, $3)',
            [task_id, subtasks[i].title,subtasks[i].completed]
          );
        }
      }
  
      await client.query('COMMIT');
      res.status(201).json({ message: 'Task, tags, and subtasks added successfully', task_id });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(err);
      res.status(500).json({ message: 'Error adding task', error: err.message });
    } finally {
      client.release();
    }
  };
  
  exports.fetchTasks = async (req, res) => {
    const userId = req.user.id; // Assuming you use JWT and verified the user
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT 
        t.id as task_id,
        t.title,
        t.description,
        t.due_date,
        p.label as priority,
        s.label as status,
        tags.name as tag,
        sb.title as subtask_title,
        sb.is_completed as subtask_completed
      FROM tasks t
      JOIN priorities p ON t.priority_id = p.id
      JOIN statuses s ON t.status_id = s.id
      LEFT JOIN task_tags tg ON t.id = tg.task_id
      LEFT JOIN tags ON tg.tag_id = tags.id
      LEFT JOIN subtasks sb ON t.id = sb.task_id
      WHERE t.user_id = $1
    `, [userId]);

    const tasksMap = new Map();

    result.rows.forEach(row => {
      const {
        task_id, title, description, due_date,
        priority, status, tag,
        subtask_title, subtask_completed
      } = row;

      if (!tasksMap.has(task_id)) {
        tasksMap.set(task_id, {
          id: task_id,
          title,
          description,
          dueDate: due_date,
          priority,
          tags: tag ? [tag] : [],
          status,
          subtasks: subtask_title ? [{
            title: subtask_title,
            completed: subtask_completed
          }] : []
        });
      } else {
        const task = tasksMap.get(task_id);

        if (tag && !task.tags.includes(tag)) {
          task.tags.push(tag);
        }

        if (subtask_title) {
          task.subtasks.push({
            title: subtask_title,
            completed: subtask_completed
          });
        }
      }
    });

    const tasks = Array.from(tasksMap.values());
    res.status(200).json(tasks);

  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  } finally {
    client.release();
  }
  }


  exports.deleteTask = async (req,res) =>{
    const{task_id} = req.params;
    const client = await pool.connect();
    try{
      client.query('DELETE FROM tasks where id = $1',[task_id]);
      res.status(200).json({message:'Task Deleted Succesflly'});
    }
    catch (error) {
      console.error('Error Delete tasks:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    } finally {
      client.release();
    }
  }


  exports.editTask = async (req,res)=>{
    // Let's add logic of updating information about tasks
    const user_id = req.user.id;
    const{task_id} = req.params; // assuming route is /tasks/:task_id
  const { title, description, dueDate, priority, tags, subtasks, status } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get priority_id and status_id
    const priorityText = priority.toUpperCase();
    const priorityResult = await client.query('SELECT id FROM priorities WHERE label = $1', [priorityText]);
    if (priorityResult.rows.length === 0) throw new Error('Priority not found');
    const priority_id = priorityResult.rows[0].id;

    const statusResult = await client.query('SELECT id FROM statuses WHERE label = $1', [status]);
    if (statusResult.rows.length === 0) throw new Error('Status not found');
    const status_id = statusResult.rows[0].id;

    // 1. Update task
    await client.query(
      `UPDATE tasks 
       SET title = $1, description = $2, due_date = $3, priority_id = $4, status_id = $5 
       WHERE id = $6 AND user_id = $7`,
      [title, description, dueDate, priority_id, status_id, task_id, user_id]
    );

    // 2. Update tags (delete existing and re-insert)
    await client.query('DELETE FROM task_tags WHERE task_id = $1', [task_id]);
    for (let tag of tags) {
      const tagText = tag.toLowerCase();
      let tagResult = await client.query('SELECT id FROM tags WHERE name = $1', [tagText]);
      let tag_id = tagResult.rows.length ? tagResult.rows[0].id :
        (await client.query('INSERT INTO tags(name) VALUES($1) RETURNING id', [tagText])).rows[0].id;

      await client.query('INSERT INTO task_tags(task_id, tag_id) VALUES($1, $2)', [task_id, tag_id]);
    }

    // 3. Update subtasks (delete existing and re-insert)
    await client.query('DELETE FROM subtasks WHERE task_id = $1', [task_id]);
    for (let subtask of subtasks) {
      await client.query(
        'INSERT INTO subtasks(task_id, title, is_completed) VALUES($1, $2, $3)',
        [task_id, subtask.title, subtask.completed]
      );
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

  }
  