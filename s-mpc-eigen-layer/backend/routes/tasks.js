const express = require('express');
const Task = require('../models/Task');
const logger = require('../utils/logger');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Create a new task
router.post('/', authenticateToken, async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      createdBy: req.user.id
    };

    const task = new Task(taskData);
    await task.save();

    logger.info(`Task created: ${task._id} by user ${req.user.id}`);
    res.status(201).json(task);
  } catch (error) {
    logger.error('Task creation error', { error: error.message });
    res.status(400).json({ message: 'Task creation failed', error: error.message });
  }
});

// Get all tasks (with filtering and pagination)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      assignedTo, 
      page = 1, 
      limit = 10 
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    const tasks = await Task.find(query)
      .populate('createdBy', 'username')
      .populate('assignedTo', 'username')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    logger.error('Tasks fetch error', { error: error.message });
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

// Get a specific task
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('assignedTo', 'username')
      .populate('comments.user', 'username');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    logger.error('Task fetch error', { error: error.message });
    res.status(500).json({ message: 'Error fetching task', error: error.message });
  }
});

// Update a task
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only task creator or admin can update
    if (task.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this task' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    logger.info(`Task updated: ${updatedTask._id} by user ${req.user.id}`);
    res.json(updatedTask);
  } catch (error) {
    logger.error('Task update error', { error: error.message });
    res.status(400).json({ message: 'Task update failed', error: error.message });
  }
});

// Delete a task
router.delete('/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    logger.info(`Task deleted: ${req.params.id} by user ${req.user.id}`);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    logger.error('Task deletion error', { error: error.message });
    res.status(500).json({ message: 'Task deletion failed', error: error.message });
  }
});

// Add a comment to a task
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const comment = {
      user: req.user.id,
      text: req.body.text
    };

    task.comments.push(comment);
    await task.save();

    logger.info(`Comment added to task: ${task._id} by user ${req.user.id}`);
    res.status(201).json(task);
  } catch (error) {
    logger.error('Comment addition error', { error: error.message });
    res.status(400).json({ message: 'Comment addition failed', error: error.message });
  }
});

module.exports = router; 