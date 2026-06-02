/**
 * Контроллер аутентификации
 * @module controllers/authController
 */

const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, Role, PasswordResetToken } = require('../models');
const tokenService = require('../services/tokenService');
const emailService = require('../services/emailService');
const authConfig = require('../config/auth');
const logger = require('../utils/logger');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Регистрация нового пользователя
 * @route POST /api/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    // Проверяем ошибки валидации
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(ApiError.badRequest('Ошибка валидации', errors.array()));
    }

    const { email, password, firstName, lastName, patronymic } = req.body;

    // Проверяем существование пользователя
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(ApiError.conflict('Пользователь с таким email уже существует'));
    }

    // Всегда создаём как студент (защита от privilege escalation)
    const studentRole = await Role.findOne({ where: { code: 'student' } });
    const userRoleId = studentRole?.id || 4;

    // Создаём пользователя (хеширование происходит в хуке модели)
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      patronymic,
      roleId: userRoleId,
    });

    // Генерируем токены
    const tokens = tokenService.generateTokens({
      id: user.id,
      email: user.email,
      roleId: user.roleId,
    });

    // Сохраняем refresh token
    await tokenService.saveToken(user.id, tokens.refreshToken, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    logger.info(`Зарегистрирован новый пользователь: ${email}`);

    // Отправка welcome email (не критично, если SMTP не настроен)
    emailService.sendWelcome({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    }).catch((err) => logger.warn(`Не удалось отправить welcome email: ${err.message}`));

    const role = await Role.findByPk(userRoleId);

    res.status(201).json({
      message: 'Регистрация успешна',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        patronymic: user.patronymic,
        roleId: user.roleId,
        role: role,
      },
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Вход пользователя
 * @route POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(ApiError.badRequest('Ошибка валидации', errors.array()));
    }

    const { email, password } = req.body;

    // Находим пользователя
    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role' }],
    });

    if (!user) {
      // Увеличиваем счётчик попыток даже при несуществующем пользователе
      logger.warn(`Неудачная попытка входа для несуществующего email: ${email}`);
      return next(ApiError.unauthorized('Неверный email или пароль'));
    }

    // Проверяем блокировку
    if (user.isBlocked && user.blockedUntil > new Date()) {
      return next(ApiError.forbidden(`Учётная запись заблокирована до ${user.blockedUntil}`));
    }

    // Проверяем активность
    if (!user.isActive) {
      return next(ApiError.forbidden('Учётная запись деактивирована'));
    }

    // Проверяем пароль
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      // Увеличиваем счётчик попыток
      user.loginAttempts += 1;
      
      if (user.loginAttempts >= authConfig.maxLoginAttempts) {
        user.isBlocked = true;
        user.blockedUntil = new Date(Date.now() + authConfig.lockoutDuration * 60 * 1000);
        logger.warn(`Пользователь заблокирован после ${authConfig.maxLoginAttempts} неудачных попыток: ${email}`);
      }
      
      await user.save();
      return next(ApiError.unauthorized('Неверный email или пароль'));
    }

    // Сбрасываем счётчик попыток при успешном входе
    if (user.loginAttempts > 0 || user.isBlocked) {
      user.loginAttempts = 0;
      user.isBlocked = false;
      user.blockedUntil = null;
    }
    user.lastLoginAt = new Date();
    await user.save();

    // Генерируем токены
    const tokens = tokenService.generateTokens({
      id: user.id,
      email: user.email,
      roleId: user.roleId,
    });

    // Сохраняем refresh token
    await tokenService.saveToken(user.id, tokens.refreshToken, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    logger.info(`Успешный вход пользователя: ${email}`);

    res.json({
      message: 'Вход выполнен успешно',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        patronymic: user.patronymic,
        roleId: user.roleId,
        role: user.role,
        avatar: user.avatar,
      },
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Выход пользователя
 * @route POST /api/auth/logout
 */
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await tokenService.revokeToken(refreshToken);
    }

    logger.info(`Выход пользователя: ${req.user?.email}`);

    res.json({
      message: 'Выход выполнен успешно',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Обновление токенов
 * @route POST /api/auth/refresh
 */
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw ApiError.badRequest('Требуется refresh токен');
    }

    // Валидируем refresh token
    const decoded = tokenService.validateRefreshToken(refreshToken);
    if (!decoded) {
      throw ApiError.unauthorized('Недействительный или просроченный refresh токен');
    }

    // Проверяем токен в базе
    const storedToken = await tokenService.findToken(refreshToken);
    if (!storedToken || !storedToken.isValid()) {
      throw ApiError.unauthorized('Refresh токен недействителен');
    }

    // Находим пользователя
    const user = await User.findByPk(decoded.id, {
      include: [{ model: Role, as: 'role' }],
    });

    if (!user || !user.isActive) {
      throw ApiError.unauthorized('Пользователь не найден или деактивирован');
    }

    // Генерируем новые токены
    const tokens = tokenService.generateTokens({
      id: user.id,
      email: user.email,
      roleId: user.roleId,
    });

    // Отмечаем старый токен как использованный
    await tokenService.markTokenAsUsed(refreshToken);

    // Сохраняем новый refresh token
    await tokenService.saveToken(user.id, tokens.refreshToken, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    res.json({
      message: 'Токены обновлены',
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получение текущего пользователя
 * @route GET /api/auth/me
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] },
      include: [
        { model: Role, as: 'role' },
      ],
    });

    if (!user) {
      return next(ApiError.notFound('Пользователь не найден'));
    }

    res.json({
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Изменение пароля
 * @route POST /api/auth/change-password
 */
exports.changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(ApiError.badRequest('Ошибка валидации', errors.array()));
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return next(ApiError.notFound('Пользователь не найден'));
    }

    // Проверяем текущий пароль
    const isPasswordValid = await user.validatePassword(currentPassword);
    if (!isPasswordValid) {
      return next(ApiError.unauthorized('Неверный текущий пароль'));
    }

    // Проверяем, что новый пароль отличается
    const isSamePassword = await user.validatePassword(newPassword);
    if (isSamePassword) {
      return next(ApiError.badRequest('Новый пароль должен отличаться от текущего'));
    }

    // Меняем пароль (хеширование происходит в хуке)
    user.password = newPassword;
    await user.save();

    // Отзываем все refresh токены
    await tokenService.revokeAllUserTokens(user.id);

    logger.info(`Пользователь сменил пароль: ${user.email}`);

    res.json({
      message: 'Пароль успешно изменён. Необходимо войти снова.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Запрос на восстановление пароля
 * @route POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(ApiError.badRequest('Ошибка валидации', errors.array()));
    }

    const { email } = req.body;

    // Всегда возвращаем одинаковый ответ (не раскрываем существование email)
    const successResponse = {
      message: 'Если email зарегистрирован, на него отправлена инструкция по восстановлению пароля.',
    };

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json(successResponse);
    }

    // Генерируем токен
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 час

    await PasswordResetToken.create({
      token,
      userId: user.id,
      expiresAt,
    });

    // Отправляем email (не критично если SMTP не настроен)
    const clientUrl = process.env.CLIENT_URL === '*'
      ? 'http://localhost:3000'
      : (process.env.CLIENT_URL || 'http://localhost:3000').split(',')[0].trim();
    const resetUrl = `${clientUrl}/reset-password?token=${token}`;

    emailService.sendPasswordReset({
      email: user.email,
      firstName: user.firstName,
      resetUrl,
    }).catch((err) => logger.warn(`Не удалось отправить email восстановления: ${err.message}`));

    logger.info(`Запрошено восстановление пароля для: ${email}`);
    res.json(successResponse);
  } catch (error) {
    next(error);
  }
};

/**
 * Сброс пароля по токену
 * @route POST /api/auth/reset-password
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(ApiError.badRequest('Ошибка валидации', errors.array()));
    }

    const { token, newPassword } = req.body;

    const resetToken = await PasswordResetToken.findOne({
      where: { token },
    });

    if (!resetToken || !resetToken.isValid()) {
      return next(ApiError.badRequest('Недействительный или просроченный токен'));
    }

    const user = await User.findByPk(resetToken.userId);
    if (!user || !user.isActive) {
      return next(ApiError.badRequest('Пользователь не найден или деактивирован'));
    }

    // Меняем пароль
    user.password = newPassword;
    await user.save();

    // Помечаем токен использованным
    resetToken.isUsed = true;
    await resetToken.save();

    // Отзываем все refresh токены
    await tokenService.revokeAllUserTokens(user.id);

    logger.info(`Пароль сброшен через email для: ${user.email}`);

    res.json({
      message: 'Пароль успешно изменён. Теперь вы можете войти с новым паролем.',
    });
  } catch (error) {
    next(error);
  }
};
