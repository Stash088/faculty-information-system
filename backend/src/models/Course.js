/**
 * Модель учебной дисциплины
 * @module models/Course
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Course = sequelize.define('Course', {
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
  code: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  semester: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 12,
    },
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  credits: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  programId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'courses',
  timestamps: true,
  underscored: true,
});

/**
 * Типы занятий
 */
Course.LESSON_TYPES = {
  LECTURE: 'lecture',
  PRACTICE: 'practice',
  LAB: 'lab',
  CONSULTATION: 'consultation',
  EXAM: 'exam',
};

/**
 * Типы контроля
 */
Course.CONTROL_TYPES = {
  EXAM: 'exam',
  CREDIT: 'credit',
  DIFFERENTIATED_CREDIT: 'differentiated_credit',
  COURSEWORK: 'coursework',
};

module.exports = Course;
