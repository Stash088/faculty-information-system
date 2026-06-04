/**
 * Модель контента лендинга абитуриента
 * Хранит все редактируемые секции страницы /applicant
 * @module models/ApplicantContent
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ApplicantContent = sequelize.define('ApplicantContent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // Hero-секция
  heroBadge: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: 'Приёмная кампания 2026',
  },
  heroTitle: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: 'Поступай в Институт точных наук',
  },
  heroSubtitle: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: 'Цифровых технологий АГУ',
  },
  heroDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Контакты приёмной комиссии
  contactAddress: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  contactPhone: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  contactEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  contactHours: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  // Год приёма (для подписи)
  admissionYear: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2026,
  },
  // JSON-секции (PostgreSQL JSONB)
  stats: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [
      { value: '95%', label: 'Трудоустройство выпускников' },
      { value: '4.6', label: 'Средний балл ЕГЭ' },
      { value: '60+', label: 'Бюджетных мест' },
      { value: '15', label: 'IT-партнёров' },
    ],
  },
  programs: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  timeline: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  documents: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  dormFeatures: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  dormCost: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'от 800 ₽/мес',
  },
  dormAddress: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  dormDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  benefits: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  faq: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  lastEditedById: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'applicant_content',
  timestamps: true,
  underscored: true,
});

module.exports = ApplicantContent;
