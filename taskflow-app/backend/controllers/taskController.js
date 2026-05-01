const Task = require('../models/Task');
const User = require('../models/User');
const Project = require('../models/Project');

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({ include: [{ model: User, as: 'assignee', attributes: ['id', 'name'] }, { model: Project, as: 'project', attributes: ['id', 'name'] }] });
    res.json(tasks);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, ProjectId, assigneeId } = req.body;
    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null,
      ProjectId: ProjectId || null,
      assigneeId: assigneeId || null
    });
    res.status(201).json(task);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const { title, description, status, priority, dueDate, ProjectId, assigneeId } = req.body;
    await task.update({
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null,
      ProjectId: ProjectId || null,
      assigneeId: assigneeId || null
    });
    res.json(task);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await task.destroy();
    res.json({ message: 'Task deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
