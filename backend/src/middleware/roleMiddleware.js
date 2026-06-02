/**
 * Middleware для проверки прав доступа на основе ролей
 * @module middleware/roleMiddleware
 */

const { Role } = require('../models');

/**
 * Проверка наличия определённых ролей у пользователя
 * @param  {...string} allowedRoles - Коды разрешённых ролей
 * @returns {Function} - Middleware функция
 */
const requireRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: 'Требуется авторизация',
        });
      }

      const userRoleCode = req.user.role?.code;

      if (!userRoleCode || !allowedRoles.includes(userRoleCode)) {
        return res.status(403).json({
          message: 'Доступ запрещён. Недостаточно прав.',
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: 'Ошибка проверки прав доступа',
      });
    }
  };
};

/**
 * Проверка на роль администратора
 */
const requireAdmin = requireRoles('admin');

/**
 * Проверка на роль преподавателя или администратора
 */
const requireTeacher = requireRoles('admin', 'teacher');

/**
 * Проверка на роль методиста или администратора
 */
const requireMethodist = requireRoles('admin', 'methodist');

/**
 * Проверка на роль студента, преподавателя или администратора
 */
const requireStudent = requireRoles('admin', 'teacher', 'student');

/**
 * Проверка на доступ к редактированию материалов
 * (преподаватель может редактировать только свои материалы)
 */
const requireMaterialOwnerOrAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: 'Требуется авторизация',
      });
    }

    const userRoleCode = req.user.role?.code;

    // Администратор и методист имеют доступ ко всем материалам
    if (['admin', 'methodist'].includes(userRoleCode)) {
      return next();
    }

    // Преподаватель проверяется в контроллере по ID автора материала
    if (userRoleCode === 'teacher') {
      // Разрешаем доступ, проверка ownership будет в контроллере
      req.checkOwnership = true;
      return next();
    }

    return res.status(403).json({
      message: 'Доступ запрещён',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Ошибка проверки прав доступа',
    });
  }
};

module.exports = {
  requireRoles,
  requireAdmin,
  requireTeacher,
  requireMethodist,
  requireStudent,
  requireMaterialOwnerOrAdmin,
};
