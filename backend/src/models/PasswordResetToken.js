/**
 * Модель токенов восстановления пароля
 * @module models/PasswordResetToken
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PasswordResetToken = sequelize.define('PasswordResetToken', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  token: {
    type: DataTypes.STRING(255),
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
}, {
  tableName: 'password_reset_tokens',
  timestamps: true,
  underscored: true,
});

PasswordResetToken.prototype.isValid = function () {
  return !this.isUsed && this.expiresAt > new Date();
};

module.exports = PasswordResetToken;