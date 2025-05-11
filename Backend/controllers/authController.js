import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// Excluding verify e-mail everything is same like I have
export const signUp = async (req, res) => {
    try {
        // Log request body for debugging
        console.log('Signup request body:', req.body);
        
        const { name, email, password } = req.body;
        
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ msg: "Please provide name, email and password" });
        }
        
        // Check if user exists
        const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (userExist.rows.length > 0) {
            return res.status(400).json({ msg: "User already exists" });
        }
        
        console.log("No user exists, signing up", name);
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Insert user
        const newUser = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, hashedPassword]
        );
        
        // Create JWT Token
        const token = jwt.sign(
            { id: newUser.rows[0].id }, 
            process.env.JWT_SECRET || 'defaultsecret', 
            { expiresIn: '2h' }
        );
        
        // Return success response
        return res.status(201).json({ 
            token, 
            user: {
                id: newUser.rows[0].id,
                name: newUser.rows[0].name,
                email: newUser.rows[0].email
            }
        });
    } catch (err) {
        console.error('Signup error:', err);
        return res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ msg: "Please provide email and password" });
        }
        
        // Check if user exists
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (user.rows.length === 0) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }
        
        // Compare password
        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }
        
        // Create JWT Token
        const token = jwt.sign(
            { id: user.rows[0].id }, 
            process.env.JWT_SECRET || 'defaultsecret', 
            { expiresIn: '2h' }
        );
        
        // Return success response
        return res.json({ 
            token, 
            user: {
                id: user.rows[0].id,
                name: user.rows[0].name,
                email: user.rows[0].email
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};  

export const getUser = async (req, res) => { 
    try {
        const userId = req.user.id;
        
        const user = await pool.query('SELECT  id, name, email FROM users WHERE id = $1', [userId]);
        
        if (user.rows.length === 0) {
            return res.status(404).json({ msg: "User not found" });
        }
        
        return res.json(user.rows[0]);
    } catch (err) {
        console.error('Get user error:', err);
        return res.status(500).json({ msg: 'Server Error', error: err.message });
    }
}