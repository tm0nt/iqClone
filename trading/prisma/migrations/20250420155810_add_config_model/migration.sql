-- AlterTable
ALTER TABLE "Config" ALTER COLUMN "nomeSite" DROP NOT NULL,
ALTER COLUMN "valorMinimoSaque" DROP NOT NULL,
ALTER COLUMN "valorMinimoDeposito" DROP NOT NULL,
ALTER COLUMN "endPointGateway" DROP NOT NULL,
ALTER COLUMN "tokenPublicoGateway" DROP NOT NULL,
ALTER COLUMN "tokenPrivadoGateway" DROP NOT NULL;
