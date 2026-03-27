-- AlterTable
ALTER TABLE "TradeOperation" ADD COLUMN "expiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "TradeOperation_resultado_expiresAt_idx" ON "TradeOperation"("resultado", "expiresAt");

-- CreateIndex
CREATE INDEX "TradeOperation_userId_resultado_idx" ON "TradeOperation"("userId", "resultado");
