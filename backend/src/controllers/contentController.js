/**
 * Контроллер контента (новости, курсы, материалы)
 */
const path = require('path');
const fs = require('fs');
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
    const { title, description, courseId, type, isPublished } = req.body;

    if (!title || !courseId) {
      if (req.file) require('fs').unlinkSync(req.file.path);
      throw new Error('Название и курс обязательны');
    }

    let filePath = '';
    let fileName = title;
    let fileSize = 0;
    let mimeType = 'application/octet-stream';

    if (req.file) {
      filePath = `/uploads/${req.file.filename}`;
      fileName = req.file.originalname;
      fileSize = req.file.size;
      mimeType = req.file.mimetype;
    }

    const material = await Material.create({
      title,
      description,
      courseId: parseInt(courseId, 10),
      teacherId: req.userId,
      filePath,
      fileName,
      fileSize,
      mimeType,
      type: type || 'methodical',
      isPublished: isPublished === 'true' || isPublished === true || false,
      publishedAt: (isPublished === 'true' || isPublished === true) ? new Date() : null,
    });

    const result = await Material.findByPk(material.id, {
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'firstName', 'lastName'] },
        { model: Course, as: 'course', attributes: ['id', 'name'] },
      ],
    });

    res.status(201).json(result);
  } catch (error) {
    if (req.file) {
      try { require('fs').unlinkSync(req.file.path); } catch (e) { /* ignore */ }
    }
    next(error);
  }
};

exports.updateMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, courseId, type, isPublished } = req.body;

    const material = await Material.findByPk(id);
    if (!material) {
      if (req.file) require('fs').unlinkSync(req.file.path);
      return next(ApiError.notFound('Материал не найден'));
    }

    // Проверка прав: только admin или автор
    if (req.userRole !== 'admin' && material.teacherId !== req.userId) {
      if (req.file) require('fs').unlinkSync(req.file.path);
      return next(ApiError.forbidden('Нет прав на редактирование'));
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (courseId !== undefined) updateData.courseId = parseInt(courseId, 10);
    if (type !== undefined) updateData.type = type;
    if (isPublished !== undefined) {
      updateData.isPublished = isPublished === 'true' || isPublished === true;
      if (updateData.isPublished && !material.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    if (req.file) {
      // Удаляем старый файл
      if (material.filePath) {
        const fs = require('fs');
        const oldPath = path.join(__dirname, '../../', material.filePath);
        if (fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch (e) { /* ignore */ }
        }
      }
      updateData.filePath = `/uploads/${req.file.filename}`;
      updateData.fileName = req.file.originalname;
      updateData.fileSize = req.file.size;
      updateData.mimeType = req.file.mimetype;
    }

    await material.update(updateData);

    const result = await Material.findByPk(material.id, {
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'firstName', 'lastName'] },
        { model: Course, as: 'course', attributes: ['id', 'name'] },
      ],
    });

    res.json(result);
  } catch (error) {
    if (req.file) {
      try { require('fs').unlinkSync(req.file.path); } catch (e) { /* ignore */ }
    }
    next(error);
  }
};

exports.downloadMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const material = await Material.findByPk(id);
    if (!material) {
      return next(ApiError.notFound('Материал не найден'));
    }

    if (!material.filePath) {
      return next(ApiError.notFound('Файл не загружен'));
    }

    const fs = require('fs');
    const filePath = path.join(__dirname, '../../', material.filePath);
    if (!fs.existsSync(filePath)) {
      return next(ApiError.notFound('Файл не найден на диске'));
    }

    // Инкремент счётчика
    await material.increment('downloads');

    res.download(filePath, material.fileName);
  } catch (error) {
    next(error);
  }
};

exports.viewMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const material = await Material.findByPk(id);
    if (!material) {
      return next(ApiError.notFound('Материал не найден'));
    }

    if (!material.filePath) {
      return next(ApiError.notFound('Файл не загружен'));
    }

    const fs = require('fs');
    const filePath = path.join(__dirname, '../../', material.filePath);
    if (!fs.existsSync(filePath)) {
      return next(ApiError.notFound('Файл не найден на диске'));
    }

    // Инкремент счётчика просмотров
    await material.increment('views');

    res.setHeader('Content-Type', material.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(material.fileName)}"`);
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};
