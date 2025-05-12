import db from '../config/db.js';
import { getClientAdjustedTime, parseClientDate } from '../utils/timeUtils.js';

// Get all routines for the current user
const getAllRoutines = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Optimized query to get all routines with their days, completion data, category and priority names
    const query = `
      WITH routine_days_array AS (
        SELECT 
          rd.routine_id,
          ARRAY_AGG(d.days) AS days
        FROM 
          routine_days rd
        JOIN 
          days d ON rd.day_id = d.day_id
        GROUP BY 
          rd.routine_id
      ),
      completion_history AS (
        SELECT 
          routine_id,
          ARRAY_AGG(jsonb_build_object('date', completion_date::text, 'completed', completed) ORDER BY completion_date DESC) AS history
        FROM (
          SELECT 
            routine_id,
            completion_date,
            completed
          FROM (
            SELECT 
              routine_id,
              completion_date,
              completed,
              ROW_NUMBER() OVER (PARTITION BY routine_id ORDER BY completion_date DESC) as rn
            FROM 
              routine_completion_history
            WHERE
              routine_id IN (SELECT routine_id FROM routines WHERE user_id = $1)
          ) ranked_history
          WHERE rn <= 10
        ) AS recent_history
        GROUP BY 
          routine_id
      )
      SELECT 
        r.routine_id,
        r.user_id,
        r.title,
        r.start_time,
        r.end_time,
        r.category_id,
        r.priority_id,
        r.status,
        r.created_at,
        r.updated_at,
        rda.days,
        rcd.streak,
        rcd.last_completed,
        rcd.completion_rate,
        ch.history,
        c.name AS category,
        p.name AS priority
      FROM 
        routines r
      LEFT JOIN 
        routine_days_array rda ON r.routine_id = rda.routine_id
      LEFT JOIN 
        routine_completion_data rcd ON r.routine_id = rcd.routine_id
      LEFT JOIN 
        completion_history ch ON r.routine_id = ch.routine_id
      LEFT JOIN
        categories c ON r.category_id = c.id
      LEFT JOIN
        priorities p ON r.priority_id = p.id
      WHERE 
        r.user_id = $2
      ORDER BY 
        r.created_at DESC
    `;
    
    const result = await db.query(query, [userId, userId]);
    
    // Format the response data
    const routines = result.rows.map(routine => ({
      routine_id: routine.routine_id,
      id: routine.routine_id, // For frontend compatibility
      user_id: routine.user_id,
      title: routine.title,
      start_time: routine.start_time,
      end_time: routine.end_time,
      startTime: routine.start_time, // For frontend compatibility
      endTime: routine.end_time, // For frontend compatibility
      category_id: routine.category_id,
      priority_id: routine.priority_id,
      status: routine.status,
      active: routine.status === 'active' || routine.status === 'pending',
      created_at: routine.created_at,
      updated_at: routine.updated_at,
      days: routine.days || [],
      daysOfWeek: routine.days || [], // For frontend compatibility
      category: routine.category,
      priority: routine.priority,
      completionData: {
        streak: routine.streak || 0,
        lastCompleted: routine.last_completed,
        completionRate: routine.completion_rate || 0,
        history: routine.history || []
      }
    }));
    
    res.status(200).json(routines);
  } catch (error) {
    console.error('Error fetching routines:', error);
    res.status(500).json({ message: 'Server error while fetching routines' });
  }
};

// Get a specific routine by ID
const getRoutineById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Query to get a specific routine with its days and completion data
    const query = `
      SELECT 
        r.routine_id,
        r.user_id,
        r.title,
        r.start_time,
        r.end_time,
        r.category_id,
        r.priority_id,
        r.status,
        r.created_at,
        r.updated_at,
        ARRAY_AGG(d.days) AS days,
        rcd.streak,
        rcd.last_completed,
        rcd.completion_rate,
        c.name AS category_name,
        p.name AS priority_name
      FROM 
        routines r
      LEFT JOIN 
        routine_days rd ON r.routine_id = rd.routine_id
      LEFT JOIN 
        days d ON rd.day_id = d.day_id
      LEFT JOIN 
        routine_completion_data rcd ON r.routine_id = rcd.routine_id
      LEFT JOIN
        categories c ON r.category_id = c.id
      LEFT JOIN
        priorities p ON r.priority_id = p.id
      WHERE 
        r.routine_id = $1 AND r.user_id = $2
      GROUP BY 
        r.routine_id, rcd.streak, rcd.last_completed, rcd.completion_rate, c.name, p.name
    `;
    
    const result = await db.query(query, [id, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Routine not found or not authorized' });
    }
    
    const routine = result.rows[0];
    
    // Get completion history for the routine
    const historyQuery = `
      SELECT 
        completion_date::text, 
        completed 
      FROM 
        routine_completion_history
      WHERE 
        routine_id = $1
      ORDER BY 
        completion_date DESC
      LIMIT 10
    `;
    
    const historyResult = await db.query(historyQuery, [routine.routine_id]);
    
    const routineWithHistory = {
      ...routine,
      // Add completion history to the routine
      completionData: {
        streak: routine.streak || 0,
        lastCompleted: routine.last_completed,
        completionRate: routine.completion_rate || 0,
        history: historyResult.rows
      },
      // Include category and priority names
      category: routine.category_name || null,
      priority: routine.priority_name || null,
      // Remove redundant fields
      streak: undefined,
      last_completed: undefined,
      completion_rate: undefined,
      category_name: undefined,
      priority_name: undefined
    };
    
    res.status(200).json(routineWithHistory);
  } catch (error) {
    console.error('Error fetching routine:', error);
    res.status(500).json({ message: 'Server error while fetching routine' });
  }
};

// Create a new routine
const createRoutine = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      title, 
      start_time, 
      end_time, 
      category_id, 
      priority_id, 
      status = 'pending', 
      days 
    } = req.body;
    
    // Validate required fields
    if (!title || !start_time || !end_time || !days || !Array.isArray(days) || days.length === 0) {
      return res.status(400).json({ 
        message: 'Title, start time, end time, and at least one day are required' 
      });
    }
    
    // Start a transaction
    await db.query('BEGIN');
    
    // Get category ID if a name was provided instead of an ID
    let categoryIdToUse = category_id;
    
    if (category_id && isNaN(parseInt(category_id))) {
      // If category_id is not a number, assume it's a name and look up the ID
      const categoryQuery = `
        SELECT id FROM categories WHERE name = $1
      `;
      const categoryResult = await db.query(categoryQuery, [category_id]);
      
      if (categoryResult.rows.length > 0) {
        categoryIdToUse = categoryResult.rows[0].id;
      } else {
        // Category not found
        await db.query('ROLLBACK');
        return res.status(400).json({ message: `Category "${category_id}" not found` });
      }
    } else if (category_id) {
      // Convert to integer if it's a numeric string
      categoryIdToUse = parseInt(category_id, 10);
    }
    
    // Get priority ID if a name was provided instead of an ID
    let priorityIdToUse = priority_id;
    
    if (priority_id && isNaN(parseInt(priority_id))) {
      // If priority_id is not a number, assume it's a name and look up the ID
      const priorityQuery = `
        SELECT id FROM priorities WHERE name = $1
      `;
      const priorityResult = await db.query(priorityQuery, [priority_id]);
      
      if (priorityResult.rows.length > 0) {
        priorityIdToUse = priorityResult.rows[0].id;
      } else {
        // Priority not found
        await db.query('ROLLBACK');
        return res.status(400).json({ message: `Priority "${priority_id}" not found` });
      }
    } else if (priority_id) {
      // Convert to integer if it's a numeric string
      priorityIdToUse = parseInt(priority_id, 10);
    }
    
    // Insert the routine
    const routineQuery = `
      INSERT INTO routines (
        user_id, 
        title, 
        start_time, 
        end_time, 
        category_id, 
        priority_id, 
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const routineResult = await db.query(routineQuery, [
      userId, 
      title, 
      start_time, 
      end_time, 
      categoryIdToUse, 
      priorityIdToUse, 
      status
    ]);
    
    const routine = routineResult.rows[0];
    
    // Insert days for the routine
    for (const day of days) {
      // Check if the day exists in the days table
      const dayCheckQuery = `
        SELECT day_id FROM days WHERE days = $1
      `;
      
      const dayCheckResult = await db.query(dayCheckQuery, [day]);
      
      let dayId;
      
      if (dayCheckResult.rows.length === 0) {
        // Insert the day if it doesn't exist
        const dayInsertQuery = `
          INSERT INTO days (days)
          VALUES ($1)
          RETURNING day_id
        `;
        
        const dayInsertResult = await db.query(dayInsertQuery, [day]);
        dayId = dayInsertResult.rows[0].day_id;
      } else {
        dayId = dayCheckResult.rows[0].day_id;
      }
      
      // Insert the routine-day relationship
      const routineDayQuery = `
        INSERT INTO routine_days (routine_id, day_id)
        VALUES ($1, $2)
      `;
      
      await db.query(routineDayQuery, [routine.routine_id, dayId]);
    }
    
    // Initialize completion data
    const completionDataQuery = `
      INSERT INTO routine_completion_data (
        routine_id, 
        streak, 
        completion_rate
      )
      VALUES ($1, 0, 0)
    `;
    
    await db.query(completionDataQuery, [routine.routine_id]);
    
    // Get the category and priority names for the response
    let categoryName = category_id;
    let priorityName = priority_id;
    
    if (categoryIdToUse) {
      const categoryNameQuery = `
        SELECT name FROM categories WHERE id = $1
      `;
      const categoryNameResult = await db.query(categoryNameQuery, [categoryIdToUse]);
      if (categoryNameResult.rows.length > 0) {
        categoryName = categoryNameResult.rows[0].name;
      }
    }
    
    if (priorityIdToUse) {
      const priorityNameQuery = `
        SELECT name FROM priorities WHERE id = $1
      `;
      const priorityNameResult = await db.query(priorityNameQuery, [priorityIdToUse]);
      if (priorityNameResult.rows.length > 0) {
        priorityName = priorityNameResult.rows[0].name;
      }
    }
    
    // Commit the transaction
    await db.query('COMMIT');
    
    // Return the created routine with days
    const createdRoutine = {
      ...routine,
      days,
      category: categoryName,
      priority: priorityName,
      completionData: {
        streak: 0,
        lastCompleted: null,
        completionRate: 0,
        history: []
      }
    };
    
    res.status(201).json(createdRoutine);
  } catch (error) {
    // Rollback the transaction in case of error
    await db.query('ROLLBACK');
    console.error('Error creating routine:', error);
    res.status(500).json({ message: 'Server error while creating routine' });
  }
};

// Update a routine
const updateRoutine = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { 
      title, 
      start_time, 
      end_time, 
      category_id, 
      priority_id, 
      status, 
      days 
    } = req.body;
    
    // Get timezone-adjusted timestamp functions
    const { timestamp } = getClientAdjustedTime(req.clientTimezone?.name);
    
    // Validate required fields
    if (!title || !start_time || !end_time || !days || !Array.isArray(days) || days.length === 0) {
      return res.status(400).json({ 
        message: 'Title, start time, end time, and at least one day are required' 
      });
    }
    
    // Check if the routine exists and belongs to the user
    const routineCheckQuery = `
      SELECT * FROM routines
      WHERE routine_id = $1 AND user_id = $2
    `;
    
    const routineCheckResult = await db.query(routineCheckQuery, [id, userId]);
    
    if (routineCheckResult.rows.length === 0) {
      return res.status(404).json({ message: 'Routine not found or not authorized' });
    }
    
    // Start a transaction
    await db.query('BEGIN');
    
    // Get category ID if a name was provided instead of an ID
    let categoryIdToUse = category_id;
    
    if (category_id && isNaN(parseInt(category_id))) {
      // If category_id is not a number, assume it's a name and look up the ID
      const categoryQuery = `
        SELECT id FROM categories WHERE name = $1
      `;
      const categoryResult = await db.query(categoryQuery, [category_id]);
      
      if (categoryResult.rows.length > 0) {
        categoryIdToUse = categoryResult.rows[0].id;
      } else {
        // Category not found
        await db.query('ROLLBACK');
        return res.status(400).json({ message: `Category "${category_id}" not found` });
      }
    } else if (category_id) {
      // Convert to integer if it's a numeric string
      categoryIdToUse = parseInt(category_id, 10);
    }
    
    // Get priority ID if a name was provided instead of an ID
    let priorityIdToUse = priority_id;
    
    if (priority_id && isNaN(parseInt(priority_id))) {
      // If priority_id is not a number, assume it's a name and look up the ID
      const priorityQuery = `
        SELECT id FROM priorities WHERE name = $1
      `;
      const priorityResult = await db.query(priorityQuery, [priority_id]);
      
      if (priorityResult.rows.length > 0) {
        priorityIdToUse = priorityResult.rows[0].id;
      } else {
        // Priority not found
        await db.query('ROLLBACK');
        return res.status(400).json({ message: `Priority "${priority_id}" not found` });
      }
    } else if (priority_id) {
      // Convert to integer if it's a numeric string
      priorityIdToUse = parseInt(priority_id, 10);
    }
    
    // Update the routine using the timezone-adjusted timestamp
    const routineUpdateQuery = `
      UPDATE routines
      SET 
        title = $1, 
        start_time = $2, 
        end_time = $3, 
        category_id = $4, 
        priority_id = $5, 
        status = $6,
        updated_at = ${timestamp}
      WHERE routine_id = $7
      RETURNING *
    `;
    
    const routineUpdateResult = await db.query(routineUpdateQuery, [
      title, 
      start_time, 
      end_time, 
      categoryIdToUse, 
      priorityIdToUse, 
      status, 
      id
    ]);
    
    const updatedRoutine = routineUpdateResult.rows[0];
    
    // Delete existing routine-day relationships
    const deleteRoutineDaysQuery = `
      DELETE FROM routine_days
      WHERE routine_id = $1
    `;
    
    await db.query(deleteRoutineDaysQuery, [id]);
    
    // Insert new days for the routine
    for (const day of days) {
      // Check if the day exists in the days table
      const dayCheckQuery = `
        SELECT day_id FROM days WHERE days = $1
      `;
      
      const dayCheckResult = await db.query(dayCheckQuery, [day]);
      
      let dayId;
      
      if (dayCheckResult.rows.length === 0) {
        // Insert the day if it doesn't exist
        const dayInsertQuery = `
          INSERT INTO days (days)
          VALUES ($1)
          RETURNING day_id
        `;
        
        const dayInsertResult = await db.query(dayInsertQuery, [day]);
        dayId = dayInsertResult.rows[0].day_id;
      } else {
        dayId = dayCheckResult.rows[0].day_id;
      }
      
      // Insert the routine-day relationship
      const routineDayQuery = `
        INSERT INTO routine_days (routine_id, day_id)
        VALUES ($1, $2)
      `;
      
      await db.query(routineDayQuery, [id, dayId]);
    }
    
    // Get completion data
    const completionDataQuery = `
      SELECT * FROM routine_completion_data
      WHERE routine_id = $1
    `;
    
    const completionDataResult = await db.query(completionDataQuery, [id]);
    const completionData = completionDataResult.rows[0] || { streak: 0, completion_rate: 0 };
    
    // Get completion history
    const historyQuery = `
      SELECT 
        completion_date::text, 
        completed 
      FROM 
        routine_completion_history
      WHERE 
        routine_id = $1
      ORDER BY 
        completion_date DESC
      LIMIT 10
    `;
    
    const historyResult = await db.query(historyQuery, [id]);
    
    // Get the category and priority names for the response
    let categoryName = category_id;
    let priorityName = priority_id;
    
    if (categoryIdToUse) {
      const categoryNameQuery = `
        SELECT name FROM categories WHERE id = $1
      `;
      const categoryNameResult = await db.query(categoryNameQuery, [categoryIdToUse]);
      if (categoryNameResult.rows.length > 0) {
        categoryName = categoryNameResult.rows[0].name;
      }
    }
    
    if (priorityIdToUse) {
      const priorityNameQuery = `
        SELECT name FROM priorities WHERE id = $1
      `;
      const priorityNameResult = await db.query(priorityNameQuery, [priorityIdToUse]);
      if (priorityNameResult.rows.length > 0) {
        priorityName = priorityNameResult.rows[0].name;
      }
    }
    
    // Commit the transaction
    await db.query('COMMIT');
    
    // Return the updated routine with days and completion data
    const routineWithData = {
      ...updatedRoutine,
      days,
      category: categoryName,
      priority: priorityName,
      completionData: {
        streak: completionData.streak || 0,
        lastCompleted: completionData.last_completed,
        completionRate: completionData.completion_rate || 0,
        history: historyResult.rows
      }
    };
    
    res.status(200).json(routineWithData);
  } catch (error) {
    // Rollback the transaction in case of error
    await db.query('ROLLBACK');
    console.error('Error updating routine:', error);
    res.status(500).json({ message: 'Server error while updating routine' });
  }
};

// Helper for diagnosing database relationship issues
const diagnoseRoutineRelationships = async (routineId) => {
  try {
    console.log(`Diagnosing relationships for routine ID ${routineId}`);
    
    // Check routine_completion_history
    const historyQuery = `
      SELECT COUNT(*) as count FROM routine_completion_history
      WHERE routine_id = $1
    `;
    const historyResult = await db.query(historyQuery, [routineId]);
    console.log(`Found ${historyResult.rows[0].count} history records`);
    
    // Check routine_completion_data
    const dataQuery = `
      SELECT COUNT(*) as count FROM routine_completion_data
      WHERE routine_id = $1
    `;
    const dataResult = await db.query(dataQuery, [routineId]);
    console.log(`Found ${dataResult.rows[0].count} completion data records`);
    
    // Check routine_days
    const daysQuery = `
      SELECT COUNT(*) as count FROM routine_days
      WHERE routine_id = $1
    `;
    const daysResult = await db.query(daysQuery, [routineId]);
    console.log(`Found ${daysResult.rows[0].count} day relationships`);
    
    // Check any other potential relationships
    const otherRelationshipsQuery = `
      SELECT
        (SELECT COUNT(*) FROM pg_constraint 
         WHERE conrelid = 'routines'::regclass 
         AND confrelid != 0) as foreign_keys_to_routines,
        (SELECT array_agg(conname) FROM pg_constraint 
         WHERE conrelid = 'routines'::regclass 
         AND confrelid != 0) as constraint_names
    `;
    const otherResult = await db.query(otherRelationshipsQuery);
    console.log(`Found ${otherResult.rows[0].foreign_keys_to_routines} foreign key relationships to routines table`);
    console.log(`Constraint names: ${JSON.stringify(otherResult.rows[0].constraint_names)}`);
    
    return {
      historyCount: historyResult.rows[0].count,
      dataCount: dataResult.rows[0].count,
      daysCount: daysResult.rows[0].count,
      foreignKeyCount: otherResult.rows[0].foreign_keys_to_routines,
      constraintNames: otherResult.rows[0].constraint_names
    };
  } catch (error) {
    console.error('Error diagnosing relationships:', error);
    return null;
  }
};

// Delete a routine
const deleteRoutine = async (req, res) => {
  // Start a transaction to ensure all delete operations are atomic
  await db.query('BEGIN');
  
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    console.log(`Attempting to delete routine ${id} for user ${userId}`);
    
    // Check if the routine exists and belongs to the user
    const routineCheckQuery = `
      SELECT * FROM routines
      WHERE routine_id = $1 AND user_id = $2
    `;
    
    const routineCheckResult = await db.query(routineCheckQuery, [id, userId]);
    
    if (routineCheckResult.rows.length === 0) {
      console.log(`Routine ${id} not found or not authorized for user ${userId}`);
      await db.query('ROLLBACK');
      return res.status(404).json({ message: 'Routine not found or not authorized' });
    }
    
    console.log(`Found routine ${id}, proceeding with deletion`);
    
    // Run diagnostics before attempting delete
    await diagnoseRoutineRelationships(id);
    
    try {
      // First delete from routine_completion_history
      const deleteHistoryQuery = `
        DELETE FROM routine_completion_history
        WHERE routine_id = $1
      `;
      await db.query(deleteHistoryQuery, [id]);
      console.log(`Deleted completion history for routine ${id}`);
    } catch (historyError) {
      console.error('Error deleting routine completion history:', historyError);
      // Log but continue with other deletions
    }
    
    try {
      // Then delete from routine_completion_data
      const deleteCompletionDataQuery = `
        DELETE FROM routine_completion_data
        WHERE routine_id = $1
      `;
      await db.query(deleteCompletionDataQuery, [id]);
      console.log(`Deleted completion data for routine ${id}`);
    } catch (dataError) {
      console.error('Error deleting routine completion data:', dataError);
      // Log but continue with other deletions
    }
    
    try {
      // Then delete from routine_days
      const deleteRoutineDaysQuery = `
        DELETE FROM routine_days
        WHERE routine_id = $1
      `;
      await db.query(deleteRoutineDaysQuery, [id]);
      console.log(`Deleted days associations for routine ${id}`);
    } catch (daysError) {
      console.error('Error deleting routine days:', daysError);
      // Log but continue with main deletion
    }
    
    // Finally delete the routine itself
    try {
      const deleteQuery = `
        DELETE FROM routines
        WHERE routine_id = $1 AND user_id = $2
      `;
      
      const deleteResult = await db.query(deleteQuery, [id, userId]);
      
      if (deleteResult.rowCount === 0) {
        throw new Error(`Routine with ID ${id} could not be deleted`);
      }
      
      console.log(`Successfully deleted routine ${id}`);
      
      // Commit transaction if everything succeeded
      await db.query('COMMIT');
      return res.status(200).json({ message: 'Routine deleted successfully' });
    } catch (routineError) {
      console.error('Error deleting the routine itself:', routineError);
      throw routineError; // Rethrow to trigger rollback
    }
  } catch (error) {
    // Rollback transaction on any error
    await db.query('ROLLBACK');
    console.error('Error deleting routine, transaction rolled back:', error);
    res.status(500).json({ 
      message: 'Server error while deleting routine',
      error: error.message
    });
  }
};

// Toggle routine active status (via the status field)
const toggleRoutineActive = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Get timezone-adjusted timestamp functions
    const { timestamp } = getClientAdjustedTime(req.clientTimezone?.name);
    
    // Check if the routine exists and belongs to the user
    const routineCheckQuery = `
      SELECT r.*, c.name AS category_name, p.name AS priority_name
      FROM routines r
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN priorities p ON r.priority_id = p.id
      WHERE r.routine_id = $1 AND r.user_id = $2
    `;
    
    const routineCheckResult = await db.query(routineCheckQuery, [id, userId]);
    
    if (routineCheckResult.rows.length === 0) {
      return res.status(404).json({ message: 'Routine not found or not authorized' });
    }
    
    const routine = routineCheckResult.rows[0];
    const newStatus = routine.status === 'active' ? 'inactive' : 'active';
    
    // Update the routine status with timezone-adjusted timestamp
    const updateQuery = `
      UPDATE routines
      SET status = $1, updated_at = ${timestamp}
      WHERE routine_id = $2
      RETURNING *
    `;
    
    const updateResult = await db.query(updateQuery, [newStatus, id]);
    const updatedRoutine = updateResult.rows[0];
    
    // Get the days for the routine
    const daysQuery = `
      SELECT d.days
      FROM routine_days rd
      JOIN days d ON rd.day_id = d.day_id
      WHERE rd.routine_id = $1
    `;
    
    const daysResult = await db.query(daysQuery, [id]);
    const days = daysResult.rows.map(row => row.days);
    
    // Get completion data
    const completionDataQuery = `
      SELECT * FROM routine_completion_data
      WHERE routine_id = $1
    `;
    
    const completionDataResult = await db.query(completionDataQuery, [id]);
    const completionData = completionDataResult.rows[0] || { streak: 0, completion_rate: 0 };
    
    // Get completion history
    const historyQuery = `
      SELECT 
        completion_date::text, 
        completed 
      FROM 
        routine_completion_history
      WHERE 
        routine_id = $1
      ORDER BY 
        completion_date DESC
      LIMIT 10
    `;
    
    const historyResult = await db.query(historyQuery, [id]);
    
    // Return the updated routine with days and completion data
    const routineWithData = {
      ...updatedRoutine,
      days,
      active: newStatus === 'active',
      category: routine.category_name || null,
      priority: routine.priority_name || null,
      completionData: {
        streak: completionData.streak || 0,
        lastCompleted: completionData.last_completed,
        completionRate: completionData.completion_rate || 0,
        history: historyResult.rows
      }
    };
    
    res.status(200).json(routineWithData);
  } catch (error) {
    console.error('Error toggling routine active status:', error);
    res.status(500).json({ message: 'Server error while toggling routine active status' });
  }
};

// Get max routine streaks for a user (both current and longest)
const getRoutineStreaks = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Using the streak calculation SQL query to find the current and longest streaks
    const query = `
      WITH completed_days AS (
        SELECT
            rch.routine_id,
            rch.completion_date
        FROM routine_completion_history rch
        JOIN routines r ON rch.routine_id = r.routine_id
        WHERE rch.completed = TRUE AND r.user_id = $1
      ),
      streak_groups AS (
        SELECT
            routine_id,
            completion_date,
            completion_date - (ROW_NUMBER() OVER (PARTITION BY routine_id ORDER BY completion_date))::integer AS streak_group
        FROM completed_days
      ),
      streaks AS (
        SELECT
            routine_id,
            MIN(completion_date) AS streak_start,
            MAX(completion_date) AS streak_end,
            COUNT(*) AS streak_length
        FROM streak_groups
        GROUP BY routine_id, streak_group
      ),
      longest_streaks AS (
        SELECT
            routine_id,
            MAX(streak_length) AS longest_streak
        FROM streaks
        GROUP BY routine_id
      ),
      current_streaks AS (
        SELECT
            routine_id,
            streak_length AS current_streak
        FROM streaks
        WHERE streak_end = CURRENT_DATE OR streak_end = (CURRENT_DATE - INTERVAL '1 day')::date
      ),
      all_routine_streaks AS (
        SELECT 
            r.routine_id,
            COALESCE(cs.current_streak, 0) AS current_streak,
            COALESCE(ls.longest_streak, 0) AS longest_streak
        FROM routines r
        LEFT JOIN current_streaks cs ON r.routine_id = cs.routine_id
        LEFT JOIN longest_streaks ls ON r.routine_id = ls.routine_id
        WHERE r.user_id = $1
      )
      SELECT 
        MAX(current_streak) AS max_current_streak,
        MAX(longest_streak) AS max_longest_streak
      FROM all_routine_streaks;
    `;
    
    const result = await db.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(200).json({ 
        current: 0, 
        longest: 0 
      });
    }
    
    // Return the results formatted for the streak card
    res.status(200).json({
      current: result.rows[0].max_current_streak || 0,
      longest: result.rows[0].max_longest_streak || 0
    });
    
  } catch (error) {
    console.error('Error calculating routine streaks:', error);
    res.status(500).json({ message: 'Server error while calculating routine streaks' });
  }
};

// Get routine completion history for a specific routine
const getRoutineCompletionHistory = async (req, res) => {
  try {
    const { routineId } = req.params;
    const userId = req.user.id;
    
    // First verify that the routine belongs to the user
    const routineQuery = `
      SELECT * FROM routines 
      WHERE routine_id = $1 AND user_id = $2
    `;
    
    const routineResult = await db.query(routineQuery, [routineId, userId]);
    
    if (routineResult.rows.length === 0) {
      return res.status(404).json({ message: 'Routine not found or not authorized' });
    }
    
    // Get the completion history
    const historyQuery = `
      SELECT 
        history_id, 
        routine_id, 
        completion_date::text, 
        completed 
      FROM routine_completion_history
      WHERE routine_id = $1
      ORDER BY completion_date DESC
    `;
    
    const historyResult = await db.query(historyQuery, [routineId]);
    
    res.status(200).json(historyResult.rows);
  } catch (error) {
    console.error('Error fetching routine completion history:', error);
    res.status(500).json({ message: 'Server error while fetching completion history' });
  }
};

// Toggle completion status for a routine on a specific date
const toggleRoutineCompletion = async (req, res) => {
  try {
    const { routineId, completionDate, completed } = req.body;
    const userId = req.user.id;
    
    if (!routineId || !completionDate) {
      return res.status(400).json({ message: 'Routine ID and completion date are required' });
    }
    
    // Parse the client's date using our utility function
    const formattedDate = parseClientDate(completionDate);
    
    // Get timezone-adjusted time functions
    const { today } = getClientAdjustedTime(req.clientTimezone?.name);
    
    // Verify that the routine belongs to the user
    const routineQuery = `
      SELECT * FROM routines
      WHERE routine_id = $1 AND user_id = $2
    `;
    
    const routineResult = await db.query(routineQuery, [routineId, userId]);
    
    if (routineResult.rows.length === 0) {
      return res.status(404).json({ message: 'Routine not found or not authorized' });
    }
    
    // Check if a history record exists for this routine and date
    const checkQuery = `
      SELECT * FROM routine_completion_history
      WHERE routine_id = $1 AND completion_date = $2
    `;
    
    const checkResult = await db.query(checkQuery, [routineId, formattedDate]);
    
    let result;
    
    if (checkResult.rows.length > 0) {
      // Update existing record
      const updateQuery = `
        UPDATE routine_completion_history
        SET completed = $1
        WHERE routine_id = $2 AND completion_date = $3
        RETURNING history_id, routine_id, completion_date::text, completed
      `;
      
      result = await db.query(updateQuery, [completed, routineId, formattedDate]);
    } else {
      // Create new record
      const insertQuery = `
        INSERT INTO routine_completion_history (routine_id, completion_date, completed)
        VALUES ($1, $2, $3)
        RETURNING history_id, routine_id, completion_date::text, completed
      `;
      
      result = await db.query(insertQuery, [routineId, formattedDate, completed]);
    }
    
    // Update routine_completion_data with the new streak and last_completed date
    if (completed) {
      // First, check if there's an entry in routine_completion_data
      const dataCheckQuery = `
        SELECT * FROM routine_completion_data
        WHERE routine_id = $1
      `;
      
      const dataCheckResult = await db.query(dataCheckQuery, [routineId]);
      
      // Calculate the current streak using timezone-adjusted dates
      const streakQuery = `
        WITH completed_days AS (
          SELECT
              routine_id,
              completion_date
          FROM routine_completion_history
          WHERE completed = TRUE AND routine_id = $1
        ),
        streak_groups AS (
          SELECT
              routine_id,
              completion_date,
              completion_date - (ROW_NUMBER() OVER (PARTITION BY routine_id ORDER BY completion_date))::integer AS streak_group
          FROM completed_days
        ),
        streaks AS (
          SELECT
              routine_id,
              MIN(completion_date) AS streak_start,
              MAX(completion_date) AS streak_end,
              COUNT(*) AS streak_length
          FROM streak_groups
          GROUP BY routine_id, streak_group
        ),
        current_streak AS (
          SELECT
              routine_id,
              streak_length AS current_streak
          FROM streaks
          WHERE streak_end = $2
          ORDER BY streak_length DESC
          LIMIT 1
        )
        SELECT COALESCE(current_streak, 0) as current_streak
        FROM current_streak
      `;
      
      const streakResult = await db.query(streakQuery, [routineId, formattedDate]);
      const currentStreak = streakResult.rows.length > 0 ? streakResult.rows[0].current_streak : 1;
      
      // Calculate completion rate
      const completionRateQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE completed = TRUE) * 100 / COUNT(*) as completion_rate
        FROM 
          routine_completion_history
        WHERE 
          routine_id = $1
      `;
      
      const completionRateResult = await db.query(completionRateQuery, [routineId]);
      const completionRate = completionRateResult.rows[0].completion_rate || 0;
      
      if (dataCheckResult.rows.length > 0) {
        // Update existing record
        const updateDataQuery = `
          UPDATE routine_completion_data
          SET streak = $1, last_completed = $2, completion_rate = $3
          WHERE routine_id = $4
          RETURNING *
        `;
        
        await db.query(updateDataQuery, [currentStreak, formattedDate, completionRate, routineId]);
      } else {
        // Create new record
        const insertDataQuery = `
          INSERT INTO routine_completion_data (routine_id, streak, last_completed, completion_rate)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `;
        
        await db.query(insertDataQuery, [routineId, currentStreak, formattedDate, completionRate]);
      }
      
      // Get the updated completion data
      const updatedDataQuery = `
        SELECT * FROM routine_completion_data
        WHERE routine_id = $1
      `;
      
      const updatedDataResult = await db.query(updatedDataQuery, [routineId]);
      const updatedData = updatedDataResult.rows[0];
      
      // Return the updated completion data along with the history record
      return res.status(200).json({
        ...result.rows[0],
        streak: updatedData.streak,
        lastCompleted: updatedData.last_completed,
        completionRate: updatedData.completion_rate
      });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error toggling routine completion:', error);
    res.status(500).json({ message: 'Server error while updating routine completion' });
  }
};

export default {
  getAllRoutines,
  getRoutineById,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  toggleRoutineActive,
  getRoutineStreaks,
  getRoutineCompletionHistory,
  toggleRoutineCompletion
};