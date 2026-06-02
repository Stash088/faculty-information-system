/**
 * Конфигурация подключения к базе данных
 * @module config/database
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

/**
 * Проверка подключения к базе данных
 * @returns {Promise<void>}
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Подключение к базе данных установлено');
  } catch (error) {
    console.error('✗ Ошибка подключения к базе данных:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };
