/*
  Warnings:

  - You are about to drop the column `endPointGateway` on the `Config` table. All the data in the column will be lost.
  - You are about to drop the column `tokenPrivadoGateway` on the `Config` table. All the data in the column will be lost.
  - You are about to drop the column `tokenPublicoGateway` on the `Config` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Affiliate" ADD COLUMN     "split" TEXT,
ADD COLUMN     "splitValue" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Config" DROP COLUMN "endPointGateway",
DROP COLUMN "tokenPrivadoGateway",
DROP COLUMN "tokenPublicoGateway",
ADD COLUMN     "gatewayDepositoId" INTEGER,
ADD COLUMN     "gatewaySaqueId" INTEGER,
ADD COLUMN     "postbackUrl" TEXT,
ADD COLUMN     "revShareNegativo" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Gateways" (
    "id" SERIAL NOT NULL,
    "endpoint" TEXT NOT NULL,
    "tokenPublico" TEXT NOT NULL,
    "tokenPrivado" TEXT NOT NULL,
    "split" TEXT,
    "splitValue" DOUBLE PRECISION,

    CONSTRAINT "Gateways_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Config" ADD CONSTRAINT "Config_gatewayDepositoId_fkey" FOREIGN KEY ("gatewayDepositoId") REFERENCES "Gateways"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Config" ADD CONSTRAINT "Config_gatewaySaqueId_fkey" FOREIGN KEY ("gatewaySaqueId") REFERENCES "Gateways"("id") ON DELETE SET NULL ON UPDATE CASCADE;
