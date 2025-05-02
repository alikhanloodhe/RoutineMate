const express = require('express'); // Express

const {addTask,fetchTasks,deleteTask,editTask,startSession,endSession} = require('../controllers/TaskController');

const { authenticate } = require('../middleware/auth');
const router = express.Router();
router.use(authenticate);
router.post('/AddTask',addTask);

router.get('/fetchTasks',fetchTasks);

router.delete('/deleteTask/:task_id',deleteTask);
router.put('/updateTask/:task_id',editTask);

router.post('/startSession',startSession);
router.patch('/endSession',endSession);

module.exports = router;