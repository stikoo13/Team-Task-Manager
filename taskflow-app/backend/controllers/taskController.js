const { Task } = require('../models');

// GET /api/tasks
exports.getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    const where = {};

    if (req.user.role === 'admin') {
      if (projectId) {
        where.ProjectId = projectId;
      } else {
        // Admin dashboard: only show project tasks, NOT private member tasks
        where.isPersonal = false;
      }
    } else {
      // Members only see their own tasks
      where.assigneeId = req.user.id;
      if (projectId) {
        where.ProjectId  = projectId;
        where.isPersonal = false;
      } else {
        // Personal tab: only private tasks
        where.isPersonal = true;
      }
    }

    const tasks = await Task.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(tasks);
  } catch (err) {
    console.error('GET TASKS ERROR:', err.message);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

// POST /api/tasks  (creates a personal private task)
exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: 'Task title is required' });

    const task = await Task.create({
      title:       title.trim(),
      description: description?.trim() || '',
      priority:    priority || 'medium',
      dueDate:     dueDate  || null,
      status:      'todo',
      ProjectId:   null,        // no project = personal task
      assigneeId:  req.user.id, // always assigned to the person creating it
      isPersonal:  true,        // hidden from admin
    });

    res.status(201).json(task);
  } catch (err) {
    console.error('CREATE TASK ERROR:', err.message);
    res.status(500).json({ message: 'Failed to create task' });
  }
};

// PUT /api/tasks/:id  (update status etc)
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (req.user.role === 'member' && task.assigneeId !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

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
    if (req.user.role === 'member' && task.assigneeId !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    await task.destroy();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task' });
  }
};