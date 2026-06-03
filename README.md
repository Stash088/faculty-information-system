# Faculty Information System

Информационная система Института точных наук и цифровых технологий (дипломный проект).

## Доступ

- **Production:** https://faculty-agu.ru
- **По IP:** https://faculty-agu.ru (резервный)

**Логины:**
- `admin@faculty.ru` / `Admin123!` (администратор)
- `ivanov@faculty.ru` / `Teacher123!` (преподаватель)
- `petrov@student.ru` / `Student123!` (студент)

## Архитектура

Единый Node.js-сервер, отдаёт и API, и SPA-фронтенд:

```
Один Docker-контейнер
└── Node.js (Express) + Tini
    ├── /api/*      → REST API (Sequelize + PostgreSQL)
    ├── /uploads/*  → загруженные файлы (volume)
    ├── /assets/*   → собранный frontend (JS, CSS, images)
    └── /*          → SPA fallback → index.html

Внешние сервисы:
├── TimeWeb Managed PostgreSQL — данные (DB_HOST=04cf0e8e85f31549a679c3eb.twc1.net)
└── Caddy (reverse proxy) — SSL через Let's Encrypt
```

## Структура проекта

```
├── backend/              # Node.js + Express + Sequelize
│   ├── src/
│   │   ├── app.js        # Express + SPA fallback
│   │   ├── config/       # конфигурация (database, app, auth)
│   │   ├── controllers/  # auth, user, content, stats
│   │   ├── middleware/   # auth, role, error handler, upload (multer)
│   │   ├── models/       # Sequelize модели (9 сущностей)
│   │   ├── routes/       # Express роутеры
│   │   ├── seeders/      # сидеры (8 пользователей, расписание, курсы)
│   │   ├── services/     # emailService (nodemailer), tokenService
│   │   └── utils/        # logger
│   ├── .env.example
│   └── package.json
├── frontend/             # React + Vite + MUI
│   ├── src/
│   │   ├── api/          # Axios instance
│   │   ├── components/   # Layout, PrivateRoute, PublicRoute
│   │   ├── pages/        # HomePage, LoginPage, AdminPage, MyMaterialsPage...
│   │   ├── redux/        # authSlice
│   │   └── styles/
│   ├── .env.production  # VITE_API_URL=/api
│   └── package.json
├── Dockerfile             # multi-stage: backend deps + frontend build → runtime
├── docker-compose.yml     # для VPS деплоя (один сервис)
├── Caddyfile              # шаблон reverse proxy с Let's Encrypt
├── .env.example          # шаблон переменных окружения
└── README.md
```

## Деплой на VPS

### 1. Установка Docker

```bash
ssh root@ваш_VPS_IP
curl -fsSL https://get.docker.com | sh
apt-get install -y git
```

### 2. Клонирование и настройка

```bash
cd /root
git clone https://github.com/Stash088/faculty-information-system.git
cd faculty-information-system
cp .env.example .env
nano .env  # заполни реальные значения
```

### 3. Запуск

```bash
docker compose up -d --build
```

### 4. Настройка Caddy (reverse proxy + SSL)

```bash
apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/deb/debian/dists/any-version/main/binary-amd64/Packages' 2>/dev/null | head -1 > /dev/null
echo 'deb [signed-by=/usr/share/keyrings/caddy-stable-archive-keyring.gpg] https://dl.cloudsmith.io/public/caddy/stable/deb/debian any-version main' | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update -qq
apt-get install -y caddy
```

Создай `/etc/caddy/Caddyfile`:
```
{
    admin off
}

faculty-agu.ru, www.faculty-agu.ru {
    reverse_proxy localhost:3000 {
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-Proto https
    }
}
```

```bash
systemctl enable caddy
systemctl restart caddy
```

### 5. Настройка DNS

В панели регистратора домена добавь **A-запись**:
- **Имя/Хост:** `@` (корень)
- **Значение:** `<ваш_VPS_IP>`
- **TTL:** 300

Caddy **автоматически** получит Let's Encrypt сертификат после пропагации DNS (5-30 минут).

### 6. Firewall

```bash
iptables -I INPUT 1 -p tcp --dport 80 -j ACCEPT
iptables -I INPUT 1 -p tcp --dport 443 -j ACCEPT
iptables -I FORWARD 1 -p tcp --dport 80 -j ACCEPT
iptables -I FORWARD 1 -p tcp --dport 443 -j ACCEPT
iptables-save > /etc/iptables.rules
```

## Переменные окружения (для production)

| Переменная | Пример | Описание |
|------------|--------|----------|
| `NODE_ENV` | `production` | |
| `PORT` | `3000` | Порт приложения в контейнере |
| `DB_HOST` | `04cf0e8e85f31549a679c3eb.twc1.net` | Managed PostgreSQL |
| `DB_PORT` | `5432` | |
| `DB_NAME` | `default_db` | |
| `DB_USER` | `gen_user` | |
| `DB_PASSWORD` | `<свой>` | |
| `JWT_ACCESS_SECRET` | `<64 hex>` | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_REFRESH_SECRET` | `<64 hex>` | Тоже сгенерируй новый |
| `JWT_ACCESS_EXPIRES` | `15m` | |
| `JWT_REFRESH_EXPIRES` | `30d` | |
| `CLIENT_URL` | `https://faculty-agu.ru` | Для CORS |
| `MAX_FILE_SIZE` | `10485760` | 10MB |
| `UPLOAD_PATH` | `./uploads` | |

## API Endpoints

### Аутентификация
- `POST /api/auth/register` — регистрация (только student)
- `POST /api/auth/login` — вход
- `POST /api/auth/logout` — выход
- `POST /api/auth/refresh` — обновление токенов
- `GET /api/auth/me` — текущий пользователь
- `POST /api/auth/change-password` — смена пароля
- `POST /api/auth/forgot-password` — восстановление (отправка email)
- `POST /api/auth/reset-password` — сброс по токену

### Контент (публичные)
- `GET /api/news` — новости (фильтр `?published=true`)
- `GET /api/courses` — курсы (фильтр `?departmentId=`)
- `GET /api/materials` — материалы (фильтр `?courseId=`, `?type=`, `?search=`)
- `GET /api/materials/:id/download` — скачивание файла
- `GET /api/materials/:id/view` — просмотр (inline)
- `GET /api/schedule` — расписание (фильтр `?groupId=`, `?dayOfWeek=`)
- `GET /api/schedule/ical?groupId=N` — экспорт в iCal (.ics)
- `GET /api/departments` — кафедры
- `GET /api/groups` — группы
- `GET /api/teachers` — преподаватели

### Контент (только admin)
- CRUD `/api/news`, `/api/courses`, `/api/schedule`
- CRUD `/api/departments`, `/api/groups`
- `DELETE /api/materials/:id`

### Пользователи
- `GET /api/users` — все пользователи (admin)
- CRUD `/api/users` (admin)
- `PATCH /api/users/:id/toggle-block` — блокировка (admin)
- `GET /api/users/roles` — список ролей
- `PUT /api/users/profile` — свой профиль

### Статистика
- `GET /api/stats` — счётчики (admin)

## Полезные команды

```bash
# Логи приложения
docker logs faculty_app -f

# Логи Caddy
journalctl -u caddy -f

# Перезапуск
cd /root/faculty-information-system && docker compose restart
systemctl restart caddy

# Обновить из GitHub
cd /root/faculty-information-system && git pull && docker compose up -d --build

# Бэкап uploads
docker run --rm -v $(docker volume ls -q | grep app_uploads):/data -v $(pwd):/backup \
  alpine tar czf /backup/uploads-$(date +%Y%m%d).tar.gz /data
```

## Роли

| Код | Доступ |
|-----|--------|
| `admin` | Полный доступ |
| `methodist` | Управление курсами, всеми материалами |
| `teacher` | Свои материалы, просмотр |
| `student` | Просмотр |
| `applicant` | Просмотр |