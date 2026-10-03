# Multi-Stage Dockerfile for Coolify & Oracle Cloud
# ------------------------------------------------------------
# Stage 1: Build Vite Frontend
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ------------------------------------------------------------
# Stage 2: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built frontend from Stage 1
COPY --from=builder /app/dist ./dist

# Copy backend server and static assets
COPY server ./server
COPY public ./public

# Ensure database directory exists for local volume mounts
RUN mkdir -p /app/server/data

EXPOSE 5000

# Health check endpoint
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "server/server.js"]
