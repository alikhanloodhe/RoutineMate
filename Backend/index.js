import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';
import helmet from 'helmet';
import ensureDirectoriesExist from './utils/ensureDirectories.js';
import initSmartScheduleFunction from './utils/initSmartSchedule.js';
import timezoneMiddleware from './middleware/timezoneMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import habitTrackingRoutes from './routes/habitTrackingRoutes.js';
import friendsRoute from './routes/friendsRoute.js';
import taskRoutes from './routes/taskRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import groupGoalRoutes from './routes/groupGoalRoutes.js';
import goalPostRoutes from './routes/goalPostRoutes.js';
import routineRoutes from './routes/routineRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Get directory name using ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Ensure required directories exist
ensureDirectoriesExist();

// Initialize Smart Schedule SQL function
initSmartScheduleFunction().catch(err => {
  console.error('Failed to initialize Smart Schedule function:', err);
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan('dev'));

// Apply timezone middleware to all routes
app.use(timezoneMiddleware);

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
app.use('/api/routines', routineRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);

// Simple health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../Frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../Frontend', 'build', 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT =  3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
//   console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
// });
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});


export default app;
