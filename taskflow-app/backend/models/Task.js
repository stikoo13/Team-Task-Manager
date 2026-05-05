const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Task = sequelize.define('Task', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('todo', 'in-progress', 'done'), defaultValue: 'todo' },
  priority: { type: DataTypes.ENUM('low', 'medium', 'high'), defaultValue: 'medium' },
  dueDate: { type: DataTypes.DATE },

  // ✅ NEW: links task to a project
  ProjectId: { type: DataTypes.UUID, allowNull: true },

  assigneeId: { type: DataTypes.UUID, allowNull: true },

  // ✅ NEW: true = personal/private task, admin cannot see it
  isPersonal: { type: DataTypes.BOOLEAN, defaultValue: false }
});

module.exports = Task;