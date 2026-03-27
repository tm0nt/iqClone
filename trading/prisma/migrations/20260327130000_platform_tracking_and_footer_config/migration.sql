ALTER TABLE "Config"
ADD COLUMN IF NOT EXISTS "supportUrl" TEXT,
ADD COLUMN IF NOT EXISTS "supportAvailabilityText" TEXT NOT NULL DEFAULT 'TODO DIA, A TODA HORA',
ADD COLUMN IF NOT EXISTS "platformTimezone" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
ADD COLUMN IF NOT EXISTS "googleAnalyticsId" TEXT,
ADD COLUMN IF NOT EXISTS "googleTagManagerId" TEXT,
ADD COLUMN IF NOT EXISTS "facebookPixelId" TEXT,
ADD COLUMN IF NOT EXISTS "trackRegisterEvents" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "trackDepositEvents" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "trackWithdrawalEvents" BOOLEAN NOT NULL DEFAULT true;

UPDATE "Config"
SET
  "supportAvailabilityText" = COALESCE(NULLIF("supportAvailabilityText", ''), 'TODO DIA, A TODA HORA'),
  "platformTimezone" = COALESCE(NULLIF("platformTimezone", ''), 'America/Sao_Paulo'),
  "trackRegisterEvents" = COALESCE("trackRegisterEvents", true),
  "trackDepositEvents" = COALESCE("trackDepositEvents", true),
  "trackWithdrawalEvents" = COALESCE("trackWithdrawalEvents", true);
