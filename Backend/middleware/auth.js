const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user exists
      const user = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [decoded.id]);
      
      if (user.rows.length === 0) {
        return res.status(401).json({ msg: 'User not found' });
      }
      
      // Add user data to request object
      req.user = user.rows[0];
      next();
    } catch (err) {
      console.error('Token verification failed:', err.message);
      res.status(401).json({ msg: 'Token is not valid' });
    }
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
}; 