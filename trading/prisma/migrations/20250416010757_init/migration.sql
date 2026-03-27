-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('concluido', 'pendente', 'cancelado');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('concluido', 'pendente', 'cancelado');

-- CreateEnum
CREATE TYPE "Resultado" AS ENUM ('ganho', 'perda');

-- CreateEnum
CREATE TYPE "AcaoAuditoria" AS ENUM ('create', 'update', 'delete');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "cpf" TEXT,
    "nacionalidade" TEXT,
    "documentoTipo" TEXT,
    "documentoNumero" TEXT,
    "ddi" TEXT,
    "telefone" TEXT,
    "dataNascimento" TIMESTAMP(3),
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Balance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "saldoDemo" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "saldoReal" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Balance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deposit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "status" "DepositStatus" NOT NULL,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataPagamento" TIMESTAMP(3),

    CONSTRAINT "Deposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Withdrawal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dataPedido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataPagamento" TIMESTAMP(3),
    "tipoChave" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "status" "WithdrawalStatus" NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "taxa" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradeOperation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "ativo" TEXT NOT NULL,
    "tempo" TEXT NOT NULL,
    "previsao" TEXT NOT NULL,
    "vela" TEXT NOT NULL,
    "abertura" DECIMAL(65,30) NOT NULL,
    "fechamento" DECIMAL(65,30) NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "estornado" BOOLEAN NOT NULL DEFAULT false,
    "executado" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL,
    "resultado" "Resultado" NOT NULL,

    CONSTRAINT "TradeOperation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT NOT NULL,
    "acao" "AcaoAuditoria" NOT NULL,
    "valoresAntigos" JSONB,
    "valoresNovos" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Balance_userId_key" ON "Balance"("userId");

-- AddForeignKey
ALTER TABLE "Balance" ADD CONSTRAINT "Balance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeOperation" ADD CONSTRAINT "TradeOperation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLog" ADD CONSTRAINT "UserLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
