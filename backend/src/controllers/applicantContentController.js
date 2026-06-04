/**
 * Контроллер контента лендинга абитуриента
 * @module controllers/applicantContentController
 */

const { ApplicantContent, User } = require('../models');
const logger = require('../utils/logger');

const DEFAULT_CONTENT = {
  heroBadge: 'Приёмная кампания 2026',
  heroTitle: 'Поступай в Институт точных наук',
  heroSubtitle: 'Цифровых технологий АГУ',
  heroDescription:
    'Современное IT-образование с углублённым изучением математики, физики и информационных технологий. Диплом государственного образца, общежитие, стажировки в ведущих IT-компаниях.',
  contactAddress: 'г. Москва, ул. Университетская, д. 1, каб. 215',
  contactPhone: '+7 (495) 123-45-67',
  contactEmail: 'admissions@faculty-agu.ru',
  contactHours: 'Пн–Пт: 9:00–17:00, Сб: 10:00–14:00',
  admissionYear: 2026,
  stats: [
    { value: '95%', label: 'Трудоустройство выпускников' },
    { value: '4.6', label: 'Средний балл ЕГЭ' },
    { value: '60+', label: 'Бюджетных мест' },
    { value: '15', label: 'IT-партнёров' },
  ],
  programs: [
    { code: '09.03.01', name: 'Информатика и вычислительная техника', level: 'Бакалавриат', duration: '4 года', places: 25, exams: ['Математика (профиль)', 'Информатика', 'Русский язык'] },
    { code: '01.03.02', name: 'Прикладная математика и информатика', level: 'Бакалавриат', duration: '4 года', places: 20, exams: ['Математика (профиль)', 'Информатика', 'Русский язык'] },
    { code: '03.03.02', name: 'Физика', level: 'Бакалавриат', duration: '4 года', places: 15, exams: ['Физика', 'Математика (профиль)', 'Русский язык'] },
    { code: '10.03.01', name: 'Информационная безопасность', level: 'Бакалавриат', duration: '4 года', places: 20, exams: ['Математика (профиль)', 'Информатика', 'Русский язык'] },
    { code: '09.04.01', name: 'Информатика и вычислительная техника', level: 'Магистратура', duration: '2 года', places: 10, exams: ['Междисциплинарный экзамен', 'Собеседование'] },
    { code: '01.04.02', name: 'Прикладная математика и информатика', level: 'Магистратура', duration: '2 года', places: 8, exams: ['Междисциплинарный экзамен', 'Собеседование'] },
  ],
  timeline: [
    { label: '20 июня', desc: 'Начало приёма документов' },
    { label: '25 июля', desc: 'Завершение приёма документов (бюджет, очная форма)' },
    { label: '27–30 июля', desc: 'Вступительные испытания' },
    { label: '2 августа', desc: 'Публикация конкурсных списков' },
    { label: '4–6 августа', desc: 'Приоритетное зачисление (льготники, целевики)' },
    { label: '6–8 августа', desc: 'Основной этап зачисления' },
    { label: '1 сентября', desc: 'Начало учебного года' },
  ],
  documents: [
    { name: 'Паспорт гражданина РФ (копия)', required: true },
    { name: 'Аттестат о среднем общем образовании (копия)', required: true },
    { name: 'СНИЛС (копия)', required: true },
    { name: 'Фотографии 3×4 см (4 шт.)', required: true },
    { name: 'Медицинская справка формы 086/у', required: true },
    { name: 'Документы, подтверждающие индивидуальные достижения', required: false },
    { name: 'Договор о целевом обучении (при наличии)', required: false },
    { name: 'Справка об установлении инвалидности (при наличии)', required: false },
  ],
  dormFeatures: [
    { text: 'Комнаты на 2–3 человека' },
    { text: 'Кухня и столовая на этаже' },
    { text: 'Читальный зал и Wi-Fi' },
    { text: 'Спортивный зал' },
  ],
  dormCost: 'от 800 ₽/мес',
  dormAddress: 'ул. Студенческая, д. 5 (5 мин от института)',
  dormDescription:
    'Для всех иногородних студентов очной формы обучения предоставляется место в комфортабельном общежитии. На территории — всё необходимое для учёбы и отдыха.',
  benefits: [
    { title: 'IT-партнёры', text: 'Стажировки и трудоустройство в Яндекс, VK, Сбер, Тинькофф' },
    { title: 'Малые группы', text: 'До 15 человек на семинаре — индивидуальный подход' },
    { title: 'Современная база', text: '4 компьютерных класса, лаборатория робототехники, научный центр' },
    { title: 'Научная работа', text: 'Публикации, гранты РФФИ, участие в конференциях со 2 курса' },
  ],
  faq: [
    { q: 'Какие минимальные баллы ЕГЭ для поступления?', a: 'Математика (профиль) — 39, Информатика — 44, Физика — 39, Русский язык — 40.' },
    { q: 'Есть ли целевые направления?', a: 'Да, мы сотрудничаем с IT-компаниями, образовательными учреждениями и государственными организациями.' },
    { q: 'Предоставляется ли общежитие иногородним?', a: 'Да, всем иногородним студентам-очникам предоставляется место в общежитии.' },
    { q: 'Есть ли военный учёт и отсрочка?', a: 'Институт имеет военный учёт. Студентам очной формы обучения предоставляется отсрочка от армии.' },
    { q: 'Какие индивидуальные достижения дают дополнительные баллы?', a: 'Золотая медаль — 5 баллов, значок ГТО — 1–2 балла, итоговое сочинение — 1 балл, победы в олимпиадах — до 10 баллов.' },
  ],
};

const ensureContent = async () => {
  const [content, created] = await ApplicantContent.findOrCreate({
    where: { id: 1 },
    defaults: { id: 1, ...DEFAULT_CONTENT },
  });
  return { content, created };
};

const getApplicantContent = async (req, res, next) => {
  try {
    const { content } = await ensureContent();
    res.json(content);
  } catch (error) {
    logger.error('Ошибка при получении контента абитуриента:', error);
    next(error);
  }
};

const updateApplicantContent = async (req, res, next) => {
  try {
    const { content } = await ensureContent();
    const allowed = [
      'heroBadge', 'heroTitle', 'heroSubtitle', 'heroDescription',
      'contactAddress', 'contactPhone', 'contactEmail', 'contactHours',
      'admissionYear', 'stats', 'programs', 'timeline', 'documents',
      'dormFeatures', 'dormCost', 'dormAddress', 'dormDescription',
      'benefits', 'faq',
    ];
    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }
    update.lastEditedById = req.user?.id || null;
    await content.update(update);
    logger.info(`Контент абитуриента обновлён пользователем #${req.user?.id}`);
    res.json(content);
  } catch (error) {
    logger.error('Ошибка при обновлении контента абитуриента:', error);
    next(error);
  }
};

module.exports = {
  getApplicantContent,
  updateApplicantContent,
  DEFAULT_CONTENT,
  ensureContent,
};
