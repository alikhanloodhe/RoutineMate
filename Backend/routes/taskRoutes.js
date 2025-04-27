const express = require('express'); // Express

const {addTask,fetchTasks,deleteTask,editTask} = require('../controllers/TaskController');

const verifyToken = require('../middleware/auth');
const router = express.Router();

router.post('/AddTask',verifyToken,addTask);
router.get('/fetchTasks',verifyToken,fetchTasks);
router.delete('/deleteTask/:task_id',deleteTask);
router.put('/editTask/:task_id',verifyToken,editTask);

module.exports = router;