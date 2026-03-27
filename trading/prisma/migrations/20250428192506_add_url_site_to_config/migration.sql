/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `Deposit` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[transactionId]` on the table `Withdrawal` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Deposit_transactionId_key" ON "Deposit"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "Withdrawal_transactionId_key" ON "Withdrawal"("transactionId");
