/**
 * Модель роли пользователя
 * @module models/Role
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
    },
  },
  code: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      is: /^[a-z_]+$/i,
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'roles',
  timestamps: true,
  underscored: true,
});

/**
 * Роли по умолчанию
 */
Role.ROLE_NAMES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  METHODIST: 'methodist',
  STUDENT: 'student',
  APPLICANT: 'applicant',
};

module.exports = Role;
