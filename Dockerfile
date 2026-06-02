# ===========================================================
# Stage 1: Backend dependencies (production-only)
# ===========================================================
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/ .

# ===========================================================
# Stage 2: Frontend build (Vite)
# ===========================================================
FROM node:18-alpine AS frontend-builder

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# ===========================================================
# Stage 3: Runtime — Node.js (API + static SPA)
# ===========================================================
FROM node:18-alpine

# Системные зависимости (для pg_dump и т.п., опционально)
RUN apk add --no-cache curl

WORKDIR /app/backend

# Копируем backend (production-only deps)
COPY --from=backend-builder /app/backend ./

# Копируем собранный frontend
COPY --from=frontend-builder /app/frontend/dist ./public

# Создаём папки для логов и uploads
RUN mkdir -p logs uploads && chown -R node:node .

USER node

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Healthcheck — проверяем /api/health
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -sf http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "src/app.js"]