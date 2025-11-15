# Multi-stage build for optimized server image
FROM oven/bun:1.2.19-alpine AS builder
WORKDIR /app

# Copy workspace files for catalog resolution
COPY package.json bun.lock bunfig.toml tsconfig.base.json ./
COPY apps/server/package.json ./apps/server/

# Install all dependencies (needed for workspace)
RUN bun install 

# Copy server source and build
COPY apps/server ./apps/server
COPY tsconfig.json ./
RUN cd apps/server && bun run build

# Final stage
FROM oven/bun:1.2.19-alpine
WORKDIR /app

# Copy only the bundled output (all dependencies are bundled)
COPY --from=builder /app/apps/server/dist ./dist

# Run the bundled server
CMD ["bun", "run", "dist/index.js"]

EXPOSE 3000
