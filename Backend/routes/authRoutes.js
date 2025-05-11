import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { signUp, login, getUser } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();   

// Route for user registration
router.post('/signup', signUp);
router.post('/login', login);
router.get('/getUser', authenticate, getUser);

// Legacy routes from auth.js

// Profile update endpoint
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get the current user from the database
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];
    const updates = {};
    
    // Validate email format if provided
    if (email) {
      if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
      
      // Check if email is already in use by another user
      if (email !== user.email) {
        const emailCheckResult = await pool.query(
          'SELECT * FROM users WHERE email = $1 AND id != $2',
          [email, userId]
        );
        
        if (emailCheckResult.rows.length > 0) {
          return res.status(400).json({ message: 'Email is already in use' });
        }
        
        updates.email = email;
      }
    }
    
    // Update name if provided
    if (name) {
      updates.name = name;
    }
    
    // Handle password change if requested
    if (newPassword) {
      // Verify current password
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to change password' });
      }
      
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      
      // Password requirements
      if (newPassword.length < 8) {
        return res.status(400).json({ message: 'New password must be at least 8 characters long' });
      }
      
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updates.password = hashedPassword;
    }
    
    // If no updates, return early
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid updates provided' });
    }
    
    // Add updated_at timestamp
    updates.updated_at = new Date();
    
    // Build the SQL query dynamically
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    
    const updateValues = Object.values(updates);
    
    const updateQuery = `
      UPDATE users 
      SET ${setClause}
      WHERE id = $${updateValues.length + 1}
      RETURNING id, name, email, created_at, updated_at
    `;
    
    // Execute the update query
    const result = await pool.query(
      updateQuery,
      [...updateValues, userId]
    );
    
    // Return the updated user info (excluding password)
    return res.json({ 
      message: 'Profile updated successfully', 
      user: result.rows[0]
    });
    
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error while retrieving profile' });
  }
});

export default router;