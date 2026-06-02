/**
 * Модель учебного материала
 * @module models/Material
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Material = sequelize.define('Material', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  filePath: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  fileName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  mimeType: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('lecture', 'practice', 'lab', 'methodical', 'additional'),
    allowNull: false,
    defaultValue: 'methodical',
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  downloads: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'materials',
  timestamps: true,
  underscored: true,
});

/**
 * Типы материалов
 */
Material.TYPES = {
  LECTURE: 'lecture',
  PRACTICE: 'practice',
  LAB: 'lab',
  METHODICAL: 'methodical',
  ADDITIONAL: 'additional',
};

/**
 * Увеличить счётчик просмотров
 */
Material.prototype.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

/**
 * Увеличить счётчик скачиваний
 */
Material.prototype.incrementDownloads = async function() {
  this.downloads += 1;
  await this.save();
};

module.exports = Material;
