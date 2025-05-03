import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ensureDirectoriesExist from './utils/ensureDirectories.js';

import authRoutes from './routes/authRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import trackingRoutes from './routes/trackingRoutes.js';
import friendsRoute from './routes/friendsRoute.js';
import taskRoutes from './routes/taskRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import activityRoutes from './routes/activityRoutes.js';

dotenv.config();

// Ensure required directories exist
ensureDirectoriesExist();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/friends', friendsRoute);
app.use('/api/tasks', taskRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/activities', activityRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
