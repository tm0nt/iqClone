# ============ Stage 1: Dependencies ============
FROM node:18-alpine AS deps
WORKDIR /app

RUN npm install -g pnpm

COPY admin/package.json admin/pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# ============ Stage 2: Build ============
FROM node:18-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy shared code (used via @shared/* alias)
COPY shared/ /shared/

# Copy application source
COPY admin/ ./

# Build Next.js
RUN pnpm run build

# ============ Stage 3: Production Runtime ============
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN npm install -g pnpm

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /shared /shared

EXPOSE 1313
CMD ["pnpm", "start"]
