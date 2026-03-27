/*
  Warnings:

  - You are about to drop the column `gatewayDepositoId` on the `Config` table. All the data in the column will be lost.
  - You are about to drop the column `gatewaySaqueId` on the `Config` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Config" DROP CONSTRAINT "Config_gatewayDepositoId_fkey";

-- DropForeignKey
ALTER TABLE "Config" DROP CONSTRAINT "Config_gatewaySaqueId_fkey";

-- AlterTable
ALTER TABLE "Config" DROP COLUMN "gatewayDepositoId",
DROP COLUMN "gatewaySaqueId",
ADD COLUMN     "creditCardDepositId" INTEGER,
ADD COLUMN     "cryptoDepositId" INTEGER,
ADD COLUMN     "cryptoSaqueId" INTEGER,
ADD COLUMN     "gatewayPixDepositoId" INTEGER,
ADD COLUMN     "gatewayPixSaqueId" INTEGER;

-- AddForeignKey
ALTER TABLE "Config" ADD CONSTRAINT "Config_gatewayPixDepositoId_fkey" FOREIGN KEY ("gatewayPixDepositoId") REFERENCES "Gateways"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Config" ADD CONSTRAINT "Config_gatewayPixSaqueId_fkey" FOREIGN KEY ("gatewayPixSaqueId") REFERENCES "Gateways"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Config" ADD CONSTRAINT "Config_creditCardDepositId_fkey" FOREIGN KEY ("creditCardDepositId") REFERENCES "Gateways"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Config" ADD CONSTRAINT "Config_cryptoDepositId_fkey" FOREIGN KEY ("cryptoDepositId") REFERENCES "Gateways"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Config" ADD CONSTRAINT "Config_cryptoSaqueId_fkey" FOREIGN KEY ("cryptoSaqueId") REFERENCES "Gateways"("id") ON DELETE SET NULL ON UPDATE CASCADE;
