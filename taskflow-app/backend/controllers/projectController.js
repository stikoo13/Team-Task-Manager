const { Project, User, Task } = require('../models');

exports.getProjects = async (req, res) => {
  try {
    const user = req.user; // from auth middleware
    let projects;

    if (user.role === 'admin') {
      projects = await Project.findAll({
        include: [
          { model: User, as: 'members', attributes: ['id', 'name', 'email', 'role'] },
          { model: User, as: 'clients', attributes: ['id', 'name', 'email', 'role'] },
          { model: Task, as: 'Tasks',   attributes: ['id', 'status'] },
        ],
      });
    } else if (user.role === 'client') {
      projects = await Project.findAll({
        include: [
          { model: User, as: 'members', attributes: ['id', 'name', 'email', 'role'] },
          { model: User, as: 'clients', attributes: ['id', 'name', 'email', 'role'], where: { id: user.id } },
          { model: Task, as: 'Tasks',   attributes: ['id', 'status'] },
        ],
      });
    } else {
      projects = await Project.findAll({
        include: [
          { model: User, as: 'members', attributes: ['id', 'name', 'email', 'role'], where: { id: user.id } },
          { model: User, as: 'clients', attributes: ['id', 'name', 'email', 'role'] },
          { model: Task, as: 'Tasks',   attributes: ['id', 'status'] },
        ],
      });
    }

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { name, description, status, startDate, endDate, memberIds = [], clientIds = [] } = req.body;

    const project = await Project.create({ name, description, status, startDate: startDate || null, endDate: endDate || null });

    if (memberIds.length > 0) {
      const members = await User.findAll({ where: { id: memberIds } });
      await project.setMembers(members);
    }
    if (clientIds.length > 0) {
      const clients = await User.findAll({ where: { id: clientIds } });
      await project.setClients(clients);
    }

    const full = await Project.findByPk(project.id, {
      include: [
        { model: User, as: 'members', attributes: ['id', 'name', 'email', 'role'] },
        { model: User, as: 'clients', attributes: ['id', 'name', 'email', 'role'] },
        { model: Task, as: 'Tasks',   attributes: ['id', 'status'] },
      ],
    });

    res.status(201).json(full);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const { name, description, status, startDate, endDate, memberIds = [], clientIds = [] } = req.body;

    await project.update({
      name,
      description,
      status,
      startDate: startDate || null,
      endDate:   endDate   || null,
    });

    // Update members association
    const members = await User.findAll({ where: { id: memberIds } });
    await project.setMembers(members);

    // Update clients association
    const clients = await User.findAll({ where: { id: clientIds } });
    await project.setClients(clients);

    const full = await Project.findByPk(project.id, {
      include: [
        { model: User, as: 'members', attributes: ['id', 'name', 'email', 'role'] },
        { model: User, as: 'clients', attributes: ['id', 'name', 'email', 'role'] },
        { model: Task, as: 'Tasks',   attributes: ['id', 'status'] },
      ],
    });

    res.json(full);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    await project.destroy();
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};