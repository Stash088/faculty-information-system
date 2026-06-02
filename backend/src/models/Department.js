/**
 * Модель кафедры/подразделения
 * @module models/Department
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  shortName: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  code: {
    type: DataTypes.STRING(30),
    allowNull: true,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  headId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'departments',
  timestamps: true,
  underscored: true,
});

module.exports = Department;
