/**
 * Сидеры для заполнения базы данных тестовыми данными
 * @module seeders
 */

const { Role, User, Department, Group, Course, News, Material, Schedule, ApplicantContent, Category } = require('../models');
const logger = require('../utils/logger');

/**
 * Проверка существования данных
 */
const isDataSeeded = async () => {
  const userCount = await User.count();
  return userCount > 0;
};

/**
 * Сидер ролей
 */
const seedRoles = async () => {
  const roles = [
    { name: 'Администратор', code: 'admin', description: 'Полный доступ к системе' },
    { name: 'Преподаватель', code: 'teacher', description: 'Доступ к управлению материалами и расписанием' },
    { name: 'Методист', code: 'methodist', description: 'Управление учебными программами и методическими материалами' },
    { name: 'Студент', code: 'student', description: 'Доступ к учебным материалам и расписанию' },
    { name: 'Абитуриент', code: 'applicant', description: 'Доступ к информации об институте' },
  ];

  for (const role of roles) {
    await Role.findOrCreate({
      where: { code: role.code },
      defaults: role,
    });
  }
  logger.info('✓ Роли созданы');
};

/**
 * Сидер кафедр
 */
const seedDepartments = async () => {
  const departments = [
    { name: 'Кафедра прикладной математики, информационных технологий и информационной безопасности', shortName: 'ПМиИТиИБ', code: 'PMITIB', description: 'Кафедра прикладной математики, информационных технологий и информационной безопасности' },
    { name: 'Кафедра математики и естественнонаучных дисциплин', shortName: 'МиЕНД', code: 'MEND', description: 'Кафедра математики и естественнонаучных дисциплин' },
    { name: 'Кафедра цифровых технологий', shortName: 'ЦТ', code: 'CT', description: 'Кафедра цифровых технологий' },
  ];

  for (const dept of departments) {
    await Department.findOrCreate({
      where: { code: dept.code },
      defaults: { ...dept, isActive: true },
    });
  }
  logger.info('✓ Кафедры созданы');
};

/**
 * Сидер групп
 */
const seedGroups = async () => {
  const groups = [
    // ЦТ (Цифровые технологии) - ID 3
    { name: 'ИВТ-101', course: 'ИВТ', year: 1, semester: 1, departmentId: 3 },
    { name: 'ИВТ-102', course: 'ИВТ', year: 1, semester: 1, departmentId: 3 },
    { name: 'ИВТ-201', course: 'ИВТ', year: 2, semester: 3, departmentId: 3 },
    // МиЕНД (Математика и естественнонаучные дисциплины) - ID 2
    { name: 'МАТ-101', course: 'МАТ', year: 1, semester: 1, departmentId: 2 },
    { name: 'МАТ-201', course: 'МАТ', year: 2, semester: 3, departmentId: 2 },
    { name: 'ФИЗ-101', course: 'ФИЗ', year: 1, semester: 1, departmentId: 2 },
  ];

  for (const group of groups) {
    await Group.findOrCreate({
      where: { name: group.name },
      defaults: { ...group, isActive: true },
    });
  }
  logger.info('✓ Группы созданы');
};

/**
 * Сидер пользователей
 */
const seedUsers = async () => {
  const users = [
    { email: 'admin@faculty.ru', password: 'Admin123!', firstName: 'Админ', lastName: 'Админов', roleId: 1 },
    { email: 'ivanov@faculty.ru', password: 'Teacher123!', firstName: 'Иван', lastName: 'Иванов', roleId: 2 },
    { email: 'petrov@student.ru', password: 'Student123!', firstName: 'Пётр', lastName: 'Петров', roleId: 4 },
    { email: 'sidorova@faculty.ru', password: 'Teacher123!', firstName: 'Анна', lastName: 'Сидорова', roleId: 2 },
    { email: 'kozlov@faculty.ru', password: 'Teacher123!', firstName: 'Сергей', lastName: 'Козлов', roleId: 2 },
    { email: 'novikova@faculty.ru', password: 'Teacher123!', firstName: 'Елена', lastName: 'Новикова', roleId: 2 },
    { email: 'smirnov@student.ru', password: 'Student123!', firstName: 'Алексей', lastName: 'Смирнов', roleId: 4 },
    { email: 'volkova@student.ru', password: 'Student123!', firstName: 'Ольга', lastName: 'Волкова', roleId: 4 },
    { email: 'applicant@faculty.ru', password: 'Applicant123!', firstName: 'Абитуриент', lastName: 'Тестовый', roleId: 5 },
  ];

  for (const user of users) {
    const [created] = await User.findOrCreate({
      where: { email: user.email },
      defaults: user,
    });
    if (created) {
      logger.info(`✓ Создан пользователь: ${user.email}`);
    }
  }
};

/**
 * Сидер курсов
 */
const seedCourses = async () => {
  const courses = [
    // Курсы кафедры ЦТ (Цифровые технологии) - ID 3
    { name: 'Введение в программирование', code: 'CS101', description: 'Базовый курс программирования на Python', semester: 1, year: 2026, credits: 5, departmentId: 3 },
    { name: 'Структуры данных', code: 'CS201', description: 'Массивы, списки, деревья, графы', semester: 2, year: 2026, credits: 4, departmentId: 3 },
    { name: 'Алгоритмы и их анализ', code: 'CS202', description: 'Сортировка, поиск, динамическое программирование', semester: 2, year: 2026, credits: 4, departmentId: 3 },
    { name: 'Базы данных', code: 'CS301', description: 'Реляционные БД, SQL, проектирование', semester: 3, year: 2026, credits: 5, departmentId: 3 },
    { name: 'Веб-разработка', code: 'CS302', description: 'HTML, CSS, JavaScript, React', semester: 3, year: 2026, credits: 5, departmentId: 3 },
    // Курсы кафедры МиЕНД (Математика и естественнонаучные дисциплины) - ID 2
    { name: 'Высшая математика I', code: 'MA101', description: 'Линейная алгебра и аналитическая геометрия', semester: 1, year: 2026, credits: 6, departmentId: 2 },
    { name: 'Математический анализ', code: 'MA102', description: 'Пределы, производные, интегралы', semester: 1, year: 2026, credits: 6, departmentId: 2 },
    { name: 'Дискретная математика', code: 'MA201', description: 'Комбинаторика, логика, множества', semester: 2, year: 2026, credits: 4, departmentId: 2 },
    { name: 'Теория вероятностей', code: 'MA202', description: 'Случайные события, распределения', semester: 2, year: 2026, credits: 4, departmentId: 2 },
    { name: 'Общая физика I', code: 'PH101', description: 'Механика и молекулярная физика', semester: 1, year: 2026, credits: 5, departmentId: 2 },
    { name: 'Общая физика II', code: 'PH102', description: 'Электричество и магнетизм', semester: 2, year: 2026, credits: 5, departmentId: 2 },
    { name: 'Оптика', code: 'PH201', description: 'Волновая и геометрическая оптика', semester: 3, year: 2026, credits: 4, departmentId: 2 },
    // Курсы кафедры ПМиИТиИБ (Прикладная математика, ИТ и ИБ) - ID 1
    { name: 'Информационная безопасность', code: 'IB101', description: 'Основы информационной безопасности', semester: 1, year: 2026, credits: 4, departmentId: 1 },
    { name: 'Математическое моделирование', code: 'MM101', description: 'Основы математического моделирования', semester: 1, year: 2026, credits: 5, departmentId: 1 },
    { name: 'Машинное обучение', code: 'ML101', description: 'Введение в машинное обучение', semester: 2, year: 2026, credits: 5, departmentId: 1 },
  ];

  for (const course of courses) {
    await Course.findOrCreate({
      where: { code: course.code },
      defaults: { ...course, isActive: true },
    });
  }
  logger.info('✓ Курсы созданы');
};

/**
 * Сидер новостей
 */
const seedNews = async () => {
  const news = [
    { title: 'Начало учебного года 2026', content: 'Уважаемые студенты! 1 февраля начинается новый учебный семестр. Желаем успехов в учёбе!', category: 'news', authorId: 1, isPublished: true },
    { title: 'Регистрация на курсы', content: 'Открыта регистрация на факультативные курсы. Успейте записаться до 15 февраля.', category: 'announcement', authorId: 1, isPublished: true },
    { title: 'Научная конференция 2026', content: 'Приглашаем студентов и преподавателей на ежегодную научную конференцию. Тезисы принимаются до 1 марта.', category: 'event', authorId: 1, isPublished: true },
    { title: 'Экзамен по математике', content: 'Экзамен по высшей математике состоится 20 января в 10:00 в аудитории 301.', category: 'announcement', authorId: 1, isPublished: true },
    { title: 'День открытых дверей', content: 'Приглашаем абитуриентов на день открытых дверей 15 марта. Начало в 11:00.', category: 'event', authorId: 1, isPublished: true },
    { title: 'Изменения в расписании', content: 'Внимание! С 1 февраля изменяется расписание занятий для групп 1 курса.', category: 'notice', authorId: 1, isPublished: true },
    { title: 'Стипендии 2026', content: 'Объявлены стипендии для отличников. Заявки принимаются до 1 февраля.', category: 'news', authorId: 1, isPublished: true },
    { title: 'Практика для студентов', content: 'Открыт набор на летнюю практику. Подробности у координатора.', category: 'announcement', authorId: 1, isPublished: true },
    { title: 'Библиотека: новые поступления', content: 'В библиотеку поступили новые учебники по программированию и математике.', category: 'news', authorId: 1, isPublished: true },
    { title: 'Спортивные соревнования', content: 'Приглашаем на турнир по волейболу среди институтов. Дата проведения: 20 февраля.', category: 'event', authorId: 1, isPublished: true },
    { title: 'Конкурс курсовых работ', content: 'Объявлен конкурс лучших курсовых работ. Победители получат ценные призы.', category: 'announcement', authorId: 1, isPublished: true },
    { title: 'Технические работы', content: 'Внимание! 25 января с 02:00 до 06:00 будут проводиться технические работы на сервере.', category: 'notice', authorId: 1, isPublished: true },
  ];

  for (const item of news) {
    await News.findOrCreate({
      where: { title: item.title },
      defaults: item,
    });
  }
  logger.info('✓ Новости созданы');
};

/**
 * Сидер категорий материалов (ФТ-Д7)
 * Категория — тематическая группа, независимая от type
 */
const seedCategories = async () => {
  const categories = [
    { name: 'Программирование', code: 'programming', description: 'Языки программирования, алгоритмы, структуры данных, паттерны проектирования', color: '#1976d2', icon: 'Code', order: 1 },
    { name: 'Базы данных', code: 'databases', description: 'Реляционные и NoSQL БД, SQL, проектирование, оптимизация запросов', color: '#9c27b0', icon: 'Storage', order: 2 },
    { name: 'Веб-разработка', code: 'webdev', description: 'HTML, CSS, JavaScript, React, Node.js, REST API', color: '#2e7d32', icon: 'Language', order: 3 },
    { name: 'Математика', code: 'math', description: 'Высшая математика, линейная алгебра, математический анализ, дискретная математика', color: '#ed6c02', icon: 'Calculate', order: 4 },
    { name: 'Физика', code: 'physics', description: 'Общая физика, механика, электричество, оптика, квантовая физика', color: '#d32f2f', icon: 'Science', order: 5 },
    { name: 'Информационная безопасность', code: 'infosec', description: 'Криптография, защита информации, сетевая безопасность, аудит', color: '#7b1fa2', icon: 'Security', order: 6 },
    { name: 'Иностранные языки', code: 'languages', description: 'Английский, немецкий и другие иностранные языки для IT', color: '#0288d1', icon: 'Translate', order: 7 },
    { name: 'Общие материалы', code: 'general', description: 'Методические указания, общие пособия, вспомогательные материалы', color: '#616161', icon: 'MenuBook', order: 99 },
  ];

  const created = {};
  for (const cat of categories) {
    const [c] = await Category.findOrCreate({
      where: { code: cat.code },
      defaults: { ...cat, isActive: true },
    });
    created[cat.code] = c.id;
  }
  logger.info('✓ Категории созданы');
  return created;
};

/**
 * Маппинг course code → category code
 * Используется в seedMaterials для автоприсвоения категории
 */
const COURSE_CODE_TO_CATEGORY = {
  CS: 'programming',        // CS101, CS201, CS202, CS301, CS302
  MA: 'math',                // MA101, MA102, MA201, MA202
  PH: 'physics',             // PH101, PH102, PH201
  IB: 'infosec',             // IB101
  MM: 'math',                // MM101 (математическое моделирование)
  ML: 'programming',        // ML101 (машинное обучение)
  FL: 'languages',           // FL101 (foreign language)
};

/**
 * Сидер материалов
 * @param {Object} categoriesMap - { 'programming': 1, 'math': 4, ... }
 */
const seedMaterials = async (categoriesMap = {}) => {
  // Маппинг courseId → categoryCode (на основе текущих course.code)
  const courseCategory = {
    1: 'programming',   // CS101 Введение в программирование
    2: 'programming',   // CS201 Структуры данных
    3: 'programming',   // CS202 Алгоритмы и их анализ
    4: 'databases',     // CS301 Базы данных
    5: 'webdev',        // CS302 Веб-разработка
    6: 'math',          // MA101 Высшая математика I
    7: 'math',          // MA102 Математический анализ
    8: 'math',          // MA201 Дискретная математика
    9: 'math',          // MA202 Теория вероятностей
    10: 'physics',      // PH101 Общая физика I
    11: 'physics',      // PH102 Общая физика II
    12: 'physics',      // PH201 Оптика
    13: 'infosec',      // IB101 Информационная безопасность
    14: 'math',         // MM101 Математическое моделирование
    15: 'programming',  // ML101 Машинное обучение
  };

  const materials = [
    // CS курсы → programming
    { title: 'Лекция: Введение в Python', courseId: 1, teacherId: 2, type: 'lecture', filePath: '/uploads/cs101_lecture1.pdf', fileName: 'cs101_lecture1.pdf', fileSize: 1024000, mimeType: 'application/pdf' },
    { title: 'Практика: Переменные и типы данных', courseId: 1, teacherId: 2, type: 'practice', filePath: '/uploads/cs101_practice1.pdf', fileName: 'cs101_practice1.pdf', fileSize: 512000, mimeType: 'application/pdf' },
    { title: 'Методичка по Python', courseId: 1, teacherId: 2, type: 'methodical', filePath: '/uploads/python_guide.pdf', fileName: 'python_guide.pdf', fileSize: 2048000, mimeType: 'application/pdf' },
    { title: 'Лекция: Структуры данных - Списки', courseId: 2, teacherId: 2, type: 'lecture', filePath: '/uploads/cs201_lecture1.pdf', fileName: 'cs201_lecture1.pdf', fileSize: 1536000, mimeType: 'application/pdf' },
    { title: 'Практика: Работа с массивами', courseId: 2, teacherId: 2, type: 'practice', filePath: '/uploads/cs201_practice1.pdf', fileName: 'cs201_practice1.pdf', fileSize: 768000, mimeType: 'application/pdf' },
    { title: 'Лекция: Алгоритмы сортировки', courseId: 3, teacherId: 4, type: 'lecture', filePath: '/uploads/cs202_lecture1.pdf', fileName: 'cs202_lecture1.pdf', fileSize: 1280000, mimeType: 'application/pdf' },
    { title: 'Лекция: Введение в SQL', courseId: 4, teacherId: 4, type: 'lecture', filePath: '/uploads/cs301_lecture1.pdf', fileName: 'cs301_lecture1.pdf', fileSize: 1400000, mimeType: 'application/pdf' },
    { title: 'Практика: SQL запросы', courseId: 4, teacherId: 4, type: 'practice', filePath: '/uploads/cs301_practice1.pdf', fileName: 'cs301_practice1.pdf', fileSize: 640000, mimeType: 'application/pdf' },
    // МАТ курсы → math
    { title: 'Лекция: Матрицы и определители', courseId: 6, teacherId: 5, type: 'lecture', filePath: '/uploads/ma101_lecture1.pdf', fileName: 'ma101_lecture1.pdf', fileSize: 1800000, mimeType: 'application/pdf' },
    { title: 'Практика: Решение задач', courseId: 6, teacherId: 5, type: 'practice', filePath: '/uploads/ma101_practice1.pdf', fileName: 'ma101_practice1.pdf', fileSize: 900000, mimeType: 'application/pdf' },
    { title: 'Лекция: Пределы функций', courseId: 7, teacherId: 5, type: 'lecture', filePath: '/uploads/ma102_lecture1.pdf', fileName: 'ma102_lecture1.pdf', fileSize: 1600000, mimeType: 'application/pdf' },
    { title: 'Лекция: Комбинаторика', courseId: 8, teacherId: 5, type: 'lecture', filePath: '/uploads/ma201_lecture1.pdf', fileName: 'ma201_lecture1.pdf', fileSize: 1200000, mimeType: 'application/pdf' },
    // ФИЗ курсы → physics
    { title: 'Лекция: Кинематика', courseId: 10, teacherId: 6, type: 'lecture', filePath: '/uploads/ph101_lecture1.pdf', fileName: 'ph101_lecture1.pdf', fileSize: 2000000, mimeType: 'application/pdf' },
    { title: 'Практика: Законы Ньютона', courseId: 10, teacherId: 6, type: 'practice', filePath: '/uploads/ph101_practice1.pdf', fileName: 'ph101_practice1.pdf', fileSize: 800000, mimeType: 'application/pdf' },
    { title: 'Лекция: Электростатика', courseId: 11, teacherId: 6, type: 'lecture', filePath: '/uploads/ph102_lecture1.pdf', fileName: 'ph102_lecture1.pdf', fileSize: 1900000, mimeType: 'application/pdf' },
    // ИБ → infosec
    { title: 'Учебник: Основы информационной безопасности', courseId: 13, teacherId: 2, type: 'methodical', filePath: '/uploads/fl101_textbook.pdf', fileName: 'ib101_textbook.pdf', fileSize: 5000000, mimeType: 'application/pdf' },
    { title: 'Лекция: Криптография и защита данных', courseId: 13, teacherId: 2, type: 'lecture', filePath: '/uploads/fl101_lecture1.pdf', fileName: 'ib101_lecture1.pdf', fileSize: 800000, mimeType: 'application/pdf' },
  ];

  for (const material of materials) {
    const categoryCode = courseCategory[material.courseId];
    const categoryId = categoryCode ? categoriesMap[categoryCode] : null;
    const [, created] = await Material.findOrCreate({
      where: { title: material.title },
      defaults: { ...material, categoryId, isPublished: true },
    });
    // Если материал уже существовал без categoryId — обновим
    if (!created && categoryId && !material.categoryId) {
      await Material.update({ categoryId }, { where: { title: material.title } });
    }
  }
  logger.info('✓ Материалы созданы');
};

/**
 * Сидер расписания - полное расписание для всех групп
 */
const seedSchedule = async () => {
  // Группы: ИВТ-101(id=1), ИВТ-102(id=2), ИВТ-201(id=3), МАТ-101(id=4), МАТ-201(id=5), ФИЗ-101(id=6)
  // Дни недели: 1=Пн, 2=Вт, 3=Ср, 4=Чт, 5=Пт
  // Пары: 1(09:00-10:30), 2(10:45-12:15), 3(12:30-14:00), 4(14:15-15:45)
  
  const scheduleItems = [
    // ИВТ-101 (группа 1) - понедельник
    { courseId: 1, teacherId: 2, groupId: 1, room: '301', building: 'Главный', dayOfWeek: 1, lessonNumber: 1, lessonType: 'lecture', startTime: '09:00', endTime: '10:30' },
    { courseId: 6, teacherId: 5, groupId: 1, room: '305', building: 'Главный', dayOfWeek: 1, lessonNumber: 2, lessonType: 'lecture', startTime: '10:45', endTime: '12:15' },
    { courseId: 13, teacherId: 2, groupId: 1, room: '410', building: 'Главный', dayOfWeek: 1, lessonNumber: 3, lessonType: 'practice', startTime: '12:30', endTime: '14:00' },
    { courseId: 10, teacherId: 6, groupId: 1, room: '201', building: 'Физический', dayOfWeek: 1, lessonNumber: 4, lessonType: 'lecture', startTime: '14:15', endTime: '15:45' },
    // ИВТ-101 - вторник
    { courseId: 1, teacherId: 2, groupId: 1, room: '302', building: 'Главный', dayOfWeek: 2, lessonNumber: 1, lessonType: 'practice', startTime: '09:00', endTime: '10:30' },
    { courseId: 7, teacherId: 5, groupId: 1, room: '305', building: 'Главный', dayOfWeek: 2, lessonNumber: 2, lessonType: 'lecture', startTime: '10:45', endTime: '12:15' },
    { courseId: 6, teacherId: 5, groupId: 1, room: '305', building: 'Главный', dayOfWeek: 2, lessonNumber: 3, lessonType: 'practice', startTime: '12:30', endTime: '14:00' },
    { courseId: 10, teacherId: 6, groupId: 1, room: '202', building: 'Физический', dayOfWeek: 2, lessonNumber: 4, lessonType: 'lab', startTime: '14:15', endTime: '15:45' },
    // ИВТ-101 - среда
    { courseId: 2, teacherId: 2, groupId: 1, room: '301', building: 'Главный', dayOfWeek: 3, lessonNumber: 1, lessonType: 'lecture', startTime: '09:00', endTime: '10:30' },
    { courseId: 13, teacherId: 2, groupId: 1, room: '410', building: 'Главный', dayOfWeek: 3, lessonNumber: 2, lessonType: 'lecture', startTime: '10:45', endTime: '12:15' },
    { courseId: 7, teacherId: 5, groupId: 1, room: '305', building: 'Главный', dayOfWeek: 3, lessonNumber: 3, lessonType: 'practice', startTime: '12:30', endTime: '14:00' },
    { courseId: 1, teacherId: 2, groupId: 1, room: '301', building: 'Главный', dayOfWeek: 3, lessonNumber: 4, lessonType: 'lecture', startTime: '14:15', endTime: '15:45' },
    // ИВТ-101 - четверг
    { courseId: 2, teacherId: 2, groupId: 1, room: '302', building: 'Главный', dayOfWeek: 4, lessonNumber: 1, lessonType: 'practice', startTime: '09:00', endTime: '10:30' },
    { courseId: 10, teacherId: 6, groupId: 1, room: '201', building: 'Физический', dayOfWeek: 4, lessonNumber: 2, lessonType: 'lecture', startTime: '10:45', endTime: '12:15' },
    { courseId: 6, teacherId: 5, groupId: 1, room: '305', building: 'Главный', dayOfWeek: 4, lessonNumber: 3, lessonType: 'lecture', startTime: '12:30', endTime: '14:00' },
    { courseId: 13, teacherId: 2, groupId: 1, room: '410', building: 'Главный', dayOfWeek: 4, lessonNumber: 4, lessonType: 'practice', startTime: '14:15', endTime: '15:45' },
    // ИВТ-101 - пятница
    { courseId: 2, teacherId: 2, groupId: 1, room: '301', building: 'Главный', dayOfWeek: 5, lessonNumber: 1, lessonType: 'lecture', startTime: '09:00', endTime: '10:30' },
    { courseId: 7, teacherId: 5, groupId: 1, room: '305', building: 'Главный', dayOfWeek: 5, lessonNumber: 2, lessonType: 'lecture', startTime: '10:45', endTime: '12:15' },
    { courseId: 10, teacherId: 6, groupId: 1, room: '202', building: 'Физический', dayOfWeek: 5, lessonNumber: 3, lessonType: 'practice', startTime: '12:30', endTime: '14:00' },
    { courseId: 1, teacherId: 2, groupId: 1, room: '302', building: 'Главный', dayOfWeek: 5, lessonNumber: 4, lessonType: 'practice', startTime: '14:15', endTime: '15:45' },

    // ИВТ-102 (группа 2) - понедельник
    { courseId: 1, teacherId: 2, groupId: 2, room: '303', building: 'Главный', dayOfWeek: 1, lessonNumber: 1, lessonType: 'lecture', startTime: '09:00', endTime: '10:30' },
    { courseId: 6, teacherId: 5, groupId: 2, room: '306', building: 'Главный', dayOfWeek: 1, lessonNumber: 2, lessonType: 'lecture', startTime: '10:45', endTime: '12:15' },
    { courseId: 14, teacherId: 2, groupId: 2, room: '411', building: 'Главный', dayOfWeek: 1, lessonNumber: 3, lessonType: 'practice', startTime: '12:30', endTime: '14:00' },
    { courseId: 11, teacherId: 6, groupId: 2, room: '203', building: 'Физический', dayOfWeek: 1, lessonNumber: 4, lessonType: 'lecture', startTime: '14:15', endTime: '15:45' },
    // ИВТ-102 - вторник
    { courseId: 1, teacherId: 2, groupId: 2, room: '304', building: 'Главный', dayOfWeek: 2, lessonNumber: 1, lessonType: 'practice', startTime: '09:00', endTime: '10:30' },
    { courseId: 7, teacherId: 5, groupId: 2, room: '306', building: 'Главный', dayOfWeek: 2, lessonNumber: 2, lessonType: 'lecture', startTime: '10:45', endTime: '12:15' },
    { courseId: 6, teacherId: 5, groupId: 2, room: '306', building: 'Главный', dayOfWeek: 2, lessonNumber: 3, lessonType: 'practice', startTime: '12:30', endTime: '14:00' },
    { courseId: 11, teacherId: 6, groupId: 2, room: '204', building: 'Физический', dayOfWeek: 2, lessonNumber: 4, lessonType: 'lab', startTime: '14:15', endTime: '15:45' },
    // ИВТ-102 - среда
    { courseId: 3, teacherId: 4, groupId: 2, room: '303', building: 'Главный', dayOfWeek: 3, lessonNumber: 1, lessonType: 'lecture', startTime: '09:00', endTime: '10:30' },
    { courseId: 14, teacherId: 2, groupId: 2, room: '411', building: 'Главный', dayOfWeek: 3, lessonNumber: 2, lessonType: 'lecture', startTime: '10:45', endTime: '12:15' },
    { courseId: 7, teacherId: 5, groupId: 2, room: '306', building: 'Главный', dayOfWeek: 3, lessonNumber: 3, lessonType: 'practice', startTime: '12:30', endTime: '14:00' },
    { courseId: 1, teacherId: 2, groupId: 2, room: '303', building: 'Главный', dayOfWeek: 3, lessonNumber: 4, lessonType: 'lecture', startTime: '14:15', endTime: '15:45' },
    // ИВТ-102 - четверг
    { courseId: 3, teacherId: 4, groupId: 2, room: '304', building: 'Главный', dayOfWeek: 4, lessonNumber: 1, lessonType: 'practice', startTime: '09:00', endTime: '10:30' },
    { courseId: 11, teacherId: 6, groupId: 2, room: '203', building: 'Физический', dayOfWeek: 4, lessonNumber: 2, lessonType: 'lecture', startTime: '10:45', endTime: '12:15' },
    { courseId: 6, teacherId: 5, groupId: 2, room: '306', building: 'Главный', dayOfWeek: 4, lessonNumber: 3, lessonType: 'lecture', startTime: '12:30', endTime: '14:00' },
    { courseId: 14, teacherId: 2, groupId: 2, room: '411', building: 'Главный', dayOfWeek: 4, lessonNumber: 4, lessonType: 'practice', startTime: '14:15', endTime: '15:45' },
    // ИВТ-102 - пятница
    { courseId: 3, teacherId: 4, groupId: 2, room: '303', building: 'Главный', dayOfWeek: 5, lessonNumber: 1, lessonType: 'lecture', startTime: '09:00', endTime: '10:30' },
    { courseId: 7, teacherId: 5, groupId: 2, room: '306', building: 'Главный', dayOfWeek: 5, lessonNumber: 2, lessonType: 'lecture', startTime: '10:45', endTime: '12:15' },
    { courseId: 11, teacherId: 6, groupId: 2, room: '204', building: 'Физический', dayOfWeek: 5, lessonNumber: 3, lessonType: 'practice', startTime: '12:30', endTime: '14:00' },
    { courseId: 1, teacherId: 2, groupId: 2, room: '304', building: 'Главный', dayOfWeek: 5, lessonNumber: 4, lessonType: 'practice', startTime: '14:15', endTime: '15:45' },

    // ИВТ-201 (группа 3) - понедельник
    { courseId: 4, teacherId: 4, groupId: 3, room: '401', building: 'Главный', dayOfWeek: 1, lessonNumber: 1, lessonType: 'lecture', startTime: '09:00', endTime: '10:30' },
    { courseId: 5, teacherId: 4, groupId: 3, room: '402', building: 'Главный', dayOfWeek: 1, lessonNumber: 2, lessonType: 'lecture', startTime: '10:45', endTime: '12:15' },
    { courseId: 8, teacherId: 5, groupId: 3, room: '307', building: 'Главный', dayOfWeek: 1, lessonNumber: 3, lessonType: 'practice', startTime: '12:30', endTime: '14:00' },
    { courseId: 9, teacherId: 5, groupId: 3, room: '307', building: 'Главный', dayOfWeek: 1, lessonNumber: 4, lessonType: 'lecture', startTime: '14:15', endTime: '15:45' },
    // ИВТ-201 - вторник
    { courseId: 4, teacherId: 4, groupId: 3, room: '403', building: 'Главный', dayOfWeek: 2, lessonNumber: 1, lessonType: 'practice', startTime: '09:00', endTime: '10:30' },
    { courseId: 5, teacherId: 4, groupId: 3, room: '404', building: 'Главный', dayOfWeek: 2, lessonNumber: 2, lessonType: 'practice', startTime: '10:45', endTime: '12:15' },
    { courseId: 8, teacherId: 5, groupId: 3, room: '307', building: 'Главный', dayOfWeek: 2, lessonNumber: 3, lessonType: 'lecture', startTime: '12:30', endTime: '14:00' },
    { courseId: 9, teacherId: 5, groupId: 3, room: '307', building: 'Главный', dayOfWeek: 2, lessonNumber: 4, lessonType: 'practice', startTime: '14:15', endTime: '15:45' },
    // ИВТ-201 - среда
    { courseId: 4, teacherId: 4, groupId: 3, room: '401', building: 'Главный', dayOfWeek: 3, lessonNumber: 1, lessonType: 'lecture', startTime: '09:00', endTime: '10:30' },
    { courseId: 5, teacherId: 4, groupId: 3, room: '402', building: 'Главный', dayOfWeek: 3, lessonNumber: 2, lessonType: 'lecture', startTime: '10:45', endTime: '12:15' },
    { courseId: 9, teacherId: 5, groupId: 3, room: '307', building: 'Главный', dayOfWeek: 3, lessonNumber: 3, lessonType: 'lecture', startTime: '12:30', endTime: '14:00' },
    { courseId: 8, teacherId: 5, groupId: 3, room: '307', building: 'Главный', dayOfWeek: 3, lessonNumber: 4, lessonType: 'practice', startTime: '14:15', endTime: '15:45' },
    // ИВТ-201 - четверг
    { courseId: 5, teacherId: 4, groupId: 3, room: '404', building: 'Главный', dayOfWeek: 4, lessonNumber: 1, lessonType: 'practice', startTime: '09:00', endTime: '10:30' },
    { courseId: 4, teacherId: 4, groupId: 3, room: '401', building: 'Главный', dayOfWeek: 4, lessonNumber: 2, lessonType: 'lecture', startTime: '10:45', endTime: '12:15' },
    { courseId: 9, teacherId: 5, groupId: 3, room: '307', building: 'Главный', dayOfWeek: 4, lessonNumber: 3, lessonType: 'practice', startTime: '12:30', endTime: '14:00' },
    { courseId: 8, teacherId: 5, groupId: 3, room: '307', building: 'Главный', dayOfWeek: 4, lessonNumber: 4, lessonType: 'lecture', startTime: '14:15', endTime: '15:45' },
    // ИВТ-201 - пятница
    { courseId: 4, teacherId: 4, groupId: 3, room: '403', building: 'Главный', dayOfWeek: 5, lessonNumber: 1, lessonType: 'practice', startTime: '09:00', endTime: '10:30' },
    { courseId: 5, teacherId: 4, groupId: 3, room: '404', building: 'Главный', dayOfWeek: 5, lessonNumber: 2, lessonType: 'practice', startTime: '10:45', endTime: '12:15' },
    { courseId: 8, teacherId: 5, groupId: 3, room: '307', building: 'Главный', dayOfWeek: 5, lessonNumber: 3, lessonType: 'lecture', startTime: '12:30', endTime: '14:00' },
    { courseId: 9, teacherId: 5, groupId: 3, room: '307', building: 'Главный', dayOfWeek: 5, lessonNumber: 4, lessonType: 'lecture', startTime: '14:15', endTime: '15:45' },

    // МАТ-101 (группа 4) - понедельник
    { courseId: 6, teacherId: 5, groupId: 4, room: '501', building: 'Главный', dayOfWeek: 1, lessonNumber: 1, lessonType: 'lecture', startTime: '09:00', endTime: '10:30' },
    { courseId: 7, teacherId: 5, groupId: 4, room: '502', building: 'Главный', dayOfWeek: 1, lessonNumber: 2, lessonType: 'lecture', startTime: '10:45', endTime: '12:15' },
    { courseId: 15, teacherId: 2, groupId: 4, room: '412', building: 'Главный', dayOfWeek: 1, lessonNumber: 3, lessonType: 'practice', startTime: '12:30', endTime: '14:00' },
    { courseId: 10, teacherId: 6, groupId: 4, room: '205', building: 'Физический', dayOfWeek: 1, lessonNumber: 4, lessonType: 'lecture', startTime: '14:15', endTime: '15:45' },
    // МАТ-101 - вторник
    { courseId: 6, teacherId: 5, groupId: 4, room: '503', building: 'Главный', dayOfWeek: 2, lessonNumber: 1, lessonType: 'practice', startTime: '09:00', endTime: '10:30' },
    { courseId: 7, teacherId: 5, groupId: 4, room: '502', building: 'Главный', dayOfWeek: 2, lessonNumber: 2, lessonType: 'practice', startTime: '10:45', endTime: '12:15' },
    { courseId: 10, teacherId: 6, groupId: 4, room: '206', building: 'Физический', dayOfWeek: 2, lessonNumber: 3, lessonType: 'lab', startTime: '12:30', endTime: '14:00' },
    { courseId: 15, teacherId: 2, groupId: 4, room: '412', building: 'Главный', dayOfWeek: 2, lessonNumber: 4, lessonType: 'lecture', startTime: '14:15', endTime: '15:45' },
    // МАТ-101 - среда
    { courseId: 8, teacherId: 5, groupId: 4, room: '501', building: 'Главный', dayOfWeek: 3, lessonNumber: 1, lessonType: 'lecture', startTime: '09:00', endTime: '10:30' },
    { courseId: 6, teacherId: 5, groupId: 4, room: '502', building: 'Главный', dayOfWeek: 3, lessonNumber: 2, lessonType: 'lecture', startTime: '10:45', endTime: '12:15' },
    { courseId: 7, teacherId: 5, groupId: 4, room: '502', building: 'Главный', dayOfWeek: 3, lessonNumber: 3, lessonType: 'practice', startTime: '12:30', endTime: '14:00' },
    { courseId: 10, teacherId: 6, groupId: 4, room: '205', building: 'Физический', dayOfWeek: 3, lessonNumber: 4, lessonType: 'practice', startTime: '14:15', endTime: '15:45' },
    // МАТ-101 - четверг
    { courseId: 8, teacherId: 5, groupId: 4, room: '503', building: 'Главный', dayOfWeek: 4, lessonNumber: 1, lessonType: 'practice', startTime: '09:00', endTime: '10:30' },
    { courseId: 10, teacherId: 6, groupId: 4, room: '205', building: 'Физический', dayOfWeek: 4, lessonNumber: 2, lessonType: 'lecture', startTime: '10:45', endTime: '12:15' },
    { courseId: 6, teacherId: 5, groupId: 4, room: '502', building: 'Главный', dayOfWeek: 4, lessonNumber: 3, lessonType: 'practice', startTime: '12:30', endTime: '14:00' },
    { courseId: 15, teacherId: 2, groupId: 4, room: '412', building: 'Главный', dayOfWeek: 4, lessonNumber: 4, lessonType: 'practice', startTime: '14:15', endTime: '15:45' },
    // МАТ-101 - пятница
    { courseId: 8, teacherId: 5, groupId: 4, room: '501', building: 'Главный', dayOfWeek: 5, lessonNumber: 1, lessonType: 'lecture', startTime: '09:00', endTime: '10:30' },
    { courseId: 7, teacherId: 5, groupId: 4, room: '502', building: 'Главный', dayOfWeek: 5, lessonNumber: 2, lessonType: 'lecture', startTime: '10:45', endTime: '12:15' },
    { courseId: 10, teacherId: 6, groupId: 4, room: '206', building: 'Физический', dayOfWeek: 5, lessonNumber: 3, lessonType: 'practice', startTime: '12:30', endTime: '14:00' },
    { courseId: 6, teacherId: 5, groupId: 4, room: '503', building: 'Главный', dayOfWeek: 5, lessonNumber: 4, lessonType: 'practice', startTime: '14:15', endTime: '15:45' },

    // МАТ-201 (группа 5) - понедельник
    { courseId: 8, teacherId: 5, groupId: 5, room: '601', building: 'Главный', dayOfWeek: 1, lessonNumber: 1, lessonType: 'lecture', startTime: '09:00', endTime: '10:30' },
    { courseId: 9, teacherId: 5, groupId: 5, room: '602', building: 'Главный', dayOfWeek: 1, lessonNumber: 2, lessonType: 'lecture', startTime: '10:45', endTime: '12:15' },
    { courseId: 12, teacherId: 6, groupId: 5, room: '207', building: 'Физический', dayOfWeek: 1, lessonNumber: 3, lessonType: 'practice', startTime: '12:30', endTime: '14:00' },
    { courseId: 4, teacherId: 4, groupId: 5, room: '405', building: 'Главный', dayOfWeek: 1, lessonNumber: 4, lessonType: 'lecture', startTime: '14:15', endTime: '15:45' },
    // МАТ-201 - вторник
    { courseId: 8, teacherId: 5, groupId: 5, room: '603', building: 'Главный', dayOfWeek: 2, lessonNumber: 1, lessonType: 'practice', startTime: '09:00', endTime: '10:30' },
    { courseId: 9, teacherId: 5, groupId: 5, room: '602', building: 'Главный', dayOfWeek: 2, lessonNumber: 2, lessonType: 'practice', startTime: '10:45', endTime: '12:15' },
    { courseId: 12, teacherId: 6, groupId: 5, room: '208', building: 'Физический', dayOfWeek: 2, lessonNumber: 3, lessonType: 'lecture', startTime: '12:30', endTime: '14:00' },
    { courseId: 4, teacherId: 4, groupId: 5, room: '406', building: 'Главный', dayOfWeek: 2, lessonNumber: 4, lessonType: 'practice', startTime: '14:15', endTime: '15:45' },
    // МАТ-201 - среда
    { courseId: 9, teacherId: 5, groupId: 5, room: '601', building: 'Главный', dayOfWeek: 3, lessonNumber: 1, lessonType: 'lecture', startTime: '09:00', endTime: '10:30' },
    { courseId: 8, teacherId: 5, groupId: 5, room: '602', building: 'Главный', dayOfWeek: 3, lessonNumber: 2, lessonType: 'lecture', startTime: '10:45', endTime: '12:15' },
    { courseId: 4, teacherId: 4, groupId: 5, room: '405', building: 'Главный', dayOfWeek: 3, lessonNumber: 3, lessonType: 'lecture', startTime: '12:30', endTime: '14:00' },
    { courseId: 12, teacherId: 6, groupId: 5, room: '207', building: 'Физический', dayOfWeek: 3, lessonNumber: 4, lessonType: 'lab', startTime: '14:15', endTime: '15:45' },
    // МАТ-201 - четверг
    { courseId: 9, teacherId: 5, groupId: 5, room: '603', building: 'Главный', dayOfWeek: 4, lessonNumber: 1, lessonType: 'practice', startTime: '09:00', endTime: '10:30' },
    { courseId: 12, teacherId: 6, groupId: 5, room: '207', building: 'Физический', dayOfWeek: 4, lessonNumber: 2, lessonType: 'lecture', startTime: '10:45', endTime: '12:15' },
    { courseId: 8, teacherId: 5, groupId: 5, room: '602', building: 'Главный', dayOfWeek: 4, lessonNumber: 3, lessonType: 'practice', startTime: '12:30', endTime: '14:00' },
    { courseId: 4, teacherId: 4, groupId: 5, room: '406', building: 'Главный', dayOfWeek: 4, lessonNumber: 4, lessonType: 'practice', startTime: '14:15', endTime: '15:45' },
    // МАТ-201 - пятница
    { courseId: 9, teacherId: 5, groupId: 5, room: '601', building: 'Главный', dayOfWeek: 5, lessonNumber: 1, lessonType: 'lecture', startTime: '09:00', endTime: '10:30' },
    { courseId: 12, teacherId: 6, groupId: 5, room: '208', building: 'Физический', dayOfWeek: 5, lessonNumber: 2, lessonType: 'practice', startTime: '10:45', endTime: '12:15' },
    { courseId: 4, teacherId: 4, groupId: 5, room: '405', building: 'Главный', dayOfWeek: 5, lessonNumber: 3, lessonType: 'practice', startTime: '12:30', endTime: '14:00' },
    { courseId: 8, teacherId: 5, groupId: 5, room: '603', building: 'Главный', dayOfWeek: 5, lessonNumber: 4, lessonType: 'practice', startTime: '14:15', endTime: '15:45' },

    // ФИЗ-101 (группа 6) - понедельник
    { courseId: 10, teacherId: 6, groupId: 6, room: '301', building: 'Физический', dayOfWeek: 1, lessonNumber: 1, lessonType: 'lecture', startTime: '09:00', endTime: '10:30' },
    { courseId: 11, teacherId: 6, groupId: 6, room: '302', building: 'Физический', dayOfWeek: 1, lessonNumber: 2, lessonType: 'lecture', startTime: '10:45', endTime: '12:15' },
    { courseId: 6, teacherId: 5, groupId: 6, room: '504', building: 'Главный', dayOfWeek: 1, lessonNumber: 3, lessonType: 'practice', startTime: '12:30', endTime: '14:00' },
    { courseId: 15, teacherId: 2, groupId: 6, room: '413', building: 'Главный', dayOfWeek: 1, lessonNumber: 4, lessonType: 'practice', startTime: '14:15', endTime: '15:45' },
    // ФИЗ-101 - вторник
    { courseId: 10, teacherId: 6, groupId: 6, room: '303', building: 'Физический', dayOfWeek: 2, lessonNumber: 1, lessonType: 'lab', startTime: '09:00', endTime: '10:30' },
    { courseId: 11, teacherId: 6, groupId: 6, room: '304', building: 'Физический', dayOfWeek: 2, lessonNumber: 2, lessonType: 'practice', startTime: '10:45', endTime: '12:15' },
    { courseId: 6, teacherId: 5, groupId: 6, room: '504', building: 'Главный', dayOfWeek: 2, lessonNumber: 3, lessonType: 'lecture', startTime: '12:30', endTime: '14:00' },
    { courseId: 15, teacherId: 2, groupId: 6, room: '413', building: 'Главный', dayOfWeek: 2, lessonNumber: 4, lessonType: 'lecture', startTime: '14:15', endTime: '15:45' },
    // ФИЗ-101 - среда
    { courseId: 12, teacherId: 6, groupId: 6, room: '301', building: 'Физический', dayOfWeek: 3, lessonNumber: 1, lessonType: 'lecture', startTime: '09:00', endTime: '10:30' },
    { courseId: 10, teacherId: 6, groupId: 6, room: '302', building: 'Физический', dayOfWeek: 3, lessonNumber: 2, lessonType: 'lecture', startTime: '10:45', endTime: '12:15' },
    { courseId: 11, teacherId: 6, groupId: 6, room: '304', building: 'Физический', dayOfWeek: 3, lessonNumber: 3, lessonType: 'practice', startTime: '12:30', endTime: '14:00' },
    { courseId: 6, teacherId: 5, groupId: 6, room: '504', building: 'Главный', dayOfWeek: 3, lessonNumber: 4, lessonType: 'practice', startTime: '14:15', endTime: '15:45' },
    // ФИЗ-101 - четверг
    { courseId: 12, teacherId: 6, groupId: 6, room: '303', building: 'Физический', dayOfWeek: 4, lessonNumber: 1, lessonType: 'practice', startTime: '09:00', endTime: '10:30' },
    { courseId: 11, teacherId: 6, groupId: 6, room: '302', building: 'Физический', dayOfWeek: 4, lessonNumber: 2, lessonType: 'lecture', startTime: '10:45', endTime: '12:15' },
    { courseId: 10, teacherId: 6, groupId: 6, room: '304', building: 'Физический', dayOfWeek: 4, lessonNumber: 3, lessonType: 'practice', startTime: '12:30', endTime: '14:00' },
    { courseId: 15, teacherId: 2, groupId: 6, room: '413', building: 'Главный', dayOfWeek: 4, lessonNumber: 4, lessonType: 'practice', startTime: '14:15', endTime: '15:45' },
    // ФИЗ-101 - пятница
    { courseId: 12, teacherId: 6, groupId: 6, room: '301', building: 'Физический', dayOfWeek: 5, lessonNumber: 1, lessonType: 'lecture', startTime: '09:00', endTime: '10:30' },
    { courseId: 10, teacherId: 6, groupId: 6, room: '302', building: 'Физический', dayOfWeek: 5, lessonNumber: 2, lessonType: 'practice', startTime: '10:45', endTime: '12:15' },
    { courseId: 11, teacherId: 6, groupId: 6, room: '304', building: 'Физический', dayOfWeek: 5, lessonNumber: 3, lessonType: 'lab', startTime: '12:30', endTime: '14:00' },
    { courseId: 6, teacherId: 5, groupId: 6, room: '504', building: 'Главный', dayOfWeek: 5, lessonNumber: 4, lessonType: 'lecture', startTime: '14:15', endTime: '15:45' },
  ];

  for (const item of scheduleItems) {
    await Schedule.findOrCreate({
      where: {
        courseId: item.courseId,
        teacherId: item.teacherId,
        groupId: item.groupId,
        dayOfWeek: item.dayOfWeek,
        lessonNumber: item.lessonNumber,
      },
      defaults: { ...item, isActive: true, startDate: '2026-02-01', endDate: '2026-05-31' },
    });
  }
  logger.info('✓ Расписание создано');
};

/**
 * Сидер контента лендинга абитуриента (идемпотентный)
 */
const seedApplicantContent = async () => {
  const { DEFAULT_CONTENT, ensureContent } = require('../controllers/applicantContentController');
  const [content, created] = await ApplicantContent.findOrCreate({
    where: { id: 1 },
    defaults: { id: 1, ...DEFAULT_CONTENT },
  });
  if (created) {
    logger.info('✓ Контент лендинга абитуриента создан');
  } else {
    logger.info('  Контент лендинга абитуриента уже существует');
  }
  return content;
};

/**
 * Главная функция сидирования
 */
const seedDatabase = async () => {
  try {
    if (await isDataSeeded()) {
      logger.info('База данных уже заполнена, пропускаем сидирование');
      return;
    }

    logger.info('Начинаем заполнение базы данных...');

    await seedRoles();
    await seedDepartments();
    await seedGroups();
    await seedUsers();
    await seedCourses();
    await seedNews();
    const categoriesMap = await seedCategories();
    await seedMaterials(categoriesMap);
    await seedSchedule();
    await seedApplicantContent();

    logger.info('✓ База данных успешно заполнена тестовыми данными');
  } catch (error) {
    logger.error('Ошибка при заполнении базы данных:', error);
    throw error;
  }
};

module.exports = { seedDatabase, isDataSeeded, seedCategories, seedApplicantContent, ensureContent };