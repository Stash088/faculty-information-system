/**
 * Маршруты аутентификации
 * @module routes/auth
 */

const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Регистрация нового пользователя
 * @access  Public
 */
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Некорректный email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Пароль должен содержать минимум 8 символов')
      .matches(/\d/)
      .withMessage('Пароль должен содержать хотя бы одну цифру')
      .matches(/[a-zA-Z]/)
      .withMessage('Пароль должен содержать хотя бы одну букву'),
    body('firstName').trim().notEmpty().withMessage('Имя обязательно'),
    body('lastName').trim().notEmpty().withMessage('Фамилия обязательна'),
  ],
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Вход пользователя
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Некорректный email'),
    body('password').notEmpty().withMessage('Пароль обязателен'),
  ],
  authController.login
);

/**
 * @route   POST /api/auth/logout
 * @desc    Выход пользователя
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   POST /api/auth/refresh
 * @desc    Обновление токенов
 * @access  Public
 */
router.post('/refresh', authController.refresh);

/**
 * @route   GET /api/auth/me
 * @desc    Получение текущего пользователя
 * @access  Private
 */
router.get('/me', authenticate, authController.getMe);

/**
 * @route   POST /api/auth/change-password
 * @desc    Изменение пароля
 * @access  Private
 */
router.post(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Текущий пароль обязателен'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Новый пароль должен содержать минимум 8 символов')
      .matches(/\d/)
      .withMessage('Пароль должен содержать хотя бы одну цифру')
      .matches(/[a-zA-Z]/)
      .withMessage('Пароль должен содержать хотя бы одну букву'),
  ],
  authController.changePassword
);

module.exports = router;
