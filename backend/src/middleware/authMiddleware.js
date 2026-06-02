/**
 * Middleware для проверки JWT токена
 * @module middleware/authMiddleware
 */

const tokenService = require('../services/tokenService');
const { User, Role } = require('../models');
const logger = require('../utils/logger');

/**
 * Проверка аутентификации пользователя
 */
const authenticate = async (req, res, next) => {
  try {
    // Получаем токен из заголовка
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Требуется авторизация',
      });
    }

    const token = authHeader.split(' ')[1];

    // Валидируем токен
    const decoded = tokenService.validateAccessToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        message: 'Недействительный или просроченный токен',
      });
    }

    // Находим пользователя
    const user = await User.findByPk(decoded.id, {
      include: [{ model: Role, as: 'role' }],
    });

    if (!user) {
      return res.status(401).json({
        message: 'Пользователь не найден',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: 'Учётная запись деактивирована',
      });
    }

    if (user.isBlocked && user.blockedUntil > new Date()) {
      return res.status(403).json({
        message: 'Учётная запись заблокирована',
        blockedUntil: user.blockedUntil,
      });
    }

    // Добавляем пользователя в запрос
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;
    
    next();
  } catch (error) {
    logger.error('Ошибка аутентификации:', error);
    return res.status(500).json({
      message: 'Ошибка сервера при проверке аутентификации',
    });
  }
};

/**
 * Проверка опциональной аутентификации (не прерывает запрос при отсутствии токена)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = tokenService.validateAccessToken(token);
    
    if (decoded) {
      const user = await User.findByPk(decoded.id, {
        include: [{ model: Role, as: 'role' }],
      });

      if (user && user.isActive) {
        req.user = user;
        req.userId = user.id;
        req.userRole = user.role;
      }
    }
    
    next();
  } catch (error) {
    logger.error('Ошибка опциональной аутентификации:', error);
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth,
};
