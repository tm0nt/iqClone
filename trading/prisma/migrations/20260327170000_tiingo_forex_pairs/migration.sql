DROP INDEX IF EXISTS "TradingPair_symbol_key";

CREATE UNIQUE INDEX IF NOT EXISTS "TradingPair_symbol_providerId_key"
ON "TradingPair"("symbol", "providerId");
