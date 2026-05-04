const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const Project = require('../models/Project');
const User    = require('../models/User');
const Task    = require('../models/Task');

const INCLUDE_ALL = [
  { model: User, as: 'members', attributes: ['id','name','email','role'], through: { attributes: [] } },
  { model: User, as: 'clients', attributes: ['id','name','email','role'], through: { attributes: [] } },
  { model: Task, as: 'Tasks',   attributes: ['id','status'] },
];

// GET all projects
router.get('/', protect, async (req, res) => {
  try {
    let projects = await Project.findAll({
      include: INCLUDE_ALL,
      order: [['createdAt', 'DESC']]
    });

    if (req.user.role === 'client') {
      projects = projects.filter(p => p.clients.some(c => c.id === req.user.id));
    } else if (req.user.role !== 'admin') {
      projects = projects.filter(p => p.members.some(m => m.id === req.user.id));
    }

    res.json(projects);
  } catch (err) {
    console.error('GET PROJECTS ERROR:', err.message);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// POST create project
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });

    const {
      name, description, status,
      startDate, endDate,
      memberIds = [], clientIds = [],
      tasks = []   // AI-generated task titles from frontend
    } = req.body;

    if (!name) return res.status(400).json({ message: 'Name is required' });

    // Create the project
    const project = await Project.create({
      name, description, status,
      startDate: startDate || null,
      endDate:   endDate   || null,
    });

    // Set members (always include admin)
    const memberSet = [...new Set([req.user.id, ...memberIds])];
    const members   = await User.findAll({ where: { id: memberSet } });
    await project.setMembers(members);

    // Set clients
    if (clientIds.length > 0) {
      const clients = await User.findAll({ where: { id: clientIds } });
      await project.setClients(clients);
    }

    // ✅ FIX: Properly bulk-create tasks with correct variable references
    // Each task gets assigned to the first selected member (or null if none)
    // memberIds[0] is the primary assignee; tasks cycle through members if multiple
    if (tasks.length > 0) {
      const taskRecords = tasks.map((taskItem, index) => {
        // taskItem can be a string (title) or object {text, assigneeId}
        const title      = typeof taskItem === 'string' ? taskItem : (taskItem.text || taskItem.title || '');
        // Distribute tasks among selected members round-robin, fallback to null
        const assigneeId = memberIds.length > 0
          ? memberIds[index % memberIds.length]
          : null;

        return {
          title,
          status:    'todo',
          priority:  'medium',
          ProjectId: project.id,
          assigneeId,
        };
      });

      // Filter out any empty titles
      const validTasks = taskRecords.filter(tr => tr.title.trim() !== '');
      if (validTasks.length > 0) {
        await Task.bulkCreate(validTasks);
      }
    }

    const full = await Project.findByPk(project.id, { include: INCLUDE_ALL });
    res.status(201).json(full);
  } catch (err) {
    console.error('CREATE PROJECT ERROR:', err.message);
    res.status(500).json({ message: 'Failed to create project' });
  }
});

// PUT update project
router.put('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });

    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const { name, description, status, startDate, endDate, memberIds = [], clientIds = [] } = req.body;

    await project.update({
      name, description, status,
      startDate: startDate || null,
      endDate:   endDate   || null,
    });

    const memberSet = [...new Set([req.user.id, ...memberIds])];
    const members   = await User.findAll({ where: { id: memberSet } });
    await project.setMembers(members);

    const clients = await User.findAll({ where: { id: clientIds } });
    await project.setClients(clients);

    const full = await Project.findByPk(project.id, { include: INCLUDE_ALL });
    res.json(full);
  } catch (err) {
    console.error('UPDATE PROJECT ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// DELETE project
router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });

    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await project.destroy();
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete project' });
  }
});

module.exports = router;