/**
 * Модель новости
 * @module models/News
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const News = sequelize.define('News', {
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
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  excerpt: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('news', 'announcement', 'event', 'notice'),
    defaultValue: 'news',
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  targetRoles: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
}, {
  tableName: 'news',
  timestamps: true,
  underscored: true,
});

/**
 * Категории новостей
 */
News.CATEGORIES = {
  NEWS: 'news',
  ANNOUNCEMENT: 'announcement',
  EVENT: 'event',
  NOTICE: 'notice',
};

/**
 * Увеличить счётчик просмотров
 */
News.prototype.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

/**
 * Опубликовать новость
 */
News.prototype.publish = async function() {
  this.isPublished = true;
  this.publishedAt = new Date();
  await this.save();
};

/**
 * Снять с публикации
 */
News.prototype.unpublish = async function() {
  this.isPublished = false;
  this.publishedAt = null;
  await this.save();
};

module.exports = News;
