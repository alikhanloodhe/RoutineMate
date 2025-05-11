import db from '../config/db.js';

// Get all habits for the current user
const getHabits = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT h.*, c.name as category_name 
      FROM habits h
      LEFT JOIN categories c ON h.category_id = c.id
      WHERE h.user_id = $1
      ORDER BY h.created_at DESC
    `;
    
    const result = await db.query(query, [userId]);
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ message: 'Server error while fetching habits' });
  }
};

// Get a specific habit by ID
const getHabitById = async (req, res) => {
  try {
    const habitId = req.params.id;
    const userId = req.user.id;
    
    const query = `
      SELECT h.*, c.name as category_name 
      FROM habits h
      LEFT JOIN categories c ON h.category_id = c.id
      WHERE h.id = $1 AND h.user_id = $2
    `;
    
    const result = await db.query(query, [habitId, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching habit:', error);
    res.status(500).json({ message: 'Server error while fetching habit' });
  }
};

// Create a new habit
const createHabit = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      frequency,
      reminder_time,
      why_reason,
      start_date,
      goal_type,
      total_target_days,
      category_id
    } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    const query = `
      INSERT INTO habits (
        user_id,
        title,
        description,
        frequency,
        reminder_time,
        why_reason,
        start_date,
        goal_type,
        total_target_days,
        category_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      userId,
      title,
      description || null,
      frequency || 'daily',
      reminder_time || null,
      why_reason || null,
      start_date || new Date().toISOString().split('T')[0],
      goal_type || 'lifelong',
      total_target_days || null,
      category_id || null
    ];
    
    const result = await db.query(query, values);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({ message: 'Server error while creating habit' });
  }
};

// Update a habit
const updateHabit = async (req, res) => {
  try {
    const habitId = req.params.id;
    const userId = req.user.id;
    const {
      title,
      description,
      frequency,
      reminder_time,
      why_reason,
      start_date,
      goal_type,
      total_target_days,
      category_id
    } = req.body;
    
    // Validate ownership
    const checkQuery = `
      SELECT * FROM habits
      WHERE id = $1 AND user_id = $2
    `;
    
    const checkResult = await db.query(checkQuery, [habitId, userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Habit not found or not authorized' });
    }
    
    // Update the habit
    const updateQuery = `
      UPDATE habits
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        frequency = COALESCE($3, frequency),
        reminder_time = COALESCE($4, reminder_time),
        why_reason = COALESCE($5, why_reason),
        start_date = COALESCE($6, start_date),
        goal_type = COALESCE($7, goal_type),
        total_target_days = COALESCE($8, total_target_days),
        category_id = COALESCE($9, category_id),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10 AND user_id = $11
      RETURNING *
    `;
    
    const updateValues = [
      title,
      description,
      frequency,
      reminder_time,
      why_reason,
      start_date,
      goal_type,
      total_target_days,
      category_id,
      habitId,
      userId
    ];
    
    const result = await db.query(updateQuery, updateValues);
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(500).json({ message: 'Server error while updating habit' });
  }
};

// Delete a habit
const deleteHabit = async (req, res) => {
  try {
    const habitId = req.params.id;
    const userId = req.user.id;
    
    // Validate ownership
    const checkQuery = `
      SELECT * FROM habits
      WHERE id = $1 AND user_id = $2
    `;
    
    const checkResult = await db.query(checkQuery, [habitId, userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Habit not found or not authorized' });
    }
    
    // Delete the habit
    const deleteQuery = `
      DELETE FROM habits
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    
    const result = await db.query(deleteQuery, [habitId, userId]);
    
    res.status(200).json({
      message: 'Habit successfully deleted',
      habit: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ message: 'Server error while deleting habit' });
  }
};

export default {
  getHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit
}; 