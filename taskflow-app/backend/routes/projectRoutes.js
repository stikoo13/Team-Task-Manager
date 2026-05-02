const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Project = require('../models/Project');
const User = require('../models/User');

// GET projects
// Admin: all projects with members
// Member: only projects they are assigned to
router.get('/', protect, async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      projects = await Project.findAll({
        include: [{ model: User, as: 'members', attributes: ['id', 'name', 'email', 'role'], through: { attributes: [] } }],
        order: [['createdAt', 'DESC']]
      });
    } else {
      projects = await Project.findAll({
        include: [{ model: User, as: 'members', attributes: ['id', 'name', 'email', 'role'], through: { attributes: [] } }],
        order: [['createdAt', 'DESC']]
      });
      // Filter: only projects where this user is a member
      projects = projects.filter(p => p.members.some(m => m.id === req.user.id));
    }
    res.json(projects);
  } catch (err) {
    console.error('GET PROJECTS ERROR:', err.message);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// POST create project + assign members
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
    const { name, description, memberIds } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const project = await Project.create({ name, description });
    // Always add the admin as a member too
    const ids = [...new Set([req.user.id, ...(memberIds || [])])];
    const users = await User.findAll({ where: { id: ids } });
    await project.setMembers(users);
    const full = await Project.findByPk(project.id, {
      include: [{ model: User, as: 'members', attributes: ['id', 'name', 'email', 'role'], through: { attributes: [] } }]
    });
    res.status(201).json(full);
  } catch (err) {
    console.error('CREATE PROJECT ERROR:', err.message);
    res.status(500).json({ message: 'Failed to create project' });
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