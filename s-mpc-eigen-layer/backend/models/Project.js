const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'],
    default: 'PLANNING'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['ADMIN', 'MANAGER', 'CONTRIBUTOR', 'VIEWER'],
      default: 'CONTRIBUTOR'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  budget: {
    type: Number,
    min: 0
  },
  technologies: [{
    type: String,
    trim: true
  }],
  milestones: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    dueDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'OVERDUE'],
      default: 'PENDING'
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  visibility: {
    type: String,
    enum: ['PRIVATE', 'INTERNAL', 'PUBLIC'],
    default: 'PRIVATE'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for project duration
ProjectSchema.virtual('duration').get(function() {
  if (!this.startDate) return 0;
  const end = this.endDate || new Date();
  return Math.floor((end - this.startDate) / (1000 * 60 * 60 * 24));
});

// Virtual for project progress
ProjectSchema.virtual('progress').get(function() {
  if (!this.tasks.length) return 0;
  const completedTasks = this.tasks.filter(task => task.status === 'DONE').length;
  return Math.round((completedTasks / this.tasks.length) * 100);
});

// Compound index for efficient querying
ProjectSchema.index({ 
  status: 1, 
  owner: 1, 
  startDate: -1 
});

// Pre-save hook for milestone status
ProjectSchema.pre('save', function(next) {
  this.milestones.forEach(milestone => {
    if (milestone.dueDate && milestone.dueDate < Date.now()) {
      milestone.status = 'OVERDUE';
    }
  });
  next();
});

// Static method to find projects by owner
ProjectSchema.statics.findByOwner = function(ownerId) {
  return this.find({ owner: ownerId });
};

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project; 