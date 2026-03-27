CREATE TYPE "TradingPairType" AS ENUM ('forex', 'crypto');

CREATE TYPE "SettlementJobStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TABLE "TradingPair" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TradingPairType" NOT NULL,
    "provider" TEXT NOT NULL,
    "payoutRate" DOUBLE PRECISION NOT NULL DEFAULT 0.9,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "color" TEXT,
    "logo" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TradingPair_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OperationSettlementJob" (
    "id" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,
    "status" "SettlementJobStatus" NOT NULL DEFAULT 'pending',
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperationSettlementJob_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "TradeOperation" ADD COLUMN "pairId" TEXT;
ALTER TABLE "TradeOperation" ADD COLUMN "expiresAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "TradingPair_symbol_key" ON "TradingPair"("symbol");
CREATE INDEX "TradingPair_type_isActive_displayOrder_idx" ON "TradingPair"("type", "isActive", "displayOrder");

CREATE UNIQUE INDEX "OperationSettlementJob_operationId_key" ON "OperationSettlementJob"("operationId");
CREATE INDEX "OperationSettlementJob_status_scheduledFor_idx" ON "OperationSettlementJob"("status", "scheduledFor");

CREATE INDEX "TradeOperation_resultado_expiresAt_idx" ON "TradeOperation"("resultado", "expiresAt");
CREATE INDEX "TradeOperation_userId_resultado_idx" ON "TradeOperation"("userId", "resultado");
CREATE INDEX "TradeOperation_pairId_idx" ON "TradeOperation"("pairId");

ALTER TABLE "TradeOperation" ADD CONSTRAINT "TradeOperation_pairId_fkey" FOREIGN KEY ("pairId") REFERENCES "TradingPair"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OperationSettlementJob" ADD CONSTRAINT "OperationSettlementJob_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "TradeOperation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
