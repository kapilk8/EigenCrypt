const Task = require('../models/Task');
const User = require('../models/User');

exports.createTask = async (req, res) => {
  try {
    const { description, parameters, reward } = req.body;
    const newTask = new Task({
      description,
      parameters,
      reward,
      createdBy: req.user._id
    });

    const savedTask = await newTask.save();
    
    // Add task to user's tasks
    await User.findByIdAndUpdate(req.user._id, {
      $push: { tasks: savedTask._id }
    });

    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getUserTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 