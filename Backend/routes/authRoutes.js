import express from 'express';

import { signUp, login,getUser } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();   

// Route for user registration

router.post('/signup', signUp);
router.post('/login', login);
router.get('/getUser', authenticate, getUser);
export default router;