/*
  Warnings:

  - Added the required column `receita` to the `TradeOperation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TradeOperation" ADD COLUMN     "receita" DOUBLE PRECISION NOT NULL;
