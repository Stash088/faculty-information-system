/**
 * Главный файл приложения
 * @module app
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Импорт компонентов
const { testConnection } = require('./config/database');
const { syncModels } = require('./models');
const { seedDatabase } = require('./seeders');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Импорт маршрутов
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const statsRoutes = require('./routes/stats');
const contentRoutes = require('./routes/content');
const applicantContentRoutes = require('./routes/applicantContent');

// Создание приложения Express
const app = express();

// Helmet с настройками для HTTP и HTTPS
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https:', 'data:'],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      imgSrc: ["'self'", 'data:', 'http:', 'https:'],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'"],
      scriptSrcAttr: ["'none'"],
      styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
      // Отключаем upgrade-insecure-requests — приложение должно работать и по HTTP
      upgradeInsecureRequests: [],
    },
  },
  // Разрешаем загружать ресурсы с любого origin
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  // COOP: same-origin — для изоляции
  crossOriginOpenerPolicy: { policy: 'same-origin' },
}));
app.use(cors({
  origin: process.env.CLIENT_URL 
    ? process.env.CLIENT_URL.split(',').map(url => url.trim())
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:5173'],
  credentials: true,
}));

// Ограничение частоты запросов
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 1000, // максимум 100 запросов с одного IP
  message: { message: 'Слишком много запросов, попробуйте позже' },
});
app.use('/api/', limiter);

// Парсинг тела запроса
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Логирование запросов
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  next();
});

// Статические файлы для загрузок
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api', contentRoutes);
app.use('/api/applicant-content', applicantContentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// =========================================================
// Frontend (SPA) — раздача собранной статики из public/
// =========================================================
const publicPath = path.join(__dirname, '../public');
const fs = require('fs');
if (fs.existsSync(publicPath)) {
  // Статические файлы (JS, CSS, изображения из /assets)
  app.use(express.static(publicPath));

  // SPA fallback — все не-API пути отдают index.html
  app.get(/^\/(?!api|uploads).*/, (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// Обработка 404
app.use(notFoundHandler);

// Централизованная обработка ошибок
app.use(errorHandler);

/**
 * Запуск сервера
 */
const startServer = async () => {
  try {
    // Проверка подключения к БД
    await testConnection();
    
    // Синхронизация моделей с БД
    await syncModels();
    
    // Заполнение базы данных тестовыми данными
    await seedDatabase();

    // Убедимся, что контент лендинга существует (идемпотентно)
    const { ensureContent } = require('./controllers/applicantContentController');
    await ensureContent();
    
    // Запуск сервера
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      logger.info(`Сервер запущен на порту ${PORT}`);
      logger.info(`Режим: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`URL API: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    logger.error('Ошибка запуска сервера:', error);
    process.exit(1);
  }
};

// Обработка необработанных исключений
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Необработанное исключение:', reason);
});

// Обработка сигналов завершения
process.on('SIGTERM', () => {
  logger.info('Получен сигнал SIGTERM, завершение работы...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Получен сигнал SIGINT, завершение работы...');
  process.exit(0);
});

// Запуск приложения
startServer();

module.exports = app;
