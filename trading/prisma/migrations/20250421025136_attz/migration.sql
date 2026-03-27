-- AlterTable
ALTER TABLE "Deposit" ALTER COLUMN "transactionId" DROP DEFAULT,
ALTER COLUMN "transactionId" SET DATA TYPE TEXT;
DROP SEQUENCE "Deposit_transactionId_seq";
