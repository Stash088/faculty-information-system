/**
 * Модель учебной группы
 * @module models/Group
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Group = sequelize.define('Group', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  course: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 6,
    },
  },
  semester: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12,
    },
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  studentCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  curatorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'groups',
  timestamps: true,
  underscored: true,
});

module.exports = Group;
