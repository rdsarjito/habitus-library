# ── Stage 1: Build ──
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files first (layer caching)
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for build)
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY tsconfig.json ./
COPY src ./src/

# Compile TypeScript
RUN npm run build

# Prune dev dependencies after build
RUN npm prune --omit=dev

# ── Stage 2: Production ──
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy production node_modules from builder (no reinstall needed)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY prisma ./prisma/

# Re-generate Prisma Client for this platform
RUN npx prisma generate

# Copy compiled code from builder
COPY --from=builder /app/dist ./dist/

# Copy entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 3001

CMD ["node", "dist/server.js"]
