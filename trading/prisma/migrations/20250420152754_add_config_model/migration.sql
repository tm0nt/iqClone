-- CreateTable
CREATE TABLE "Config" (
    "id" SERIAL NOT NULL,
    "nomeSite" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "valorMinimoSaque" DOUBLE PRECISION NOT NULL,
    "valorMinimoDeposito" DOUBLE PRECISION NOT NULL,
    "endPointGateway" TEXT NOT NULL,
    "tokenPublicoGateway" TEXT NOT NULL,
    "tokenPrivadoGateway" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);
