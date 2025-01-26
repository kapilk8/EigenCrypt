const Task = require('../models/Task');
const { claimTaskReward } = require('../services/eigenLayerService');

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('createdBy', 'address')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const task = await Task.findByIdAndUpdate(
      taskId, 
      { status }, 
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.claimReward = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify task is completed and not already claimed
    if (task.status !== 'completed') {
      return res.status(400).json({ message: 'Task is not completed' });
    }

    // Call EigenLayer service to claim reward
    const rewardClaimed = await claimTaskReward(task);

    if (rewardClaimed) {
      task.status = 'claimed';
      await task.save();
      res.json({ message: 'Reward claimed successfully' });
    } else {
      res.status(400).json({ message: 'Failed to claim reward' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 