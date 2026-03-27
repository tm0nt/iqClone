/*
  Warnings:

  - Added the required column `transactionId` to the `Deposit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Deposit" ADD COLUMN "transactionId" UUID NULL;
