import pool from '../config/db.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

/**
 * Check if the Smart Schedule SQL function exists in the database
 */
const initSmartScheduleFunction = async () => {
  try {
    console.log('Checking Smart Schedule SQL function...');
    
    // Just verify the function exists rather than recreating it
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM pg_proc 
        WHERE proname = 'get_weekly_productivity_data'
      ) AS function_exists;
    `);
    
    if (result.rows[0].function_exists) {
      console.log('Smart Schedule SQL function exists!');
    } else {
      console.warn('Smart Schedule SQL function does not exist in the database. Please create it manually.');
    }
  } catch (error) {
    console.error('Error checking Smart Schedule SQL function:', error);
  }
};

// Execute the function if this script is run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initSmartScheduleFunction().then(() => {
    console.log('Done.');
    process.exit(0);
  }).catch(err => {
    console.error('Initialization failed:', err);
    process.exit(1);
  });
}

export default initSmartScheduleFunction; 