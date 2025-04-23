const express = require('express'); // Express

const {addTask,fetchTasks} = require('../controllers/TaskController');

const verifyToken = require('../middleware/auth');
const router = express.Router();

router.post('/AddTask',verifyToken,addTask);
router.get('/fetchTasks',verifyToken,fetchTasks);

module.exports = router;