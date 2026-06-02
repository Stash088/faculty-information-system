/**
 * Модель пользователя
 * @module models/User
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true,
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [8, 255],
    },
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  patronymic: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isBlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  blockedUntil: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  loginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
  },
});

/**
 * Проверка пароля
 * @param {string} password - Пароль для проверки
 * @returns {Promise<boolean>}
 */
User.prototype.validatePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

/**
 * Получение полного имени пользователя
 * @returns {string}
 */
User.prototype.getFullName = function() {
  const parts = [this.lastName, this.firstName];
  if (this.patronymic) {
    parts.push(this.patronymic);
  }
  return parts.join(' ');
};

/**
 * Получение данных пользователя без пароля
 * @returns {Object}
 */
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;
