-- CreateEnum
CREATE TYPE "PromotionType" AS ENUM ('deposit_bonus', 'revenue_multiplier');

-- CreateEnum
CREATE TYPE "PromotionRedemptionStatus" AS ENUM ('active', 'consumed', 'expired', 'cancelled');

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "rulesText" TEXT,
    "type" "PromotionType" NOT NULL,
    "bonusPercent" DOUBLE PRECISION,
    "bonusFixedAmount" DOUBLE PRECISION,
    "maxBonusAmount" DOUBLE PRECISION,
    "revenueMultiplier" DOUBLE PRECISION,
    "minDepositAmount" DOUBLE PRECISION,
    "maxClaimsTotal" INTEGER,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionRedemption" (
    "id" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "PromotionRedemptionStatus" NOT NULL DEFAULT 'active',
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consumedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "appliedReference" TEXT,
    "rewardValue" DOUBLE PRECISION,

    CONSTRAINT "PromotionRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_slug_key" ON "Promotion"("slug");

-- CreateIndex
CREATE INDEX "Promotion_type_isActive_validUntil_idx" ON "Promotion"("type", "isActive", "validUntil");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionRedemption_promotionId_userId_key" ON "PromotionRedemption"("promotionId", "userId");

-- CreateIndex
CREATE INDEX "PromotionRedemption_userId_status_expiresAt_idx" ON "PromotionRedemption"("userId", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "PromotionRedemption_promotionId_status_idx" ON "PromotionRedemption"("promotionId", "status");

-- AddForeignKey
ALTER TABLE "PromotionRedemption"
ADD CONSTRAINT "PromotionRedemption_promotionId_fkey"
FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionRedemption"
ADD CONSTRAINT "PromotionRedemption_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
