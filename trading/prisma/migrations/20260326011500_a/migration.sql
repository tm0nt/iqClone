-- AlterTable
ALTER TABLE "Config" ADD COLUMN     "candleDownColor" TEXT,
ADD COLUMN     "candleUpColor" TEXT,
ADD COLUMN     "chartBackgroundUrl" TEXT,
ADD COLUMN     "chartGridColor" TEXT,
ADD COLUMN     "faviconUrl" TEXT,
ADD COLUMN     "iconBgColor" TEXT NOT NULL DEFAULT '#364152',
ADD COLUMN     "iconColor" TEXT NOT NULL DEFAULT '#a1a8b3',
ADD COLUMN     "negativeColor" TEXT NOT NULL DEFAULT '#ef4444',
ADD COLUMN     "positiveColor" TEXT NOT NULL DEFAULT '#22c55e',
ADD COLUMN     "textColor" TEXT NOT NULL DEFAULT '#ffffff';

-- AlterTable
ALTER TABLE "OperationSettlementJob" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "TradingPair" ALTER COLUMN "updatedAt" DROP DEFAULT;
