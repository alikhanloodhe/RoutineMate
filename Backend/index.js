import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import ensureDirectoriesExist from './utils/ensureDirectories.js';

import authRoutes from './routes/authRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import habitTrackingRoutes from './routes/habitTrackingRoutes.js';
import friendsRoute from './routes/friendsRoute.js';
import taskRoutes from './routes/taskRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import groupGoalRoutes from './routes/groupGoalRoutes.js';
import goalPostRoutes from './routes/goalPostRoutes.js';

// Get directory name using ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Ensure required directories exist
ensureDirectoriesExist();

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('Serving static files from:', path.join(__dirname, 'uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/habit-tracking', habitTrackingRoutes);
app.use('/api/friends', friendsRoute);
app.use('/api/tasks', taskRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/groupGoals', groupGoalRoutes);
app.use('/api/goal-posts', goalPostRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
