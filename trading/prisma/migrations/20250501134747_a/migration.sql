/*
  Warnings:

  - You are about to drop the column `logoUrl` on the `Config` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `Withdrawal` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Deposit_transactionId_key";

-- DropIndex
DROP INDEX "Withdrawal_transactionId_key";

-- AlterTable
ALTER TABLE "Config" DROP COLUMN "logoUrl",
ADD COLUMN     "logoUrlDark" TEXT NOT NULL DEFAULT 'default-logo.png',
ADD COLUMN     "logoUrlWhite" TEXT NOT NULL DEFAULT 'default-logo.png';

-- AlterTable
ALTER TABLE "Withdrawal" DROP COLUMN "transactionId";
