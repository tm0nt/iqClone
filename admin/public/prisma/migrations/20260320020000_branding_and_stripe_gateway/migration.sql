ALTER TABLE "Gateways"
ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'custom',
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Deposit"
ADD COLUMN "gatewayId" INTEGER;

ALTER TABLE "Withdrawal"
ADD COLUMN "gatewayId" INTEGER;

ALTER TABLE "Config"
ADD COLUMN "primaryColor" TEXT NOT NULL DEFAULT '#1ca06d',
ADD COLUMN "primaryHoverColor" TEXT NOT NULL DEFAULT '#0b7250',
ADD COLUMN "primaryGradientFrom" TEXT NOT NULL DEFAULT '#0b7250',
ADD COLUMN "primaryGradientVia" TEXT NOT NULL DEFAULT '#1ca06d',
ADD COLUMN "primaryGradientTo" TEXT NOT NULL DEFAULT '#3cd385',
ADD COLUMN "buttonTextColor" TEXT NOT NULL DEFAULT '#ffffff',
ADD COLUMN "backgroundColor" TEXT NOT NULL DEFAULT '#252b3b',
ADD COLUMN "surfaceColor" TEXT NOT NULL DEFAULT '#364152',
ADD COLUMN "surfaceAltColor" TEXT NOT NULL DEFAULT '#2a3441',
ADD COLUMN "cardColor" TEXT NOT NULL DEFAULT '#1e293b',
ADD COLUMN "borderColor" TEXT NOT NULL DEFAULT '#2a3441',
ADD COLUMN "headerGradientFrom" TEXT NOT NULL DEFAULT '#1a1d29',
ADD COLUMN "headerGradientTo" TEXT NOT NULL DEFAULT '#252b3b',
ADD COLUMN "headerTextColor" TEXT NOT NULL DEFAULT '#ffffff',
ADD COLUMN "mutedTextColor" TEXT NOT NULL DEFAULT '#a1a8b3',
ADD COLUMN "authBackgroundColor" TEXT NOT NULL DEFAULT '#ffffff',
ADD COLUMN "loadingBackgroundColor" TEXT NOT NULL DEFAULT '#ffffff',
ADD COLUMN "loadingTrackColor" TEXT NOT NULL DEFAULT '#d1d5db',
ADD COLUMN "loadingGradientFrom" TEXT NOT NULL DEFAULT '#0b7250',
ADD COLUMN "loadingGradientVia" TEXT NOT NULL DEFAULT '#1ca06d',
ADD COLUMN "loadingGradientTo" TEXT NOT NULL DEFAULT '#3cd385',
ADD COLUMN "successColor" TEXT NOT NULL DEFAULT '#16a34a',
ADD COLUMN "dangerColor" TEXT NOT NULL DEFAULT '#dc2626',
ADD COLUMN "depositGatewayMode" TEXT NOT NULL DEFAULT 'manual',
ADD COLUMN "withdrawGatewayMode" TEXT NOT NULL DEFAULT 'manual',
ADD COLUMN "lastPixDepositGatewayId" INTEGER,
ADD COLUMN "lastPixWithdrawalGatewayId" INTEGER,
ADD COLUMN "lastCreditDepositGatewayId" INTEGER,
ADD COLUMN "lastCryptoDepositGatewayId" INTEGER,
ADD COLUMN "lastCryptoWithdrawalGatewayId" INTEGER;

ALTER TABLE "Deposit"
ADD CONSTRAINT "Deposit_gatewayId_fkey"
FOREIGN KEY ("gatewayId") REFERENCES "Gateways"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "Withdrawal"
ADD CONSTRAINT "Withdrawal_gatewayId_fkey"
FOREIGN KEY ("gatewayId") REFERENCES "Gateways"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

UPDATE "Config"
SET
  "gatewayPixDepositoId" = NULL,
  "gatewayPixSaqueId" = NULL,
  "creditCardDepositId" = NULL,
  "cryptoDepositId" = NULL,
  "cryptoSaqueId" = NULL;

DELETE FROM "Gateways";

WITH stripe_pix AS (
  INSERT INTO "Gateways" (
    "name",
    "provider",
    "endpoint",
    "tokenPublico",
    "tokenPrivado",
    "split",
    "splitValue",
    "type",
    "isActive",
    "sortOrder"
  )
  VALUES (
    'Stripe Transfer',
    'stripe',
    'https://api.stripe.com/v1/',
    '',
    '',
    NULL,
    NULL,
    'pix',
    true,
    1
  )
  RETURNING "id"
),
stripe_credit AS (
  INSERT INTO "Gateways" (
    "name",
    "provider",
    "endpoint",
    "tokenPublico",
    "tokenPrivado",
    "split",
    "splitValue",
    "type",
    "isActive",
    "sortOrder"
  )
  VALUES (
    'Stripe Card',
    'stripe',
    'https://api.stripe.com/v1/',
    '',
    '',
    NULL,
    NULL,
    'credit',
    true,
    2
  )
  RETURNING "id"
),
stripe_crypto AS (
  INSERT INTO "Gateways" (
    "name",
    "provider",
    "endpoint",
    "tokenPublico",
    "tokenPrivado",
    "split",
    "splitValue",
    "type",
    "isActive",
    "sortOrder"
  )
  VALUES (
    'Stripe Crypto Preview',
    'stripe',
    'https://api.stripe.com/v1/',
    '',
    '',
    NULL,
    NULL,
    'crypto',
    true,
    3
  )
  RETURNING "id"
)
UPDATE "Config"
SET
  "gatewayPixDepositoId" = (SELECT "id" FROM stripe_pix),
  "gatewayPixSaqueId" = (SELECT "id" FROM stripe_pix),
  "creditCardDepositId" = (SELECT "id" FROM stripe_credit),
  "cryptoDepositId" = (SELECT "id" FROM stripe_crypto),
  "cryptoSaqueId" = (SELECT "id" FROM stripe_crypto),
  "depositGatewayMode" = 'manual',
  "withdrawGatewayMode" = 'manual';
