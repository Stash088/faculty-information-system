# Faculty Information System

Система управления учебным процессом (дипломный проект).

## Структура проекта

```
├── backend/              # Node.js + Express + PostgreSQL
│   ├── src/
│   │   ├── app.js       # Главный файл приложения
│   │   ├── config/      # Конфигурация (database, app, auth)
│   │   ├── controllers/ # Контроллеры (auth, user, content, stats)
│   │   ├── middleware/  # Middleware (auth, role, error handling)
│   │   ├── models/      # Sequelize модели
│   │   ├── routes/      # Express роутеры
│   │   ├── seeders/     # Сидеры для заполнения БД
│   │   ├── services/    # Сервисы (tokenService)
│   │   └── utils/       # Утилиты (logger)
│   ├── .env.example     # Пример переменных окружения
│   └── Dockerfile
├── frontend/            # React + Vite + MUI
│   ├── src/
│   │   ├── api/         # Axios instance
│   │   ├── components/  # Компоненты (Layout, PrivateRoute, PublicRoute)
│   │   ├── pages/       # Страницы
│   │   ├── redux/       # Redux slices
│   │   └── styles/      # Глобальные стили
│   ├── .env.production  # Переменные для production
│   ├── nginx.conf       # Конфигурация Nginx
│   └── Dockerfile
├── docker-compose.yml   # Локальная разработка
├── .dockerignore
└── README.md
```

## Запуск локально

### 1. Backend + PostgreSQL

```bash
# Поднять PostgreSQL
docker-compose up -d db

# Установить зависимости
cd backend && npm install

# Запустить
npm run dev
```

### 2. Frontend (dev)

```bash
cd frontend && npm install
npm run dev
```

### 3. Docker (всё вместе)

```bash
docker compose up --build
```

- Frontend: http://localhost:3080
- Backend API: http://localhost:5001/api
- PostgreSQL: localhost:5433

**Тестовые аккаунты:**
- admin@faculty.ru / Admin123! (администратор)
- ivanov@faculty.ru / Teacher123! (преподаватель)
- petrov@student.ru / Student123! (студент)

## Деплой на TimeWeb Cloud

### 1. Создать Managed PostgreSQL

В панели TimeWeb Cloud создайте Managed Database PostgreSQL.

### 2. Backend (App Platform)

1. Подключите репозиторий к TimeWeb Cloud App Platform
2. Укажите корень проекта: `backend/`
3. Тип: **Docker**
4. Переменные окружения:
   ```
   NODE_ENV=production
   PORT=5001
   DB_HOST=<хост из Managed PostgreSQL>
   DB_PORT=5432
   DB_NAME=faculty_db
   DB_USER=<пользователь>
   DB_PASSWORD=<пароль>
   JWT_ACCESS_SECRET=<случайная строка 32+ символов>
   JWT_REFRESH_SECRET=<случайная строка 32+ символов>
   CLIENT_URL=<домен вашего фронтенда>
   ```

### 3. Frontend (App Platform)

1. Подключите репозиторий к TimeWeb Cloud App Platform
2. Укажите корень проекта: `frontend/`
3. Тип: **Статика**
4. Команда сборки: `npm run build`
5. Публичная директория: `dist`
6. Build аргументы:
   ```
   VITE_API_URL=/api
   ```

### 4. Домен

TimeWeb предоставит технический домен с SSL. Привяжите его к frontend.

## Переменные окружения

### Backend (.env)

```env
NODE_ENV=production
PORT=5001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=faculty_db
DB_USER=postgres
DB_PASSWORD=your_secure_password

JWT_ACCESS_SECRET=your_access_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d

CLIENT_URL=https://your-domain.tw1.ru
```

### Frontend (.env.production)

```env
VITE_API_URL=/api
```

## API Endpoints

### Аутентификация
- `POST /api/auth/register` — Регистрация
- `POST /api/auth/login` — Вход
- `POST /api/auth/logout` — Выход
- `POST /api/auth/refresh` — Обновление токенов
- `GET /api/auth/me` — Текущий пользователь
- `POST /api/auth/change-password` — Смена пароля

### Контент (публичные)
- `GET /api/news` — Новости (пагинация, фильтр по category/published)
- `GET /api/courses` — Курсы
- `GET /api/materials` — Материалы
- `GET /api/schedule` — Расписание
- `GET /api/departments` — Кафедры
- `GET /api/groups` — Группы
- `GET /api/teachers` — Преподаватели

### Контент (только админ)
- `POST /api/news` — Создать новость
- `PUT /api/news/:id` — Обновить
- `DELETE /api/news/:id` — Удалить
- `POST /api/courses` — Создать курс
- `PUT /api/courses/:id` — Обновить
- `DELETE /api/courses/:id` — Удалить
- `DELETE /api/materials/:id` — Удалить материал
- `POST /api/schedule` — Создать занятие
- `PUT /api/schedule/:id` — Обновить
- `DELETE /api/schedule/:id` — Удалить

### Пользователи
- `GET /api/users` — Все пользователи (admin)
- `POST /api/users` — Создать пользователя (admin)
- `PUT /api/users/:id` — Обновить (admin)
- `DELETE /api/users/:id` — Удалить (admin)
- `PATCH /api/users/:id/toggle-block` — Заблокировать/разблокировать (admin)
- `GET /api/users/roles` — Список ролей
- `PUT /api/users/profile` — Обновить свой профиль

### Статистика
- `GET /api/stats` — Статистика (admin)

## Роли и права

| Роль | Доступ |
|------|--------|
| admin | Полный доступ |
| teacher | Управление материалами и расписанием |
| methodist | Управление учебными программами |
| student | Просмотр материалов и расписания |
| applicant | Просмотр информации об институте |