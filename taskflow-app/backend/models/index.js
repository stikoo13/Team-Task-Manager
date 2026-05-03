const { sequelize } = require('../config/db');
const Project = require('./Project');
const User    = require('./User');
const Task    = require('./Task');

// Project <-> Members (non-clients)
Project.belongsToMany(User, {
  through: 'ProjectMembers',
  as: 'members',
  foreignKey: 'projectId',
  otherKey: 'userId',
});
User.belongsToMany(Project, {
  through: 'ProjectMembers',
  as: 'memberProjects',
  foreignKey: 'userId',
  otherKey: 'projectId',
});

// Project <-> Clients
Project.belongsToMany(User, {
  through: 'ProjectClients',
  as: 'clients',
  foreignKey: 'projectId',
  otherKey: 'userId',
});
User.belongsToMany(Project, {
  through: 'ProjectClients',
  as: 'clientProjects',
  foreignKey: 'userId',
  otherKey: 'projectId',
});

// Project -> Tasks
Project.hasMany(Task, { foreignKey: 'projectId', as: 'Tasks' });
Task.belongsTo(Project, { foreignKey: 'projectId' });

module.exports = { sequelize, Project, User, Task };