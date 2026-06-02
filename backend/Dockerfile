FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p logs uploads && chown -R node:node .

USER node

EXPOSE 5001

CMD ["node", "src/app.js"]