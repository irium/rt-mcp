FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci --ignore-scripts

COPY frontend/ ./
RUN npm run build

FROM node:20-alpine AS backend-builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts  --legacy-peer-deps

COPY . .
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts --legacy-peer-deps

COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/config ./config
COPY --from=frontend-builder /app/public ./public

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/main"]
