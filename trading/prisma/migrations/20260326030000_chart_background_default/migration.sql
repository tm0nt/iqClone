ALTER TABLE "Config"
ALTER COLUMN "chartBackgroundUrl" SET DEFAULT '/world-map.png';

UPDATE "Config"
SET "chartBackgroundUrl" = '/world-map.png'
WHERE "chartBackgroundUrl" IS NULL OR BTRIM("chartBackgroundUrl") = '';
