const User    = require('./User');
const Project = require('./Project');
const Task    = require('./Task');

// Project has many Members (users)
Project.belongsToMany(User, { through: 'ProjectMembers', as: 'members', foreignKey: 'ProjectId' });
User.belongsToMany(Project, { through: 'ProjectMembers', as: 'memberProjects', foreignKey: 'UserId' });

// Project has many Clients (users)
Project.belongsToMany(User, { through: 'ProjectClients', as: 'clients', foreignKey: 'ProjectId' });
User.belongsToMany(Project, { through: 'ProjectClients', as: 'clientProjects', foreignKey: 'UserId' });

// Project has many Tasks
Project.hasMany(Task, { foreignKey: 'ProjectId', as: 'Tasks' });
Task.belongsTo(Project, { foreignKey: 'ProjectId' });

// User has many Tasks assigned to them
User.hasMany(Task,   { foreignKey: 'assigneeId', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });

module.exports = { User, Project, Task };