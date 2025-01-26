const express = require('express');
const router = express.Router();
const { getAllTasks, updateTaskStatus, claimReward } = require('../controllers/adminController');
const { authenticateUser, requireAdmin } = require('../middleware/auth');

// Get all tasks (admin only)
router.get('/tasks', authenticateUser, requireAdmin, getAllTasks);

// Update task status (admin only)
router.patch('/tasks/:taskId', authenticateUser, requireAdmin, updateTaskStatus);

// Claim reward for a task
router.post('/tasks/:taskId/claim', authenticateUser, claimReward);

module.exports = router; 