# ============ Base ============
FROM node:18-alpine AS base
WORKDIR /app

RUN apk add --no-cache composer \
 && npm install -g pnpm

# ============ Stage 1: Dependencies ============
FROM base AS deps

COPY afiliados/package.json afiliados/pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# ============ Stage 2: Build ============
FROM base AS builder

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy shared code (used via @shared/* alias)
COPY shared/ /shared/

# Copy application source
COPY afiliados/ ./

# Build Next.js
RUN pnpm run build

# ============ Stage 3: Production Runtime ============
FROM base AS runner

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /shared /shared

EXPOSE 3000
CMD ["pnpm", "start"]
