const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const { Project, User, Task } = require('../models');

const INCLUDE_ALL = [
  { model: User, as: 'members', attributes: ['id','name','email','role'], through: { attributes: [] } },
  { model: User, as: 'clients', attributes: ['id','name','email','role'], through: { attributes: [] } },
  { model: Task, as: 'Tasks',   attributes: ['id','status'] },
];

// GET all projects
router.get('/', protect, async (req, res) => {
  try {
    const all = await Project.findAll({ include: INCLUDE_ALL, order: [['createdAt','DESC']] });

    let projects = all;
    if (req.user.role === 'client') {
      projects = all.filter(p => p.clients.some(c => c.id === req.user.id));
    } else if (req.user.role !== 'admin') {
      projects = all.filter(p => p.members.some(m => m.id === req.user.id));
    }

    res.json(projects);
  } catch (err) {
    console.error('GET PROJECTS ERROR:', err.message);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// POST create project (admin only)
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });

    const { name, description, status, startDate, endDate, memberIds = [], clientIds = [], tasks = [] } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Project name is required' });

    // 1. Create the project
    const project = await Project.create({
      name: name.trim(),
      description: description?.trim() || '',
      status:    status    || 'active',
      startDate: startDate || null,
      endDate:   endDate   || null,
      createdBy: req.user.id,
    });

    // 2. Assign members (admin always included)
    const memberSet = [...new Set([req.user.id, ...memberIds])];
    const members   = await User.findAll({ where: { id: memberSet } });
    await project.setMembers(members);

    // 3. Assign clients
    if (clientIds.length > 0) {
      const clients = await User.findAll({ where: { id: clientIds } });
      await project.setClients(clients);
    }

    // 4. Create AI-generated tasks and assign them to members
    if (tasks.length > 0) {
      const taskRecords = tasks.map((item, index) => {
        const title = typeof item === 'string' ? item : (item.text || item.title || '');
        if (!title.trim()) return null;

        // Distribute tasks round-robin among selected members
        const assigneeId = memberIds.length > 0
          ? memberIds[index % memberIds.length]
          : null;

        return {
          title:      title.trim(),
          status:     'todo',
          priority:   'medium',
          ProjectId:  project.id,
          assigneeId,
          isPersonal: false, // project task, visible to admin
        };
      }).filter(Boolean);

      if (taskRecords.length > 0) await Task.bulkCreate(taskRecords);
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
    await project.update({ name, description, status, startDate: startDate||null, endDate: endDate||null });

    const memberSet = [...new Set([req.user.id, ...memberIds])];
    await project.setMembers(await User.findAll({ where: { id: memberSet } }));
    await project.setClients(await User.findAll({ where: { id: clientIds } }));

    res.json(await Project.findByPk(project.id, { include: INCLUDE_ALL }));
  } catch (err) {
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