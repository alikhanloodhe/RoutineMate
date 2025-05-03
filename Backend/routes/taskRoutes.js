import express from 'express';
import {
  addTask,
  fetchTasks,
  deleteTask,
  editTask,
  startSession,
  endSession
} from '../controllers/TaskController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

router.post('/AddTask', addTask);
router.get('/fetchTasks', fetchTasks);
router.delete('/deleteTask/:task_id', deleteTask);
router.put('/updateTask/:task_id', editTask);
router.post('/startSession', startSession);
router.patch('/endSession', endSession);

export default router;