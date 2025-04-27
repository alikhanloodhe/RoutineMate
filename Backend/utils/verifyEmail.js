const pool = require('../config/db');
const jwt = require('jsonwebtoken');

exports.verifyEmail = async (req, res) => {
    const { token } = req.query;
    console.log('Received token');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
  
      await pool.query('UPDATE users SET is_verified = true WHERE id = $1', [userId]);
  
      res.status(200).send('Email verified successfully!');
    } catch (err) {
      console.error(err);
      res.status(400).send('Invalid or expired token');
}
}