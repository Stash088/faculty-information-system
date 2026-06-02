/**
 * Маршруты пользователей
 * @module routes/users
 */

const express = require('express');
const { body, query } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

/**
 * @route   GET /api/users/roles
 * @desc    Получение списка ролей
 * @access  Private
 */
router.get('/roles', userController.getRoles);

/**
 * @route   PUT /api/users/profile
 * @desc    Обновление профиля текущего пользователя
 * @access  Private
 */
router.put(
  '/profile',
  [
    body('firstName').optional().trim().notEmpty().withMessage('Имя не может быть пустым'),
    body('lastName').optional().trim().notEmpty().withMessage('Фамилия не может быть пустой'),
    body('phone').optional().trim(),
  ],
  userController.updateProfile
);

// Маршруты, доступные только администратору
router.use(requireAdmin);

/**
 * @route   GET /api/users
 * @desc    Получение списка пользователей
 * @access  Private/Admin
 */
router.get('/', userController.getAll);

/**
 * @route   GET /api/users/:id
 * @desc    Получение пользователя по ID
 * @access  Private/Admin
 */
router.get('/:id', userController.getById);

/**
 * @route   POST /api/users
 * @desc    Создание пользователя
 * @access  Private/Admin
 */
router.post(
  '/',
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
    body('roleId').optional({ nullable: true }).isInt().withMessage('ID роли должен быть числом'),
  ],
  userController.create
);

/**
 * @route   PUT /api/users/:id
 * @desc    Обновление пользователя
 * @access  Private/Admin
 */
router.put('/:id', userController.update);

/**
 * @route   DELETE /api/users/:id
 * @desc    Удаление пользователя
 * @access  Private/Admin
 */
router.delete('/:id', userController.delete);

/**
 * @route   PATCH /api/users/:id/toggle-block
 * @desc    Блокировка/разблокировка пользователя
 * @access  Private/Admin
 */
router.patch('/:id/toggle-block', userController.toggleBlock);

module.exports = router;
