-- Fix priceSource default: was "itick" (wrong for crypto pairs), now ""
ALTER TABLE "TradingPair" ALTER COLUMN "priceSource" SET DEFAULT '';

-- Data fix: crypto pairs that ended up with priceSource='itick' due to wrong default
-- should inherit the slug of their linked provider
UPDATE "TradingPair"
SET "priceSource" = mp.slug
FROM "MarketDataProvider" mp
WHERE "TradingPair"."providerId" = mp.id
  AND "TradingPair"."priceSource" = 'itick'
  AND "TradingPair"."type" = 'crypto';
