# Faculty Information System

Информационная система Института точных наук и цифровых технологий (дипломный проект).

## Архитектура

Единый Node.js-сервер, отдаёт и API, и SPA-фронтенд:

```
Один Docker-контейнер
└── Node.js (Express)
    ├── /api/*     → REST API (Sequelize + PostgreSQL)
    ├── /uploads/* → статика загруженных файлов
    ├── /assets/*  → собранный frontend (JS, CSS, images)
    └── /*         → SPA fallback → index.html

Внешние сервисы:
└── TimeWeb Managed PostgreSQL — данные
```

## Структура проекта

```
├── backend/              # Node.js + Express + Sequelize
│   ├── src/
│   │   ├── app.js        # Express + SPA fallback
│   │   ├── config/       # конфигурация (DB, auth, app)
│   │   ├── controllers/  # auth, user, content, stats
│   │   ├── middleware/   # auth, role, error handler
│   │   ├── models/       # Sequelize модели
│   │   ├── routes/       # Express роутеры
│   │   ├── seeders/      # сидеры (8 пользователей, расписание, курсы…)
│   │   └── utils/        # logger
│   ├── .env.example
│   └── package.json
├── frontend/             # React + Vite + MUI
│   ├── src/              # исходники
│   └── package.json
├── Dockerfile             # multi-stage: backend deps + frontend build → runtime
├── docker-compose.yml     # один сервис (app)
├── .dockerignore
├── .env.example          # шаблон env для локального запуска
├── .env.production       # ТОЛЬКО VITE_API_URL (для билда)
└── README.md
```

## Локальный запуск (docker-compose)

1. Скопируй `.env.example` в `.env` и заполни:
   ```bash
   cp .env.example .env
   ```
2. Подними:
   ```bash
   docker compose up --build
   ```
3. Открой:
   - **App**: http://localhost:3000

**Тестовые аккаунты (создаются автоматически):**
- `admin@faculty.ru` / `Admin123!` — администратор
- `ivanov@faculty.ru` / `Teacher123!` — преподаватель
- `petrov@student.ru` / `Student123!` — студент

## Деплой на TimeWeb App Platform

### Подготовка

1. **Managed PostgreSQL** в TimeWeb Cloud → создать, скопировать хост/порт/логин/пароль/имя_бд
2. **Сгенерировать JWT секреты:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

### Создание приложения

1. App Platform → **Создать приложение** → подключить репозиторий
2. Framework: **Node.js**, корень: `.` (корень репо)
3. Команда сборки: оставить пустой (Dockerfile всё делает)
4. Порт: `3000`

### Переменные окружения (в интерфейсе App Platform)

| Переменная | Пример | Описание |
|------------|--------|----------|
| `NODE_ENV` | `production` | |
| `PORT` | `3000` | TimeWeb проксирует домен на этот порт |
| `DB_HOST` | `04cf0e8e85f31549a679c3eb.twc1.net` | из Managed PostgreSQL |
| `DB_PORT` | `5432` | |
| `DB_NAME` | `default_db` | |
| `DB_USER` | `gen_user` | |
| `DB_PASSWORD` | `...` | |
| `JWT_ACCESS_SECRET` | `<64 hex>` | новый, не из репо |
| `JWT_REFRESH_SECRET` | `<64 hex>` | новый, не из репо |
| `JWT_ACCESS_EXPIRES` | `15m` | опционально |
| `JWT_REFRESH_EXPIRES` | `30d` | опционально |
| `CLIENT_URL` | `*` | `*` для всех origins (или конкретный домен) |

**Build args (если поддерживается):**
| Аргумент | Значение |
|----------|----------|
| `VITE_API_URL` | `/api` |

### Что делает App Platform автоматически

- Подтягивает код из GitLab
- Собирает образ по `Dockerfile` (3 стадии: backend deps, frontend build, runtime)
- Запускает контейнер с Node.js на PORT=3000
- Настраивает **Nginx** перед приложением (проксирует домен → 3000)
- Выпускает **SSL-сертификат Let's Encrypt**
- Подключает технический домен `*.tw1.ru`

### Деплой

- Push в `main` → автодеплой (если включён)
- Или кнопка **Redeploy** в интерфейсе
- Логи и health-check доступны в панели

## API Endpoints

### Аутентификация (публичные)
- `POST /api/auth/register` — регистрация (только role=student)
- `POST /api/auth/login` — вход
- `POST /api/auth/refresh` — обновление токенов

### Аутентификация (приватные)
- `GET  /api/auth/me` — текущий пользователь
- `POST /api/auth/logout` — выход
- `POST /api/auth/change-password` — смена пароля

### Контент (публичные)
- `GET /api/news?published=true` — новости
- `GET /api/courses` — курсы
- `GET /api/materials` — материалы
- `GET /api/schedule` — расписание
- `GET /api/departments` — кафедры
- `GET /api/groups` — группы
- `GET /api/teachers` — преподаватели

### Контент (только admin)
- `POST/PUT/DELETE /api/news` — управление новостями
- `POST/PUT/DELETE /api/courses` — управление курсами
- `DELETE /api/materials/:id` — удаление материалов
- `POST/PUT/DELETE /api/schedule` — управление расписанием

### Пользователи
- `GET /api/users` — все пользователи (admin)
- `POST /api/users` — создать пользователя (admin)
- `PUT /api/users/:id` — обновить (admin)
- `DELETE /api/users/:id` — удалить (admin)
- `PATCH /api/users/:id/toggle-block` — заблокировать (admin)
- `GET /api/users/roles` — список ролей
- `PUT /api/users/profile` — обновить свой профиль

### Статистика
- `GET /api/stats` — счётчики (admin)

### Health
- `GET /api/health` — `{"status":"ok",...}`

## Роли

| Код | Доступ |
|-----|--------|
| `admin` | Полный доступ ко всему |
| `teacher` | Управление материалами и расписанием |
| `methodist` | Управление учебными программами |
| `student` | Просмотр материалов и расписания |
| `applicant` | Просмотр информации об институте |
