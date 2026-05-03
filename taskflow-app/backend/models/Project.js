const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Project = sequelize.define('Project', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:        { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  status: {
    type: DataTypes.ENUM('active', 'pending', 'completed', 'on_hold'),
    defaultValue: 'active'
  },
  startDate: { type: DataTypes.DATEONLY },
  endDate:   { type: DataTypes.DATEONLY },
});

module.exports = Project;