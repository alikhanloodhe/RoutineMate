const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes.js');
const habitRoutes = require('./routes/habitRoutes.js');
const trackingRoutes = require('./routes/trackingRoutes.js');
const friendsRoute = require('./routes/friendsRoute');
const taskRoutes = require('./routes/taskRoutes.js');
const goalRoutes = require('./routes/goalRoutes.js');
const addMilestoneRoutes = require('./routes/goalRoutes.js');
const deleteGoalRoutes = require('./routes/goalRoutes.js');
const activityRoutes = require('./routes/activityRoutes.js');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/friends',friendsRoute);
app.use('/api/Tasks',taskRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/addMilestone', addMilestoneRoutes);
app.use('/api/deleteGoal', deleteGoalRoutes);
app.use('/api/activities', activityRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
