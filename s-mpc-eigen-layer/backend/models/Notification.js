const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'TASK_ASSIGNED', 
      'TASK_COMPLETED', 
      'PROJECT_INVITATION', 
      'PROJECT_UPDATE', 
      'COMMENT_ADDED', 
      'MILESTONE_REACHED',
      'SYSTEM_ALERT'
    ],
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['Task', 'Project', 'Comment', 'User']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String,
    trim: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for notification age
NotificationSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Compound index for efficient querying
NotificationSchema.index({ 
  recipient: 1, 
  isRead: 1, 
  createdAt: -1 
});

// Static method to mark notifications as read
NotificationSchema.statics.markAsRead = async function(notificationIds) {
  return this.updateMany(
    { _id: { $in: notificationIds } },
    { $set: { isRead: true } }
  );
};

// Pre-save hook for validation
NotificationSchema.pre('save', function(next) {
  // Additional validation or processing can be added here
  next();
});

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification; 