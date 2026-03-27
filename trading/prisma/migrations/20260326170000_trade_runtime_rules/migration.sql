ALTER TABLE "Config"
ADD COLUMN IF NOT EXISTS "tradingMinPriceVariation" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "tradingSettlementTolerance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "tradingDefaultExpiryMinutes" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN IF NOT EXISTS "tradingExpiryOptions" TEXT NOT NULL DEFAULT '1,5,10,15,30,60,1440',
ADD COLUMN IF NOT EXISTS "tradingSettlementGraceSeconds" INTEGER NOT NULL DEFAULT 2;

ALTER TABLE "TradeOperation"
ADD COLUMN IF NOT EXISTS "resolvedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "durationSeconds" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "payoutRateSnapshot" DOUBLE PRECISION NOT NULL DEFAULT 0.9,
ADD COLUMN IF NOT EXISTS "minPriceVariation" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "settlementTolerance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "settlementGraceSeconds" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "providerSlug" TEXT,
ADD COLUMN IF NOT EXISTS "marketSymbol" TEXT;

CREATE INDEX IF NOT EXISTS "TradeOperation_userId_resolvedAt_idx"
ON "TradeOperation"("userId", "resolvedAt");

UPDATE "TradeOperation" op
SET
  "durationSeconds" = CASE
    WHEN op."tempo" ~ '^[0-9]+m$' THEN regexp_replace(op."tempo", 'm$', '')::INTEGER * 60
    WHEN op."tempo" ~ '^[0-9]+h$' THEN regexp_replace(op."tempo", 'h$', '')::INTEGER * 3600
    WHEN op."tempo" ~ '^[0-9]+d$' THEN regexp_replace(op."tempo", 'd$', '')::INTEGER * 86400
    ELSE 300
  END,
  "payoutRateSnapshot" = COALESCE(
    (
      SELECT pair."payoutRate"
      FROM "TradingPair" pair
      WHERE pair."id" = op."pairId"
      LIMIT 1
    ),
    op."payoutRateSnapshot",
    0.9
  ),
  "providerSlug" = COALESCE(
    (
      SELECT COALESCE(provider."slug", pair."priceSource")
      FROM "TradingPair" pair
      LEFT JOIN "MarketDataProvider" provider
        ON provider."id" = pair."providerId"
      WHERE pair."id" = op."pairId"
      LIMIT 1
    ),
    op."providerSlug",
    'itick'
  ),
  "marketSymbol" = COALESCE(
    (
      SELECT COALESCE(pair."priceSymbol", pair."symbol")
      FROM "TradingPair" pair
      WHERE pair."id" = op."pairId"
      LIMIT 1
    ),
    op."marketSymbol",
    op."ativo"
  ),
  "minPriceVariation" = COALESCE(
    (
      SELECT cfg."tradingMinPriceVariation"
      FROM "Config" cfg
      ORDER BY cfg."id" ASC
      LIMIT 1
    ),
    op."minPriceVariation",
    0
  ),
  "settlementTolerance" = COALESCE(
    (
      SELECT cfg."tradingSettlementTolerance"
      FROM "Config" cfg
      ORDER BY cfg."id" ASC
      LIMIT 1
    ),
    op."settlementTolerance",
    0
  ),
  "settlementGraceSeconds" = COALESCE(
    (
      SELECT cfg."tradingSettlementGraceSeconds"
      FROM "Config" cfg
      ORDER BY cfg."id" ASC
      LIMIT 1
    ),
    op."settlementGraceSeconds",
    2
  );
