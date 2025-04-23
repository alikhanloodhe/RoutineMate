// middleware/auth.js
const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET || 'my_secret_key'; // store safely in .env

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    
    return res.status(401).json({ message: 'Access token missing' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);  //  Decoding happens here
    req.user = decoded; // contains user_id and other payload
    
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

module.exports = verifyToken;
