import pool from '../config/db.js';

// Get tracking data for a specific habit
export const getTrackingByHabit = async (req, res) => {
  try {
    const habitId = req.params.habitId;
    const userId = req.user.id;
    
    // Verify that the habit belongs to the user
    const habitCheck = await pool.query(
      'SELECT * FROM habits WHERE id = $1 AND user_id = $2',
      [habitId, userId]
    );
    
    if (habitCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'Habit not found or not authorized' });
    }
    
    // Get tracking data
    const tracking = await pool.query(
      'SELECT * FROM habit_tracking WHERE habit_id = $1 AND user_id = $2 ORDER BY date DESC',
      [habitId, userId]
    );
    
    res.json(tracking.rows);
  } catch (err) {
    console.error('Error fetching tracking data:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get tracking data for all habits on a specific date
export const getTrackingForDate = async (req, res) => {
  try {
    const date = req.params.date;
    const userId = req.user.id;
    
    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ msg: 'Invalid date format. Use YYYY-MM-DD' });
    }
    
    // First get all habits for this user
    const habitsResult = await pool.query(
      'SELECT * FROM habits WHERE user_id = $1',
      [userId]
    );
    
    const habits = habitsResult.rows;
    
    // Get existing tracking data for the given date
    const trackingResult = await pool.query(
      `SELECT ht.*, h.title, h.frequency
       FROM habit_tracking ht
       JOIN habits h ON ht.habit_id = h.id
       WHERE ht.user_id = $1 AND ht.date = $2`,
      [userId, date]
    );
    
    const existingTracking = trackingResult.rows;
    
    // Create a map of habit_id to tracking data
    const trackingMap = {};
    existingTracking.forEach(record => {
      trackingMap[record.habit_id] = record;
    });
    
    // Create a complete response including all habits
    const completeTracking = habits.map(habit => {
      // If tracking exists for this habit, return it
      if (trackingMap[habit.id]) {
        return trackingMap[habit.id];
      }
      
      // Otherwise return a default "not completed" status
      return {
        habit_id: habit.id,
        user_id: userId,
        date: date,
        completed: false,
        title: habit.title,
        frequency: habit.frequency
      };
    });
    
    res.json(completeTracking);
  } catch (err) {
    console.error('Error fetching tracking data:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Toggle habit completion status for a specific date
export const toggleHabitCompletion = async (req, res) => {
  try {
    const { habit_id, date, completed } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!habit_id || !date) {
      return res.status(400).json({ msg: 'Habit ID and date are required' });
    }
    
    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ msg: 'Invalid date format. Use YYYY-MM-DD' });
    }
    
    // Verify that the habit belongs to the user
    const habitCheck = await pool.query(
      'SELECT * FROM habits WHERE id = $1 AND user_id = $2',
      [habit_id, userId]
    );
    
    if (habitCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'Habit not found or not authorized' });
    }
    
    // Check if a tracking record already exists for this habit and date
    const existingRecord = await pool.query(
      'SELECT * FROM habit_tracking WHERE habit_id = $1 AND user_id = $2 AND date = $3',
      [habit_id, userId, date]
    );
    
    let result;
    
    if (existingRecord.rows.length > 0) {
      // Update existing record
      result = await pool.query(
        `UPDATE habit_tracking 
         SET completed = $1
         WHERE habit_id = $2 AND user_id = $3 AND date = $4
         RETURNING *`,
        [completed !== false, habit_id, userId, date]
      );
    } else {
      // Create new record
      result = await pool.query(
        `INSERT INTO habit_tracking (habit_id, user_id, date, completed)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [habit_id, userId, date, completed !== false]
      );
    }
    
    // Get the habit data to include in the response
    const habitData = await pool.query(
      'SELECT title, frequency FROM habits WHERE id = $1',
      [habit_id]
    );
    
    // Add habit title and frequency to the response
    const responseData = {
      ...result.rows[0],
      title: habitData.rows[0].title,
      frequency: habitData.rows[0].frequency
    };
    
    res.json(responseData);
  } catch (err) {
    console.error('Error updating tracking data:', err);
    res.status(500).json({ msg: 'Server error' });
  }
}; 