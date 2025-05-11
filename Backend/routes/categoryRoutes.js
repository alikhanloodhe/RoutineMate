import express from 'express';
import categoryController from '../controllers/categoryController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// GET route for all categories
router.get('/', categoryController.getCategories);

export default router; 