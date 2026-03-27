/*
  Warnings:

  - The `transactionId` column on the `Deposit` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Deposit" DROP COLUMN "transactionId",
ADD COLUMN     "transactionId" SERIAL NOT NULL;
