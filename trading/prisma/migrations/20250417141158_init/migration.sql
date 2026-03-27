/*
  Warnings:

  - You are about to alter the column `saldoDemo` on the `Balance` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `saldoReal` on the `Balance` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `valor` on the `Deposit` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `abertura` on the `TradeOperation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `fechamento` on the `TradeOperation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `valor` on the `TradeOperation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `valor` on the `Withdrawal` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `taxa` on the `Withdrawal` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "Balance" ALTER COLUMN "saldoDemo" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "saldoReal" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Deposit" ALTER COLUMN "valor" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "TradeOperation" ALTER COLUMN "abertura" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "fechamento" DROP NOT NULL,
ALTER COLUMN "fechamento" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "valor" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "resultado" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Withdrawal" ALTER COLUMN "valor" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "taxa" SET DATA TYPE DOUBLE PRECISION;
