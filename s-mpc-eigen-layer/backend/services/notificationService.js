const Notification = require('../models/Notification');
const logger = require('../utils/logger');

class NotificationService {
  // Create a new notification
  static async create(data) {
    try {
      const notification = new Notification(data);
      await notification.save();
      logger.info(`Notification created: ${notification._id}`);
      return notification;
    } catch (error) {
      logger.error('Notification creation error', { error: error.message });
      throw error;
    }
  }

  // Notify task assignment
  static async notifyTaskAssignment(task) {
    try {
      if (task.assignedTo) {
        await this.create({
          recipient: task.assignedTo,
          sender: task.createdBy,
          type: 'TASK_ASSIGNED',
          content: `You have been assigned a new task: ${task.title}`,
          relatedEntity: {
            entityType: 'Task',
            entityId: task._id
          },
          actionUrl: `/tasks/${task._id}`
        });
      }
    } catch (error) {
      logger.error('Task assignment notification error', { error: error.message });
    }
  }

  // Notify project invitation
  static async notifyProjectInvitation(project, invitedUser) {
    try {
      await this.create({
        recipient: invitedUser,
        sender: project.owner,
        type: 'PROJECT_INVITATION',
        content: `You have been invited to join project: ${project.name}`,
        relatedEntity: {
          entityType: 'Project',
          entityId: project._id
        },
        actionUrl: `/projects/${project._id}`
      });
    } catch (error) {
      logger.error('Project invitation notification error', { error: error.message });
    }
  }

  // Notify milestone completion
  static async notifyMilestoneReached(project, milestone) {
    try {
      await this.create({
        recipient: project.owner,
        type: 'MILESTONE_REACHED',
        content: `Milestone reached in project ${project.name}: ${milestone.name}`,
        relatedEntity: {
          entityType: 'Project',
          entityId: project._id
        },
        actionUrl: `/projects/${project._id}`
      });
    } catch (error) {
      logger.error('Milestone notification error', { error: error.message });
    }
  }

  // Bulk create notifications
  static async bulkCreate(notifications) {
    try {
      const createdNotifications = await Notification.insertMany(notifications);
      logger.info(`Bulk notifications created: ${createdNotifications.length}`);
      return createdNotifications;
    } catch (error) {
      logger.error('Bulk notification creation error', { error: error.message });
      throw error;
    }
  }
}

module.exports = NotificationService; 