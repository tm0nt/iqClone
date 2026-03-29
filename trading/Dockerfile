# ============ Base ============
FROM node:18-alpine AS base
WORKDIR /app

RUN apk add --no-cache composer \
 && npm install -g pnpm

# ============ Stage 1: Dependencies ============
FROM base AS deps

COPY trading/package.json trading/pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# ============ Stage 2: Build ============
FROM base AS builder

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy shared code (used via @shared/* alias)
COPY shared/ /shared/

# Copy application source
COPY trading/ ./

# Generate Prisma Client
RUN pnpm prisma generate

# Build Next.js
RUN pnpm run build

# ============ Stage 3: Production Runtime ============
FROM base AS runner

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /shared /shared

# Entrypoint: migrate → seed → start
COPY trading/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/docker-entrypoint.sh"]
