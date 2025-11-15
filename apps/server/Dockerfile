# Multi-stage build for optimized server image
FROM oven/bun:1.2.19-alpine AS base
WORKDIR /app

# Install dependencies stage
FROM base AS deps
COPY package.json bun.lock* ./
COPY apps/server/package.json ./apps/server/
RUN bun install --frozen-lockfile --production

# Build stage
FROM base AS builder
COPY package.json bun.lock* ./
COPY apps/server/package.json ./apps/server/
RUN bun install --frozen-lockfile

COPY apps/server ./apps/server
COPY tsconfig.base.json ./
WORKDIR /app/apps/server
RUN bun run build

# Production stage
FROM oven/bun:1.2.19-alpine AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 bunuser

# Copy necessary files
COPY --from=deps --chown=bunuser:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=bunuser:nodejs /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=builder --chown=bunuser:nodejs /app/apps/server/dist ./apps/server/dist
COPY --from=builder --chown=bunuser:nodejs /app/apps/server/package.json ./apps/server/

# Copy database migration files if they exist
COPY --from=builder --chown=bunuser:nodejs /app/apps/server/drizzle ./apps/server/drizzle

WORKDIR /app/apps/server

USER bunuser

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# # Health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD bun run -e "fetch('http://localhost:3000/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

ENTRYPOINT ["bun", "run", "start"]
