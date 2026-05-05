const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Project = sequelize.define('Project', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  status: {
    type: DataTypes.ENUM('active', 'pending', 'completed', 'on_hold'),
    defaultValue: 'active'
  },
  // ✅ NEW: these were missing, that's why dates never saved
  startDate: { type: DataTypes.DATEONLY, allowNull: true },
  endDate: { type: DataTypes.DATEONLY, allowNull: true },
  createdBy: { type: DataTypes.UUID, allowNull: true }
});

module.exports = Project;