const express = require('express');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user's notifications with filtering and pagination
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      isRead, 
      type, 
      priority,
      page = 1, 
      limit = 20 
    } = req.query;

    const query = { recipient: req.user.id };

    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (type) query.type = type;
    if (priority) query.priority = priority;

    const notifications = await Notification.find(query)
      .populate('sender', 'username')
      .populate('relatedEntity.entityId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Notification.countDocuments(query);

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      unreadCount: await Notification.countDocuments({ 
        recipient: req.user.id, 
        isRead: false 
      })
    });
  } catch (error) {
    logger.error('Notifications fetch error', { error: error.message });
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

// Mark notifications as read
router.patch('/read', authenticateToken, async (req, res) => {
  try {
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ message: 'Invalid notification IDs' });
    }

    // Verify ownership of notifications
    const ownedNotifications = await Notification.find({
      _id: { $in: notificationIds },
      recipient: req.user.id
    });

    if (ownedNotifications.length !== notificationIds.length) {
      return res.status(403).json({ message: 'Unauthorized to mark some notifications' });
    }

    const result = await Notification.markAsRead(notificationIds);

    logger.info(`Notifications marked as read: ${notificationIds.join(', ')} by user ${req.user.id}`);
    res.json({ 
      message: 'Notifications marked as read', 
      updatedCount: result.modifiedCount 
    });
  } catch (error) {
    logger.error('Notification read update error', { error: error.message });
    res.status(500).json({ message: 'Error marking notifications', error: error.message });
  }
});

// Delete notifications
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ message: 'Invalid notification IDs' });
    }

    // Verify ownership of notifications
    const ownedNotifications = await Notification.find({
      _id: { $in: notificationIds },
      recipient: req.user.id
    });

    if (ownedNotifications.length !== notificationIds.length) {
      return res.status(403).json({ message: 'Unauthorized to delete some notifications' });
    }

    const result = await Notification.deleteMany({ 
      _id: { $in: notificationIds } 
    });

    logger.info(`Notifications deleted: ${notificationIds.join(', ')} by user ${req.user.id}`);
    res.json({ 
      message: 'Notifications deleted', 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    logger.error('Notification deletion error', { error: error.message });
    res.status(500).json({ message: 'Error deleting notifications', error: error.message });
  }
});

module.exports = router; 