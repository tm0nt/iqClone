-- CreateEnum
CREATE TYPE "MarketDataProviderAuthType" AS ENUM ('none', 'header', 'query');

-- CreateTable
CREATE TABLE "MarketDataProvider" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TradingPairType" NOT NULL,
    "restBaseUrl" TEXT NOT NULL,
    "wsBaseUrl" TEXT,
    "authType" "MarketDataProviderAuthType" NOT NULL DEFAULT 'none',
    "authHeaderName" TEXT,
    "authQueryParam" TEXT,
    "envKey" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketDataProvider_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "TradingPair" ADD COLUMN "providerId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "MarketDataProvider_slug_key" ON "MarketDataProvider"("slug");
CREATE INDEX "MarketDataProvider_type_isActive_sortOrder_idx" ON "MarketDataProvider"("type", "isActive", "sortOrder");
CREATE INDEX "TradingPair_providerId_isActive_displayOrder_idx" ON "TradingPair"("providerId", "isActive", "displayOrder");

-- Seed providers
INSERT INTO "MarketDataProvider" (
  "slug",
  "name",
  "type",
  "restBaseUrl",
  "wsBaseUrl",
  "authType",
  "authHeaderName",
  "authQueryParam",
  "envKey",
  "isActive",
  "sortOrder",
  "updatedAt"
)
VALUES
  (
    'binance',
    'BINANCE',
    'crypto',
    'https://api.binance.com',
    'wss://stream.binance.com:9443/ws',
    'none',
    NULL,
    NULL,
    NULL,
    true,
    1,
    NOW()
  ),
  (
    'itick',
    'ITICK',
    'forex',
    'https://api.itick.org',
    'wss://api.itick.org/forex',
    'header',
    'token',
    'token',
    'ITICK_API_KEY',
    true,
    2,
    NOW()
  )
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "type" = EXCLUDED."type",
  "restBaseUrl" = EXCLUDED."restBaseUrl",
  "wsBaseUrl" = EXCLUDED."wsBaseUrl",
  "authType" = EXCLUDED."authType",
  "authHeaderName" = EXCLUDED."authHeaderName",
  "authQueryParam" = EXCLUDED."authQueryParam",
  "envKey" = EXCLUDED."envKey",
  "isActive" = EXCLUDED."isActive",
  "sortOrder" = EXCLUDED."sortOrder",
  "updatedAt" = NOW();

-- Backfill pair relation from existing columns
UPDATE "TradingPair" AS tp
SET "providerId" = mdp."id"
FROM "MarketDataProvider" AS mdp
WHERE tp."providerId" IS NULL
  AND (
    LOWER(COALESCE(tp."priceSource", '')) = mdp."slug"
    OR LOWER(COALESCE(tp."provider", '')) = mdp."slug"
  );

UPDATE "TradingPair" AS tp
SET "providerId" = mdp."id"
FROM "MarketDataProvider" AS mdp
WHERE tp."providerId" IS NULL
  AND mdp."type" = tp."type";

UPDATE "TradingPair" AS tp
SET
  "provider" = mdp."name",
  "priceSource" = mdp."slug"
FROM "MarketDataProvider" AS mdp
WHERE tp."providerId" = mdp."id";

-- AddForeignKey
ALTER TABLE "TradingPair"
ADD CONSTRAINT "TradingPair_providerId_fkey"
FOREIGN KEY ("providerId") REFERENCES "MarketDataProvider"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
