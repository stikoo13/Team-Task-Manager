const Task = require('../models/Task');
const User = require('../models/User');

// GET /api/tasks
// - Admin: sees all tasks
// - Member: sees only tasks assigned to them
exports.getTasks = async (req, res) => {
  try {
    const where = {};
    if (req.user.role === 'member') {
      where.assigneeId = req.user.id;
    }
    const tasks = await Task.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

// POST /api/tasks
// assigneeId defaults to the creating user (member creates their own task)
// Admin can pass assigneeId explicitly to assign to someone else
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, ProjectId, assigneeId } = req.body;
    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      ProjectId: ProjectId || null,
      // Admin can assign to anyone; members always assign to themselves
      assigneeId: req.user.role === 'admin' && assigneeId ? assigneeId : req.user.id
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create task' });
  }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Members can only update their own tasks
    if (req.user.role === 'member' && task.assigneeId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await task.update(req.body);
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task' });
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Members can only delete their own tasks
    if (req.user.role === 'member' && task.assigneeId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await task.destroy();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task' });
  }
};