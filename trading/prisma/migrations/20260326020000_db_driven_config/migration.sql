-- AlterTable: TradingPair — add price source routing fields
ALTER TABLE "TradingPair"
  ADD COLUMN "priceSource"   TEXT    NOT NULL DEFAULT 'itick',
  ADD COLUMN "priceSymbol"   TEXT,
  ADD COLUMN "minTradeValue" DOUBLE PRECISION NOT NULL DEFAULT 1,
  ADD COLUMN "maxTradeValue" DOUBLE PRECISION;

-- Populate priceSource for existing crypto pairs (any symbol ending in USDT/BUSD/BTC/ETH/BNB)
UPDATE "TradingPair"
SET "priceSource" = 'binance'
WHERE "symbol" ~ '(USDT|BUSD|BTC|ETH|BNB)$';

-- CreateIndex
CREATE INDEX "TradingPair_priceSource_idx" ON "TradingPair"("priceSource");

-- CreateTable: SystemSettings
CREATE TABLE "SystemSettings" (
    "id"          SERIAL       NOT NULL,
    "key"         TEXT         NOT NULL,
    "value"       TEXT         NOT NULL,
    "type"        TEXT         NOT NULL DEFAULT 'string',
    "category"    TEXT         NOT NULL DEFAULT 'general',
    "description" TEXT,
    "updatedAt"   TIMESTAMP(3) NOT NULL,
    "updatedBy"   TEXT,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SystemSettings_key_key" ON "SystemSettings"("key");
CREATE INDEX "SystemSettings_category_idx" ON "SystemSettings"("category");

-- Seed default values
INSERT INTO "SystemSettings" ("key", "value", "type", "category", "description", "updatedAt") VALUES
  ('trading.default_payout_rate',   '0.9',   'float',  'trading',    'Taxa de payout padrão quando o par não define a própria', NOW()),
  ('trading.default_expiry_minutes','5',      'int',    'trading',    'Tempo de expiração padrão em minutos se o campo tempo for inválido', NOW());

-- CreateTable: WorkerConfig
CREATE TABLE "WorkerConfig" (
    "id"            SERIAL       NOT NULL,
    "workerName"    TEXT         NOT NULL,
    "isEnabled"     BOOLEAN      NOT NULL DEFAULT true,
    "batchSize"     INTEGER      NOT NULL DEFAULT 50,
    "maxAttempts"   INTEGER      NOT NULL DEFAULT 3,
    "timeoutMs"     INTEGER      NOT NULL DEFAULT 5000,
    "retryDelayMs"  INTEGER      NOT NULL DEFAULT 60000,
    "updatedAt"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkerConfig_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WorkerConfig_workerName_key" ON "WorkerConfig"("workerName");

-- Seed settlement worker
INSERT INTO "WorkerConfig" ("workerName", "isEnabled", "batchSize", "maxAttempts", "timeoutMs", "retryDelayMs", "updatedAt")
VALUES ('settlement', true, 50, 3, 5000, 60000, NOW());
