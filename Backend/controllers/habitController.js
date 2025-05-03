import pool from '../config/db.js';

// Get all habits for a user
// CRUD // Read
export const getHabits = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const habits = await pool.query(
      'SELECT * FROM habits WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    res.json(habits.rows);
  } catch (err) {
    console.error('Error fetching habits:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
// Read
// Get a single habit by ID
export const getHabitById = async (req, res) => {
  try {
    const habitId = req.params.id;
    const userId = req.user.id;
    
    const habit = await pool.query(
      'SELECT * FROM habits WHERE id = $1 AND user_id = $2',
      [habitId, userId]
    );
    
    if (habit.rows.length === 0) {
      return res.status(404).json({ msg: 'Habit not found' });
    }
    
    res.json(habit.rows[0]);
  } catch (err) {
    console.error('Error fetching habit:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Create a new habit
// Create
export const createHabit = async (req, res) => {
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
      total_target_days
    } = req.body;
    
    // Check for required fields
    if (!title) {
      return res.status(400).json({ msg: 'Title is required' });
    }
    
    const newHabit = await pool.query(
      `INSERT INTO habits (
        user_id, title, description, frequency, reminder_time, 
        why_reason, start_date, goal_type, total_target_days
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        userId, title, description, frequency, reminder_time,
        why_reason, start_date, goal_type, total_target_days
      ]
    );
    
    res.status(201).json(newHabit.rows[0]);
  } catch (err) {
    console.error('Error creating habit:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update a habit // Update
export const updateHabit = async (req, res) => {
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
      total_target_days
    } = req.body;
    
    // Check for required fields
    if (!title) {
      return res.status(400).json({ msg: 'Title is required' });
    }
    
    // Check if habit exists and belongs to user
    const habitCheck = await pool.query(
      'SELECT * FROM habits WHERE id = $1 AND user_id = $2',
      [habitId, userId]
    );
    
    if (habitCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'Habit not found or not authorized' });
    }
    
    const updatedHabit = await pool.query(
      `UPDATE habits SET
        title = $1,
        description = $2,
        frequency = $3,
        reminder_time = $4,
        why_reason = $5,
        start_date = $6,
        goal_type = $7,
        total_target_days = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9 AND user_id = $10
      RETURNING *`,
      [
        title, description, frequency, reminder_time,
        why_reason, start_date, goal_type, total_target_days,
        habitId, userId
      ]
    );
    
    res.json(updatedHabit.rows[0]);
  } catch (err) {
    console.error('Error updating habit:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Delete a habit // Delete
export const deleteHabit = async (req, res) => {
  try {
    const habitId = req.params.id;
    const userId = req.user.id;
    
    // Check if habit exists and belongs to user
    const habitCheck = await pool.query(
      'SELECT * FROM habits WHERE id = $1 AND user_id = $2',
      [habitId, userId]
    );
    
    if (habitCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'Habit not found or not authorized' });
    }
    
    // Delete the habit
    await pool.query(
      'DELETE FROM habits WHERE id = $1 AND user_id = $2',
      [habitId, userId]
    );
    
    res.json({ msg: 'Habit deleted successfully' });
  } catch (err) {
    console.error('Error deleting habit:', err);
    res.status(500).json({ msg: 'Server error' });
  }
}; 