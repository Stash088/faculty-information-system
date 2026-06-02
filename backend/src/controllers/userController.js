/**
 * Контроллер пользователей
 * @module controllers/userController
 */

const { validationResult } = require('express-validator');
const { User, Role, Group, Department } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Получение списка пользователей (только для администратора)
 * @route GET /api/users
 */
exports.getAll = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      search,
      isActive,
      departmentId,
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (role) {
      where.roleId = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (search) {
      where[require('sequelize').Op.or] = [
        { email: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { firstName: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { lastName: { [require('sequelize').Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      include: [
        { model: Role, as: 'role' },
        { model: Group, as: 'studentGroup', attributes: ['id', 'name'] },
        { model: Department, as: 'department', attributes: ['id', 'name', 'shortName'] },
      ],
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['lastName', 'ASC'], ['firstName', 'ASC']],
    });

    res.json({
      users,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получение пользователя по ID
 * @route GET /api/users/:id
 */
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      include: [
        { model: Role, as: 'role' },
        { model: Group, as: 'studentGroup' },
        { model: Department, as: 'department' },
      ],
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      throw ApiError.notFound('Пользователь не найден');
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

/**
 * Создание пользователя (только для администратора)
 * @route POST /api/users
 */
exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(ApiError.badRequest('Ошибка валидации', errors.array()));
    }

    const {
      email,
      password,
      firstName,
      lastName,
      patronymic,
      phone,
      roleId,
      groupId,
      departmentId,
    } = req.body;

    // Проверяем уникальность email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(ApiError.conflict('Пользователь с таким email уже существует'));
    }

    // Если roleId пустой или невалидный, используем значение по умолчанию (студент)
    const parsedRoleId = roleId && parseInt(roleId) > 0 ? parseInt(roleId) : 4;

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      patronymic,
      phone,
      roleId: parsedRoleId,
      groupId: groupId || null,
      departmentId: departmentId || null,
    });

    logger.info(`Создан новый пользователь: ${email} (ID: ${user.id})`);

    res.status(201).json({
      message: 'Пользователь создан',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        patronymic: user.patronymic,
        roleId: user.roleId,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Обновление пользователя (только для администратора)
 * @route PUT /api/users/:id
 */
exports.update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(ApiError.badRequest('Ошибка валидации', errors.array()));
    }

    const { id } = req.params;
    const updates = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return next(ApiError.notFound('Пользователь не найден'));
    }

    // Если меняем email, проверяем уникальность
    if (updates.email && updates.email !== user.email) {
      const existingUser = await User.findOne({ where: { email: updates.email } });
      if (existingUser) {
        return next(ApiError.conflict('Пользователь с таким email уже существует'));
      }
    }

    // Если передаём новый пароль, обновляем
    if (updates.password) {
      updates.password = updates.password;
    }

    await user.update(updates);

    logger.info(`Обновлён пользователь: ${user.email} (ID: ${user.id})`);

    res.json({
      message: 'Пользователь обновлён',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        patronymic: user.patronymic,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Удаление пользователя (только для администратора)
 * @route DELETE /api/users/:id
 */
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Нельзя удалить самого себя
    if (parseInt(id) === req.userId) {
      return next(ApiError.badRequest('Нельзя удалить собственную учётную запись'));
    }

    const user = await User.findByPk(id);
    if (!user) {
      return next(ApiError.notFound('Пользователь не найден'));
    }

    await user.destroy();

    logger.info(`Удалён пользователь: ${user.email} (ID: ${user.id})`);

    res.json({
      message: 'Пользователь удалён',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Блокировка/разблокировка пользователя (только для администратора)
 * @route PATCH /api/users/:id/toggle-block
 */
exports.toggleBlock = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.userId) {
      return next(ApiError.badRequest('Нельзя заблокировать собственную учётную запись'));
    }

    const user = await User.findByPk(id);
    if (!user) {
      return next(ApiError.notFound('Пользователь не найден'));
    }

    user.isBlocked = !user.isBlocked;
    if (user.isBlocked) {
      user.blockedUntil = null; // Бессрочная блокировка
    }
    await user.save();

    logger.info(`Пользователь ${user.isBlocked ? 'заблокирован' : 'разблокирован'}: ${user.email}`);

    res.json({
      message: user.isBlocked ? 'Пользователь заблокирован' : 'Пользователь разблокирован',
      isBlocked: user.isBlocked,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получение списка ролей
 * @route GET /api/users/roles
 */
exports.getRoles = async (req, res, next) => {
  try {
    const roles = await Role.findAll({
      order: [['name', 'ASC']],
    });

    res.json({ roles });
  } catch (error) {
    next(error);
  }
};

/**
 * Обновление профиля текущего пользователя
 * @route PUT /api/users/profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(ApiError.badRequest('Ошибка валидации', errors.array()));
    }

    const { firstName, lastName, patronymic, phone } = req.body;

    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return next(ApiError.notFound('Пользователь не найден'));
    }
    
    await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      patronymic: patronymic !== undefined ? patronymic : user.patronymic,
      phone: phone !== undefined ? phone : user.phone,
    });

    res.json({
      message: 'Профиль обновлён',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        patronymic: user.patronymic,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};
