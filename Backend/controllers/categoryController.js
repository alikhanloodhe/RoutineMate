import db from '../config/db.js';

// Get all categories
const getCategories = async (req, res) => {
  try {
    const query = `SELECT * FROM categories ORDER BY id ASC`;
    const result = await db.query(query);
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
};

export default {
  getCategories
}; 