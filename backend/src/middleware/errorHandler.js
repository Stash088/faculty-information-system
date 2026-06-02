/**
 * Middleware для централизованной обработки ошибок
 * @module middleware/errorHandler
 */

const logger = require('../utils/logger');

/**
 * Класс ошибки API
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';
  }

  static badRequest(message, details = null) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'Не авторизован') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Доступ запрещён') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Ресурс не найден') {
    return new ApiError(404, message);
  }

  static conflict(message) {
    return new ApiError(409, message);
  }

  static internal(message = 'Внутренняя ошибка сервера') {
    return new ApiError(500, message);
  }
}

/**
 * Middleware для обработки ошибок
 */
const errorHandler = (err, req, res, next) => {
  // Логируем ошибку
  logger.error('Ошибка запроса:', {
    method: req.method,
    path: req.path,
    error: err.message,
    stack: err.stack,
    body: req.body,
  });

  // Если это ошибка Sequelize (ошибка валидации)
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      message: 'Ошибка валидации данных',
      errors,
    });
  }

  // Если это ошибка уникальности
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    return res.status(409).json({
      message: `Значение поля "${field}" уже существует`,
    });
  }

  // Если это наша кастомная ошибка
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
      details: err.details,
    });
  }

  // Ошибка валидации express-validator
  if (err.array && typeof err.array === 'function') {
    return res.status(400).json({
      message: 'Ошибка валидации',
      errors: err.array(),
    });
  }

  // Ошибка Multer (загрузка файлов)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      message: 'Превышен максимальный размер файла',
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      message: 'Недопустимое поле для загрузки файла',
    });
  }

  // По умолчанию - внутренняя ошибка сервера
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Внутренняя ошибка сервера'
    : err.message;

  res.status(statusCode).json({
    message,
  });
};

/**
 * Middleware для обработки 404
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    message: `Маршрут ${req.method} ${req.path} не найден`,
  });
};

module.exports = {
  ApiError,
  errorHandler,
  notFoundHandler,
};
