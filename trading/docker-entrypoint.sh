#!/bin/sh
set -e

echo "==> Running Prisma migrations..."
npx prisma migrate deploy

echo "==> Running seed (idempotent)..."
node prisma/seed.js

echo "==> Starting trading app..."
exec pnpm start
