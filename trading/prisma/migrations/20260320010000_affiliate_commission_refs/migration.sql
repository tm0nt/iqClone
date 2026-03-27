ALTER TABLE "AffiliateCommission"
ADD COLUMN "userId" TEXT,
ADD COLUMN "depositId" TEXT,
ADD COLUMN "operationId" TEXT,
ADD COLUMN "percentual" DOUBLE PRECISION,
ADD COLUMN "descricao" TEXT,
ALTER COLUMN "status" SET DEFAULT 'pendente';

CREATE UNIQUE INDEX "AffiliateCommission_affiliateId_depositId_tipo_key"
ON "AffiliateCommission"("affiliateId", "depositId", "tipo");

CREATE UNIQUE INDEX "AffiliateCommission_affiliateId_operationId_tipo_key"
ON "AffiliateCommission"("affiliateId", "operationId", "tipo");

ALTER TABLE "AffiliateCommission"
ADD CONSTRAINT "AffiliateCommission_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AffiliateCommission"
ADD CONSTRAINT "AffiliateCommission_depositId_fkey"
FOREIGN KEY ("depositId") REFERENCES "Deposit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AffiliateCommission"
ADD CONSTRAINT "AffiliateCommission_operationId_fkey"
FOREIGN KEY ("operationId") REFERENCES "TradeOperation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
