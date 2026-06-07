/**
 * Контроллер категорий материалов
 * @module controllers/categoryController
 */

const { Category, Material } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

exports.getCategories = async (req, res, next) => {
  try {
    const { activeOnly } = req.query;
    const where = {};
    if (activeOnly === 'true') where.isActive = true;

    const categories = await Category.findAll({
      where,
      order: [['order', 'ASC'], ['name', 'ASC']],
    });

    // Считаем сколько материалов в каждой категории
    const counts = await Material.findAll({
      attributes: ['categoryId', [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']],
      where: { categoryId: { [require('sequelize').Op.not]: null } },
      group: ['categoryId'],
      raw: true,
    });
    const countMap = {};
    counts.forEach((c) => { countMap[c.categoryId] = parseInt(c.count, 10); });

    const result = categories.map((c) => ({
      ...c.toJSON(),
      materialsCount: countMap[c.id] || 0,
    }));

    res.json({ data: result });
  } catch (error) {
    logger.error('Ошибка при получении категорий:', error);
    next(error);
  }
};

exports.getCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (!category) {
      return next(ApiError.notFound('Категория не найдена'));
    }
    res.json(category);
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, code, description, color, icon, order } = req.body;
    if (!name || !code) {
      return next(ApiError.badRequest('Название и код обязательны'));
    }
    const category = await Category.create({
      name,
      code,
      description: description || null,
      color: color || '#1976d2',
      icon: icon || 'Folder',
      order: order ? parseInt(order, 10) : 0,
      isActive: true,
    });
    logger.info(`Создана категория: ${name} (${code}) пользователем #${req.userId}`);
    res.status(201).json(category);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return next(ApiError.conflict('Категория с таким кодом уже существует'));
    }
    if (error.name === 'SequelizeValidationError') {
      return next(ApiError.badRequest(error.message));
    }
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (!category) {
      return next(ApiError.notFound('Категория не найдена'));
    }
    const { name, code, description, color, icon, order, isActive } = req.body;
    await category.update({
      ...(name !== undefined && { name }),
      ...(code !== undefined && { code }),
      ...(description !== undefined && { description }),
      ...(color !== undefined && { color }),
      ...(icon !== undefined && { icon }),
      ...(order !== undefined && { order: parseInt(order, 10) }),
      ...(isActive !== undefined && { isActive: isActive === 'true' || isActive === true }),
    });
    res.json(category);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return next(ApiError.conflict('Категория с таким кодом уже существует'));
    }
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (!category) {
      return next(ApiError.notFound('Категория не найдена'));
    }
    const materialsCount = await Material.count({ where: { categoryId: id } });
    if (materialsCount > 0) {
      return next(ApiError.badRequest(
        `Невозможно удалить: категория используется (${materialsCount} материалов). Сначала переназначьте материалы на другую категорию.`,
      ));
    }
    await category.destroy();
    res.json({ message: 'Категория удалена' });
  } catch (error) {
    next(error);
  }
};
