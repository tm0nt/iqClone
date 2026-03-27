/*
  Warnings:

  - A unique constraint covering the columns `[affiliateId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `nomeSite` on table `Config` required. This step will fail if there are existing NULL values in that column.
  - Made the column `logoUrl` on table `Config` required. This step will fail if there are existing NULL values in that column.
  - Made the column `valorMinimoSaque` on table `Config` required. This step will fail if there are existing NULL values in that column.
  - Made the column `valorMinimoDeposito` on table `Config` required. This step will fail if there are existing NULL values in that column.
  - Made the column `endPointGateway` on table `Config` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tokenPublicoGateway` on table `Config` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tokenPrivadoGateway` on table `Config` required. This step will fail if there are existing NULL values in that column.
  - Made the column `taxa` on table `Config` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `tipo` to the `Withdrawal` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoComissao" AS ENUM ('cpa', 'revShare');

-- CreateEnum
CREATE TYPE "WithdrawalTipo" AS ENUM ('afiliado', 'usuario');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('pendente', 'paga', 'cancelada');

-- AlterTable
ALTER TABLE "Balance" ADD COLUMN     "saldoComissao" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE "Config" ADD COLUMN     "cpaMin" DOUBLE PRECISION NOT NULL DEFAULT 30,
ADD COLUMN     "cpaValor" DOUBLE PRECISION NOT NULL DEFAULT 15,
ADD COLUMN     "revShareFalsoValue" DOUBLE PRECISION NOT NULL DEFAULT 85,
ADD COLUMN     "revShareValue" DOUBLE PRECISION NOT NULL DEFAULT 35,
ALTER COLUMN "nomeSite" SET NOT NULL,
ALTER COLUMN "nomeSite" SET DEFAULT 'Bincebroker',
ALTER COLUMN "logoUrl" SET NOT NULL,
ALTER COLUMN "logoUrl" SET DEFAULT 'default-logo.png',
ALTER COLUMN "valorMinimoSaque" SET NOT NULL,
ALTER COLUMN "valorMinimoSaque" SET DEFAULT 100,
ALTER COLUMN "valorMinimoDeposito" SET NOT NULL,
ALTER COLUMN "valorMinimoDeposito" SET DEFAULT 60,
ALTER COLUMN "endPointGateway" SET NOT NULL,
ALTER COLUMN "endPointGateway" SET DEFAULT 'https://api.clyptpayments.com/v1/',
ALTER COLUMN "tokenPublicoGateway" SET NOT NULL,
ALTER COLUMN "tokenPublicoGateway" SET DEFAULT 'x',
ALTER COLUMN "tokenPrivadoGateway" SET NOT NULL,
ALTER COLUMN "tokenPrivadoGateway" SET DEFAULT 'sk_L7iXwcUkoTcz-ym-lgxftEL12NxaJ_X-ZjslXoMs9nXXok47',
ALTER COLUMN "taxa" SET NOT NULL,
ALTER COLUMN "taxa" SET DEFAULT 10;

-- AlterTable
ALTER TABLE "TradeOperation" ALTER COLUMN "tipo" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "affiliateId" TEXT;

-- AlterTable
ALTER TABLE "Withdrawal" ADD COLUMN     "tipo" "WithdrawalTipo" NOT NULL;

-- CreateTable
CREATE TABLE "Affiliate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipoComissao" "TipoComissao",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Affiliate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateCommission" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "tipo" "TipoComissao" NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "CommissionStatus" NOT NULL,

    CONSTRAINT "AffiliateCommission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClickEvent" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClickEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PixelEvent" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PixelEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostbackEvent" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "postbackData" JSONB NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostbackEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Affiliate_userId_key" ON "Affiliate"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_affiliateId_key" ON "User"("affiliateId");

-- AddForeignKey
ALTER TABLE "Affiliate" ADD CONSTRAINT "Affiliate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateCommission" ADD CONSTRAINT "AffiliateCommission_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClickEvent" ADD CONSTRAINT "ClickEvent_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PixelEvent" ADD CONSTRAINT "PixelEvent_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostbackEvent" ADD CONSTRAINT "PostbackEvent_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
