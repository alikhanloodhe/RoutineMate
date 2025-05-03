import express from 'express';

import { signUp, login } from '../controllers/authController.js';

const router = express.Router();   

// Route for user registration
router.post('/signup', signUp);
router.post('/login', login);

export default router;