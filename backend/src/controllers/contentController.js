/**
 * Контроллер контента (новости, курсы, материалы)
 */
const { News, Course, Material, Schedule, User, Department, Group } = require('../models');
const { Op } = require('sequelize');
const { ApiError } = require('../middleware/errorHandler');

// ============ NEWS ============

exports.getNews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, published } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (category) where.category = category;
    if (published !== undefined) where.isPublished = published === 'true';

    const { count, rows } = await News.findAndCountAll({
      where,
      include: [{ model: User, as: 'author', attributes: ['id', 'firstName', 'lastName'] }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      data: rows,
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

exports.createNews = async (req, res, next) => {
  try {
    const { title, content = '', excerpt, category, image, isPublished, isPinned, targetRoles } = req.body;
    
    if (!title) {
      throw new Error('Заголовок обязателен');
    }
    
    const news = await News.create({
      title,
      content: content || title, // используем title как content если content пустой
      excerpt: excerpt || title,
      category: category || 'news',
      image,
      isPublished: isPublished || false,
      isPinned: isPinned || false,
      targetRoles: targetRoles || [],
      authorId: req.userId,
      publishedAt: isPublished ? new Date() : null,
    });

    res.status(201).json(news);
  } catch (error) {
    next(error);
  }
};

exports.updateNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, category, image, isPublished, isPinned, targetRoles } = req.body;

    const news = await News.findByPk(id);
    if (!news) {
      return next(ApiError.notFound('Новость не найдена'));
    }

    await news.update({
      title,
      content,
      excerpt,
      category,
      image,
      isPublished,
      isPinned,
      targetRoles,
      publishedAt: isPublished && !news.publishedAt ? new Date() : news.publishedAt,
    });

    res.json(news);
  } catch (error) {
    next(error);
  }
};

exports.deleteNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const news = await News.findByPk(id);
    if (!news) {
      return next(ApiError.notFound('Новость не найдена'));
    }
    await news.destroy();
    res.json({ message: 'Новость удалена' });
  } catch (error) {
    next(error);
  }
};

// ============ COURSES ============

exports.getCourses = async (req, res, next) => {
  try {
    const courses = await Course.findAll({
      include: [
        { model: User, as: 'courseTeacher', attributes: ['id', 'firstName', 'lastName'] },
        { model: Department, as: 'department', attributes: ['id', 'name'] },
      ],
      order: [['name', 'ASC']],
    });
    res.json({ data: courses });
  } catch (error) {
    next(error);
  }
};

exports.createCourse = async (req, res, next) => {
  try {
    const { name, code, description, semester = 1, year = new Date().getFullYear(), credits, departmentId } = req.body;
    
    if (!name) {
      throw new Error('Название курса обязательно');
    }
    
    const course = await Course.create({
      name,
      code,
      description,
      semester,
      year,
      credits,
      departmentId: departmentId || null,
    });
    res.status(201).json(course);
  } catch (error) {
    next(error);
  }
};

exports.updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);
    if (!course) {
      return next(ApiError.notFound('Курс не найден'));
    }
    await course.update(req.body);
    res.json(course);
  } catch (error) {
    next(error);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);
    if (!course) {
      return next(ApiError.notFound('Курс не найден'));
    }
    await course.destroy();
    res.json({ message: 'Курс удалён' });
  } catch (error) {
    next(error);
  }
};

// ============ MATERIALS ============

exports.getMaterials = async (req, res, next) => {
  try {
    const materials = await Material.findAll({
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'firstName', 'lastName'] },
        { model: Course, as: 'course', attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json({ data: materials });
  } catch (error) {
    next(error);
  }
};

exports.deleteMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const material = await Material.findByPk(id);
    if (!material) {
      return next(ApiError.notFound('Материал не найден'));
    }
    await material.destroy();
    res.json({ message: 'Материал удалён' });
  } catch (error) {
    next(error);
  }
};

// ============ SCHEDULE ============

exports.getSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findAll({
      include: [
        { model: Course, as: 'course', attributes: ['id', 'name'] },
        { model: User, as: 'teacher', attributes: ['id', 'firstName', 'lastName'] },
      ],
      order: [['day_of_week', 'ASC'], ['lesson_number', 'ASC']],
    });
    res.json({ data: schedule });
  } catch (error) {
    next(error);
  }
};

// ============ SCHEDULE CRUD ============

exports.createSchedule = async (req, res, next) => {
  try {
    const {
      courseId, teacherId, groupId, room, building,
      dayOfWeek, lessonNumber, lessonType,
      startTime, endTime, startDate, endDate, notes
    } = req.body;

    if (!courseId || !teacherId || !groupId || !dayOfWeek || !lessonNumber) {
      throw new Error('Недостаточно данных для создания записи расписания');
    }

    const schedule = await Schedule.create({
      courseId,
      teacherId,
      groupId,
      room: room || '',
      building,
      dayOfWeek,
      lessonNumber,
      lessonType: lessonType || 'lecture',
      startTime: startTime || '09:00',
      endTime: endTime || '10:30',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes,
      isActive: true,
    });

    // Загружаем связанные данные
    const result = await Schedule.findByPk(schedule.id, {
      include: [
        { model: Course, as: 'course', attributes: ['id', 'name'] },
        { model: User, as: 'teacher', attributes: ['id', 'firstName', 'lastName'] },
      ],
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findByPk(id);
    
    if (!schedule) {
      return next(ApiError.notFound('Запись расписания не найдена'));
    }

    await schedule.update(req.body);
    
    const result = await Schedule.findByPk(id, {
      include: [
        { model: Course, as: 'course', attributes: ['id', 'name'] },
        { model: User, as: 'teacher', attributes: ['id', 'firstName', 'lastName'] },
      ],
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.deleteSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findByPk(id);
    
    if (!schedule) {
      return next(ApiError.notFound('Запись расписания не найдена'));
    }

    await schedule.destroy();
    res.json({ message: 'Запись расписания удалена' });
  } catch (error) {
    next(error);
  }
};

// ============ DEPARTMENTS ============

exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.findAll({
      attributes: ['id', 'name', 'shortName', 'code'],
      order: [['name', 'ASC']],
    });
    res.json({ data: departments });
  } catch (error) {
    next(error);
  }
};

// ============ GROUPS ============

exports.getGroups = async (req, res, next) => {
  try {
    const groups = await Group.findAll({
      attributes: ['id', 'name', 'year', 'semester'],
      order: [['name', 'ASC']],
    });
    res.json({ data: groups });
  } catch (error) {
    next(error);
  }
};

// ============ TEACHERS ============

exports.getTeachers = async (req, res, next) => {
  try {
    const teachers = await User.findAll({
      where: {
        roleId: { [Op.in]: [2, 3] } // teacher, methodist
      },
      attributes: ['id', 'firstName', 'lastName', 'patronymic'],
      order: [['lastName', 'ASC'], ['firstName', 'ASC']],
    });
    res.json({ data: teachers });
  } catch (error) {
    next(error);
  }
};

// ============ MATERIALS CRUD ============

exports.createMaterial = async (req, res, next) => {
  try {
    const { title, description, courseId, type, isPublished, fileUrl, fileName, fileSize, mimeType } = req.body;

    if (!title || !courseId) {
      throw new Error('Название и курс обязательны');
    }

    const material = await Material.create({
      title,
      description,
      courseId,
      teacherId: req.userId,
      filePath: fileUrl || '',
      fileName: fileName || title,
      fileSize: fileSize || 0,
      mimeType: mimeType || 'application/octet-stream',
      type: type || 'methodical',
      isPublished: isPublished || false,
      publishedAt: isPublished ? new Date() : null,
    });

    const result = await Material.findByPk(material.id, {
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'firstName', 'lastName'] },
        { model: Course, as: 'course', attributes: ['id', 'name'] },
      ],
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
