/**
 * Контроллер контента (новости, курсы, материалы)
 */
const path = require('path');
const fs = require('fs');
const { News, Course, Material, Schedule, User, Department, Group, Category } = require('../models');
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
    const { departmentId, teacherId, semester, search } = req.query;
    const where = {};
    if (departmentId) where.departmentId = parseInt(departmentId, 10);
    if (teacherId) where.teacherId = parseInt(teacherId, 10);
    if (semester) where.semester = parseInt(semester, 10);
    if (search) {
      const { Op } = require('sequelize');
      where.name = { [Op.iLike]: `%${search}%` };
    }

    const courses = await Course.findAll({
      where,
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
    const { courseId, type, teacherId, published, search, categoryId } = req.query;
    const where = {};
    if (courseId) where.courseId = parseInt(courseId, 10);
    if (type) where.type = type;
    if (teacherId) where.teacherId = parseInt(teacherId, 10);
    if (categoryId) where.categoryId = parseInt(categoryId, 10);
    if (published !== undefined) where.isPublished = published === 'true';
    if (search) {
      const { Op } = require('sequelize');
      where.title = { [Op.iLike]: `%${search}%` };
    }

    const materials = await Material.findAll({
      where,
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'firstName', 'lastName'] },
        { model: Course, as: 'course', attributes: ['id', 'name'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'code', 'color', 'icon'] },
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
    const { groupId, teacherId, dayOfWeek, courseId } = req.query;
    const where = {};
    if (groupId) where.groupId = parseInt(groupId, 10);
    if (teacherId) where.teacherId = parseInt(teacherId, 10);
    if (dayOfWeek) where.dayOfWeek = parseInt(dayOfWeek, 10);
    if (courseId) where.courseId = parseInt(courseId, 10);

    const schedule = await Schedule.findAll({
      where,
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

// ============ iCal EXPORT (ФТ-С2) ============

/**
 * Генерация iCalendar (RFC 5545) для экспорта расписания в Google Calendar / Apple Calendar
 * @route GET /api/schedule/ical
 */
exports.getScheduleIcal = async (req, res, next) => {
  try {
    const { groupId, teacherId, startDate, endDate } = req.query;

    const where = {};
    if (groupId) where.groupId = parseInt(groupId, 10);
    if (teacherId) where.teacherId = parseInt(teacherId, 10);

    const schedule = await Schedule.findAll({
      where,
      include: [
        { model: Course, as: 'course', attributes: ['id', 'name'] },
        { model: User, as: 'teacher', attributes: ['id', 'firstName', 'lastName'] },
        { model: Group, as: 'group', attributes: ['id', 'name'] },
      ],
      order: [['day_of_week', 'ASC'], ['lesson_number', 'ASC']],
    });

    // Диапазон дат (по умолчанию — текущий семестр)
    const dtStart = startDate || '2026-02-01';
    const dtEnd = endDate || '2026-05-31';

    // Время пар по умолчанию (если не задано)
    const defaultTimes = {
      1: ['09:00', '10:30'],
      2: ['10:45', '12:15'],
      3: ['12:30', '14:00'],
      4: ['14:15', '15:45'],
      5: ['16:00', '17:30'],
      6: ['17:40', '19:10'],
      7: ['19:20', '20:50'],
      8: ['20:55', '22:25'],
    };

    const formatIcalTime = (date, timeStr) => {
      // timeStr = "09:00:00" или "09:00"
      const [h, m] = timeStr.split(':');
      const d = new Date(date);
      d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
      return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    // Формируем дату для каждого дня недели в диапазоне
    const events = [];
    const startDateObj = new Date(dtStart);
    const endDateObj = new Date(dtEnd);

    for (const item of schedule) {
      const dayOffset = item.dayOfWeek - 1; // 1=Пн → 0
      const [startTime, endTime] = defaultTimes[item.lessonNumber] || [
        item.startTime || '09:00',
        item.endTime || '10:30',
      ];

      // Проходим по всем неделям в диапазоне
      const current = new Date(startDateObj);
      while (current <= endDateObj) {
        // current.getDay() = 0 (Вс) - 6 (Сб); нужно 1 (Пн) - 7 (Вс)
        const currentDay = current.getDay() === 0 ? 7 : current.getDay();
        if (currentDay === item.dayOfWeek) {
          const eventDate = new Date(current);
          const startDateTime = formatIcalTime(eventDate, startTime);
          const endDateTime = formatIcalTime(eventDate, endTime);

          const teacherName = item.teacher
            ? `${item.teacher.lastName} ${item.teacher.firstName}`
            : '';
          const groupName = item.group?.name || '';
          const room = item.room || '';
          const building = item.building ? `, ${item.building}` : '';
          const location = room ? `${room}${building}` : '';

          events.push({
            uid: `schedule-${item.id}-${eventDate.toISOString().split('T')[0]}@faculty-app`,
            start: startDateTime,
            end: endDateTime,
            summary: item.course?.name || 'Занятие',
            description: [
              `Преподаватель: ${teacherName}`,
              `Группа: ${groupName}`,
              `Тип: ${item.lessonType || 'lecture'}`,
              item.notes || '',
            ].filter(Boolean).join('\\n'),
            location,
          });
        }
        current.setDate(current.getDate() + 1);
      }
    }

    // Формируем iCal
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Faculty Information System//Schedule//RU',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:Расписание ИТНиЦТ${groupId ? ` (группа ${groupId})` : ''}`,
    ];

    for (const ev of events) {
      const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${ev.uid}`);
      lines.push(`DTSTAMP:${now}`);
      lines.push(`DTSTART:${ev.start}`);
      lines.push(`DTEND:${ev.end}`);
      lines.push(`SUMMARY:${ev.summary}`);
      if (ev.location) lines.push(`LOCATION:${ev.location}`);
      if (ev.description) lines.push(`DESCRIPTION:${ev.description}`);
      lines.push('END:VEVENT');
    }

    lines.push('END:VCALENDAR');

    const icalContent = lines.join('\r\n');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="schedule-${groupId || 'all'}.ics"`);
    res.send(icalContent);
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
      order: [['name', 'ASC']],
    });
    res.json({ data: departments });
  } catch (error) {
    next(error);
  }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const { name, shortName, code, description, phone, email, address } = req.body;
    if (!name) {
      return next(ApiError.badRequest('Название обязательно'));
    }
    const department = await Department.create({
      name, shortName, code, description, phone, email, address,
      isActive: true,
    });
    res.status(201).json(department);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return next(ApiError.conflict('Кафедра с таким кодом уже существует'));
    }
    next(error);
  }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const department = await Department.findByPk(id);
    if (!department) {
      return next(ApiError.notFound('Кафедра не найдена'));
    }
    const { name, shortName, code, description, phone, email, address, isActive } = req.body;
    await department.update({
      ...(name !== undefined && { name }),
      ...(shortName !== undefined && { shortName }),
      ...(code !== undefined && { code }),
      ...(description !== undefined && { description }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(address !== undefined && { address }),
      ...(isActive !== undefined && { isActive: isActive === 'true' || isActive === true }),
    });
    res.json(department);
  } catch (error) {
    next(error);
  }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const department = await Department.findByPk(id);
    if (!department) {
      return next(ApiError.notFound('Кафедра не найдена'));
    }
    // Проверим есть ли связанные курсы/группы
    const { Course, Group } = require('../models');
    const coursesCount = await Course.count({ where: { departmentId: id } });
    const groupsCount = await Group.count({ where: { departmentId: id } });
    if (coursesCount > 0 || groupsCount > 0) {
      return next(ApiError.badRequest(
        `Невозможно удалить: кафедра используется (${coursesCount} курсов, ${groupsCount} групп)`,
      ));
    }
    await department.destroy();
    res.json({ message: 'Кафедра удалена' });
  } catch (error) {
    next(error);
  }
};

// ============ GROUPS ============

exports.getGroups = async (req, res, next) => {
  try {
    const groups = await Group.findAll({
      include: [{ model: Department, as: 'department', attributes: ['id', 'name', 'shortName'] }],
      order: [['name', 'ASC']],
    });
    res.json({ data: groups });
  } catch (error) {
    next(error);
  }
};

exports.createGroup = async (req, res, next) => {
  try {
    const { name, course, year, semester, departmentId, studentCount, curatorId } = req.body;
    if (!name || !course || !year || !semester || !departmentId) {
      return next(ApiError.badRequest('Название, направление, год, семестр и кафедра обязательны'));
    }
    const group = await Group.create({
      name, course,
      year: parseInt(year, 10),
      semester: parseInt(semester, 10),
      departmentId: parseInt(departmentId, 10),
      studentCount: studentCount || 0,
      curatorId: curatorId || null,
      isActive: true,
    });
    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
};

exports.updateGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const group = await Group.findByPk(id);
    if (!group) {
      return next(ApiError.notFound('Группа не найдена'));
    }
    const { name, course, year, semester, departmentId, studentCount, curatorId, isActive } = req.body;
    await group.update({
      ...(name !== undefined && { name }),
      ...(course !== undefined && { course }),
      ...(year !== undefined && { year: parseInt(year, 10) }),
      ...(semester !== undefined && { semester: parseInt(semester, 10) }),
      ...(departmentId !== undefined && { departmentId: parseInt(departmentId, 10) }),
      ...(studentCount !== undefined && { studentCount: parseInt(studentCount, 10) }),
      ...(curatorId !== undefined && { curatorId: curatorId || null }),
      ...(isActive !== undefined && { isActive: isActive === 'true' || isActive === true }),
    });
    res.json(group);
  } catch (error) {
    next(error);
  }
};

exports.deleteGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const group = await Group.findByPk(id);
    if (!group) {
      return next(ApiError.notFound('Группа не найдена'));
    }
    const { Schedule } = require('../models');
    const scheduleCount = await Schedule.count({ where: { groupId: id } });
    if (scheduleCount > 0) {
      return next(ApiError.badRequest(
        `Невозможно удалить: группа используется в расписании (${scheduleCount} записей)`,
      ));
    }
    await group.destroy();
    res.json({ message: 'Группа удалена' });
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
    const { title, description, courseId, type, isPublished, categoryId } = req.body;

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
      categoryId: categoryId ? parseInt(categoryId, 10) : null,
      isPublished: isPublished === 'true' || isPublished === true || false,
      publishedAt: (isPublished === 'true' || isPublished === true) ? new Date() : null,
    });

    const result = await Material.findByPk(material.id, {
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'firstName', 'lastName'] },
        { model: Course, as: 'course', attributes: ['id', 'name'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'code', 'color', 'icon'] },
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
    const { title, description, courseId, type, isPublished, categoryId } = req.body;

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
    if (categoryId !== undefined) updateData.categoryId = categoryId ? parseInt(categoryId, 10) : null;
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
        { model: Category, as: 'category', attributes: ['id', 'name', 'code', 'color', 'icon'] },
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
