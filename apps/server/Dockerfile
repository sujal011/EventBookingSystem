# Multi-stage build for optimized server image
FROM oven/bun:1.2.19-alpine AS BUILDER
WORKDIR /app

# Install dependencies

COPY package.json  ./
RUN bun i

# Build the app
COPY . ./
RUN bun run build

#  Final stage

FROM oven/bun:1.2.19-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

ENTRYPOINT ["bun","start"]
EXPOSE 3000
