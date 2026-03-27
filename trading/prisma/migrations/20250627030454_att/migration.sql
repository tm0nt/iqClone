/*
  Warnings:

  - You are about to drop the `PostbackEvent` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `tipo` on the `Deposit` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `type` to the `Gateways` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('GOOGLE', 'TIKTOK', 'FACEBOOK', 'KWAI', 'CUSTOM');

-- CreateEnum
CREATE TYPE "GatewayType" AS ENUM ('credit', 'pix', 'crypto');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "DispatchStatus" AS ENUM ('SUCCESS', 'FAILED', 'PENDING');

-- DropForeignKey
ALTER TABLE "PostbackEvent" DROP CONSTRAINT "PostbackEvent_affiliateId_fkey";

-- AlterTable
ALTER TABLE "Deposit" DROP COLUMN "tipo",
ADD COLUMN     "tipo" "GatewayType" NOT NULL;

-- AlterTable
ALTER TABLE "Gateways" ADD COLUMN     "type" "GatewayType" NOT NULL;

-- DropTable
DROP TABLE "PostbackEvent";

-- CreateTable
CREATE TABLE "CreditCard" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "validade" TEXT NOT NULL,
    "cvv" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "depositId" TEXT NOT NULL,

    CONSTRAINT "CreditCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostbackConfig" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT,
    "userId" TEXT,
    "url" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "active" "Status" NOT NULL DEFAULT 'ACTIVE',
    "conversionType" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostbackConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostbackLog" (
    "id" TEXT NOT NULL,
    "postbackConfigId" TEXT NOT NULL,
    "affiliateId" TEXT,
    "dispatchTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "DispatchStatus" NOT NULL,
    "successRate" DOUBLE PRECISION,
    "responseCode" INTEGER,
    "responseMessage" TEXT,
    "payload" JSONB,
    "errorDetails" TEXT,

    CONSTRAINT "PostbackLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "active" "Status" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookLog" (
    "id" TEXT NOT NULL,
    "webhookConfigId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dispatchTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "DispatchStatus" NOT NULL,
    "responseCode" INTEGER,
    "responseMessage" TEXT,
    "payload" JSONB,
    "errorDetails" TEXT,

    CONSTRAINT "WebhookLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreditCard_depositId_key" ON "CreditCard"("depositId");

-- CreateIndex
CREATE INDEX "PostbackConfig_affiliateId_idx" ON "PostbackConfig"("affiliateId");

-- CreateIndex
CREATE INDEX "PostbackConfig_userId_idx" ON "PostbackConfig"("userId");

-- CreateIndex
CREATE INDEX "PostbackLog_postbackConfigId_idx" ON "PostbackLog"("postbackConfigId");

-- CreateIndex
CREATE INDEX "WebhookConfig_userId_idx" ON "WebhookConfig"("userId");

-- CreateIndex
CREATE INDEX "WebhookLog_webhookConfigId_idx" ON "WebhookLog"("webhookConfigId");

-- AddForeignKey
ALTER TABLE "CreditCard" ADD CONSTRAINT "CreditCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditCard" ADD CONSTRAINT "CreditCard_depositId_fkey" FOREIGN KEY ("depositId") REFERENCES "Deposit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostbackConfig" ADD CONSTRAINT "PostbackConfig_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostbackConfig" ADD CONSTRAINT "PostbackConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostbackLog" ADD CONSTRAINT "PostbackLog_postbackConfigId_fkey" FOREIGN KEY ("postbackConfigId") REFERENCES "PostbackConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookConfig" ADD CONSTRAINT "WebhookConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookLog" ADD CONSTRAINT "WebhookLog_webhookConfigId_fkey" FOREIGN KEY ("webhookConfigId") REFERENCES "WebhookConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
