const Task = require('../models/Task');
const Category = require('../models/Category');

exports.createTask = async (req, res, next) => {
  try {
    if (req.body.category) {
      const cat = await Category.findOne({ _id: req.body.category, user: req.user._id });
      if (!cat) {
        return res.status(400).json({ success: false, message: 'Category not found' });
      }
    }

    const task = await Task.create({ ...req.body, user: req.user._id });
    await task.populate('category', 'name color');

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const { search, status, priority, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user._id };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('category', 'name color')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Task.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    if (req.body.category) {
      const cat = await Category.findOne({ _id: req.body.category, user: req.user._id });
      if (!cat) {
        return res.status(400).json({ success: false, message: 'Category not found' });
      }
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('category', 'name color');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};
