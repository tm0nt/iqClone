-- Add 5s and 30s sub-minute expiry options to existing Config rows
UPDATE "Config"
SET "tradingExpiryOptions" = '5s,30s,' || "tradingExpiryOptions"
WHERE "tradingExpiryOptions" NOT LIKE '%5s%';
