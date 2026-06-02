/**
 * Модель Refresh Token
 * @module models/RefreshToken
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RefreshToken = sequelize.define('RefreshToken', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  token: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isRevoked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  userAgent: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  ipAddress: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
}, {
  tableName: 'refresh_tokens',
  timestamps: true,
  underscored: true,
});

/**
 * Проверка актуальности токена
 * @returns {boolean}
 */
RefreshToken.prototype.isValid = function() {
  return !this.isRevoked && !this.isUsed && new Date() < this.expiresAt;
};

module.exports = RefreshToken;
