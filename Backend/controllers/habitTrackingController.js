import db from '../config/db.js';

// Get tracking records for a specific habit
const getTrackingByHabit = async (req, res) => {
  try {
    const habitId = req.params.habitId;
    const userId = req.user.id;
    
    // Verify that the habit belongs to the user
    const checkHabitQuery = `
      SELECT * FROM habits
      WHERE id = $1 AND user_id = $2
    `;
    
    const habitResult = await db.query(checkHabitQuery, [habitId, userId]);
    
    if (habitResult.rows.length === 0) {
      return res.status(404).json({ message: 'Habit not found or not authorized' });
    }
    
    // Get tracking records with formatted date
    const query = `
      SELECT id, habit_id, user_id, date::text, completed, created_at
      FROM habit_tracking
      WHERE habit_id = $1 AND user_id = $2
      ORDER BY date DESC
    `;
    
    const result = await db.query(query, [habitId, userId]);
    console.log(`Found ${result.rows.length} tracking records for habit ${habitId}`);
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching habit tracking:', error);
    res.status(500).json({ message: 'Server error while fetching habit tracking data' });
  }
};

// Get tracking records for a specific date
const getTrackingByDate = async (req, res) => {
  try {
    const date = req.params.date;
    const userId = req.user.id;
    
    // Parse the date carefully to avoid timezone issues
    let formattedDate;
    // If date is already in YYYY-MM-DD format without a time component, use it directly
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      formattedDate = date;
    } else {
      // Otherwise, parse and format it properly, keeping the client's date
      const parsedDate = new Date(date);
      formattedDate = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`;
    }
    
    console.log(`Fetching tracking for date: raw=${date}, formatted=${formattedDate}`);
    
    const query = `
      SELECT ht.id, ht.habit_id, ht.user_id, ht.date::text, ht.completed, ht.created_at, h.title, h.frequency
      FROM habit_tracking ht
      JOIN habits h ON ht.habit_id = h.id
      WHERE ht.date = $1 AND ht.user_id = $2
    `;
    
    const result = await db.query(query, [formattedDate, userId]);
    console.log(`Found ${result.rows.length} tracking records for date ${formattedDate}`);
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching tracking by date:', error);
    res.status(500).json({ message: 'Server error while fetching tracking data' });
  }
};

// Toggle completion status for a habit on a specific date
const toggleCompletion = async (req, res) => {
  try {
    const { habit_id, date, completed } = req.body;
    const userId = req.user.id;
    
    if (!habit_id || !date) {
      return res.status(400).json({ message: 'Habit ID and date are required' });
    }
    
    // Parse the date carefully to avoid timezone issues
    let formattedDate;
    // If date is already in YYYY-MM-DD format without a time component, use it directly
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      formattedDate = date;
    } else {
      // Otherwise, parse and format it properly, keeping the client's date
      const parsedDate = new Date(date);
      formattedDate = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`;
    }
    
    console.log(`Processing toggle request: habit_id=${habit_id}, raw date=${date}, formatted date=${formattedDate}, completed=${completed}`);
    
    // Verify that the habit belongs to the user
    const checkHabitQuery = `
      SELECT * FROM habits
      WHERE id = $1 AND user_id = $2
    `;
    
    const habitResult = await db.query(checkHabitQuery, [habit_id, userId]);
    
    if (habitResult.rows.length === 0) {
      return res.status(404).json({ message: 'Habit not found or not authorized' });
    }
    
    // Check if a tracking record exists for this habit and date
    const checkQuery = `
      SELECT * FROM habit_tracking
      WHERE habit_id = $1 AND date = $2 AND user_id = $3
    `;
    
    const checkResult = await db.query(checkQuery, [habit_id, formattedDate, userId]);
    
    let result;
    
    if (checkResult.rows.length > 0) {
      // Update existing record
      const updateQuery = `
        UPDATE habit_tracking
        SET completed = $1, created_at = CURRENT_TIMESTAMP
        WHERE habit_id = $2 AND date = $3 AND user_id = $4
        RETURNING id, habit_id, user_id, date::text, completed, created_at
      `;
      
      result = await db.query(updateQuery, [completed, habit_id, formattedDate, userId]);
    } else {
      // Create new record
      const insertQuery = `
        INSERT INTO habit_tracking (habit_id, user_id, date, completed)
        VALUES ($1, $2, $3, $4)
        RETURNING id, habit_id, user_id, date::text, completed, created_at
      `;
      
      result = await db.query(insertQuery, [habit_id, userId, formattedDate, completed]);
    }
    
    console.log('Toggle completion result:', result.rows[0]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error toggling habit completion:', error);
    res.status(500).json({ message: 'Server error while updating habit completion' });
  }
};

// Create a new tracking record
const createTracking = async (req, res) => {
  try {
    const { habit_id, date, completed } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!habit_id || !date) {
      return res.status(400).json({ message: 'Habit ID and date are required' });
    }
    
    // Parse the date carefully to avoid timezone issues
    let formattedDate;
    // If date is already in YYYY-MM-DD format without a time component, use it directly
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      formattedDate = date;
    } else {
      // Otherwise, parse and format it properly, keeping the client's date
      const parsedDate = new Date(date);
      formattedDate = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`;
    }
    
    console.log(`Creating tracking record: habit_id=${habit_id}, raw date=${date}, formatted date=${formattedDate}`);
    
    // Verify that the habit belongs to the user
    const checkHabitQuery = `
      SELECT * FROM habits
      WHERE id = $1 AND user_id = $2
    `;
    
    const habitResult = await db.query(checkHabitQuery, [habit_id, userId]);
    
    if (habitResult.rows.length === 0) {
      return res.status(404).json({ message: 'Habit not found or not authorized' });
    }
    
    // Check if a tracking record already exists for this habit and date
    const checkQuery = `
      SELECT * FROM habit_tracking
      WHERE habit_id = $1 AND date = $2 AND user_id = $3
    `;
    
    const checkResult = await db.query(checkQuery, [habit_id, formattedDate, userId]);
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ message: 'Tracking record already exists for this date' });
    }
    
    // Create new tracking record
    const query = `
      INSERT INTO habit_tracking (habit_id, user_id, date, completed)
      VALUES ($1, $2, $3, $4)
      RETURNING id, habit_id, user_id, date::text, completed, created_at
    `;
    
    const result = await db.query(query, [habit_id, userId, formattedDate, completed || false]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating tracking record:', error);
    res.status(500).json({ message: 'Server error while creating tracking record' });
  }
};

// Update a tracking record
const updateTracking = async (req, res) => {
  try {
    const trackingId = req.params.id;
    const { completed } = req.body;
    const userId = req.user.id;
    
    // Validate ownership
    const checkQuery = `
      SELECT * FROM habit_tracking
      WHERE id = $1 AND user_id = $2
    `;
    
    const checkResult = await db.query(checkQuery, [trackingId, userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Tracking record not found or not authorized' });
    }
    
    // Update the tracking record
    const updateQuery = `
      UPDATE habit_tracking
      SET completed = $1, created_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING id, habit_id, user_id, date::text, completed, created_at
    `;
    
    const result = await db.query(updateQuery, [completed, trackingId, userId]);
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating tracking record:', error);
    res.status(500).json({ message: 'Server error while updating tracking record' });
  }
};

// Delete a tracking record
const deleteTracking = async (req, res) => {
  try {
    const trackingId = req.params.id;
    const userId = req.user.id;
    
    // Validate ownership
    const checkQuery = `
      SELECT * FROM habit_tracking
      WHERE id = $1 AND user_id = $2
    `;
    
    const checkResult = await db.query(checkQuery, [trackingId, userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Tracking record not found or not authorized' });
    }
    
    // Delete the tracking record
    const deleteQuery = `
      DELETE FROM habit_tracking
      WHERE id = $1 AND user_id = $2
      RETURNING id, habit_id, user_id, date::text, completed, created_at
    `;
    
    const result = await db.query(deleteQuery, [trackingId, userId]);
    
    res.status(200).json({
      message: 'Tracking record successfully deleted',
      tracking: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting tracking record:', error);
    res.status(500).json({ message: 'Server error while deleting tracking record' });
  }
};

export default {
  getTrackingByHabit,
  getTrackingByDate,
  toggleCompletion,
  createTracking,
  updateTracking,
  deleteTracking
}; 