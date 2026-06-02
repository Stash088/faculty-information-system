/**
 * Модель расписания занятий
 * @module models/Schedule
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  room: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  building: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  dayOfWeek: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 7,
    },
  },
  lessonNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 8,
    },
  },
  lessonType: {
    type: DataTypes.ENUM('lecture', 'practice', 'lab', 'consultation', 'exam'),
    allowNull: false,
    defaultValue: 'lecture',
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'schedule',
  timestamps: true,
  underscored: true,
});

/**
 * Дни недели
 */
Schedule.DAYS_OF_WEEK = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
};

/**
 * Номера пар
 */
Schedule.LESSON_NUMBERS = {
  1: '08:30',
  2: '10:15',
  3: '12:00',
  4: '13:45',
  5: '15:30',
  6: '17:15',
  7: '19:00',
  8: '20:45',
};

/**
 * Проверка валидности времени занятия
 */
Schedule.prototype.validateTimes = function() {
  return this.startTime < this.endTime;
};

module.exports = Schedule;
