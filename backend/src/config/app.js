/**
 * Основная конфигурация приложения
 * @module config/app
 */

require('dotenv').config();

module.exports = {
  /**
   * Режим работы приложения
   */
  env: process.env.NODE_ENV || 'development',
  
  /**
   * Порт сервера
   */
  port: parseInt(process.env.PORT, 10) || 5000,
  
  /**
   * URL клиентского приложения для CORS
   */
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  
  /**
   * Максимальный размер загружаемого файла (в байтах)
   */
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760,
  
  /**
   * Путь для хранения загруженных файлов
   */
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  
  /**
   * Разрешённые MIME-типы для загрузки
   */
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav',
    'application/zip',
    'application/x-rar-compressed',
  ],
  
  /**
   * Настройки логирования
   */
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },
};
