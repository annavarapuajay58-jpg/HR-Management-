const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/auth');

router.get('/my', authenticateToken, taskController.getMyTasks);
router.get('/assigned-by-me', authenticateToken, taskController.getAssignedTasks);
router.post('/', authenticateToken, taskController.createTask);
router.patch('/:id', authenticateToken, taskController.updateTask);

module.exports = router;
