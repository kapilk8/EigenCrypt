const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const logger = require('../utils/logger');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Create a new project
router.post('/', authenticateToken, async (req, res) => {
  try {
    const projectData = {
      ...req.body,
      owner: req.user.id
    };

    const project = new Project(projectData);
    await project.save();

    logger.info(`Project created: ${project._id} by user ${req.user.id}`);
    res.status(201).json(project);
  } catch (error) {
    logger.error('Project creation error', { error: error.message });
    res.status(400).json({ message: 'Project creation failed', error: error.message });
  }
});

// Get all projects (with filtering and pagination)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      status, 
      visibility,
      page = 1, 
      limit = 10 
    } = req.query;

    const query = {
      $or: [
        { owner: req.user.id },
        { 'members.user': req.user.id },
        { visibility: 'PUBLIC' }
      ]
    };

    if (status) query.status = status;
    if (visibility) query.visibility = visibility;

    const projects = await Project.find(query)
      .populate('owner', 'username')
      .populate('members.user', 'username')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Project.countDocuments(query);

    res.json({
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    logger.error('Projects fetch error', { error: error.message });
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
});

// Get a specific project with detailed information
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'username')
      .populate('members.user', 'username')
      .populate({
        path: 'tasks',
        populate: [
          { path: 'assignedTo', select: 'username' },
          { path: 'createdBy', select: 'username' }
        ]
      });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check project access permissions
    const isOwner = project.owner._id.toString() === req.user.id;
    const isMember = project.members.some(m => m.user._id.toString() === req.user.id);
    const isPublic = project.visibility === 'PUBLIC';

    if (!isOwner && !isMember && !isPublic) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    logger.error('Project fetch error', { error: error.message });
    res.status(500).json({ message: 'Error fetching project', error: error.message });
  }
});

// Update a project
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only project owner or admin can update
    if (project.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this project' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    logger.info(`Project updated: ${updatedProject._id} by user ${req.user.id}`);
    res.json(updatedProject);
  } catch (error) {
    logger.error('Project update error', { error: error.message });
    res.status(400).json({ message: 'Project update failed', error: error.message });
  }
});

// Delete a project
router.delete('/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Delete associated tasks
    await Task.deleteMany({ project: req.params.id });

    logger.info(`Project deleted: ${req.params.id} by user ${req.user.id}`);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    logger.error('Project deletion error', { error: error.message });
    res.status(500).json({ message: 'Project deletion failed', error: error.message });
  }
});

// Add a member to a project
router.post('/:id/members', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only project owner or admin can add members
    if (project.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to add members' });
    }

    const { userId, role } = req.body;

    // Check if user is already a member
    const isMember = project.members.some(m => m.user.toString() === userId);
    if (isMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    project.members.push({ 
      user: userId, 
      role: role || 'CONTRIBUTOR' 
    });

    await project.save();

    logger.info(`Member added to project: ${project._id} by user ${req.user.id}`);
    res.status(201).json(project);
  } catch (error) {
    logger.error('Member addition error', { error: error.message });
    res.status(400).json({ message: 'Member addition failed', error: error.message });
  }
});

// Remove a member from a project
router.delete('/:id/members/:userId', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only project owner or admin can remove members
    if (project.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to remove members' });
    }

    project.members = project.members.filter(
      m => m.user.toString() !== req.params.userId
    );

    await project.save();

    logger.info(`Member removed from project: ${project._id} by user ${req.user.id}`);
    res.json(project);
  } catch (error) {
    logger.error('Member removal error', { error: error.message });
    res.status(400).json({ message: 'Member removal failed', error: error.message });
  }
});

module.exports = router; 