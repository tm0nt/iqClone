import { prisma } from "@/lib/prisma";

/**
 * Repository para operações de Deposit no banco de dados.
 */
export const depositRepository = {
  async findByUserId(userId: string, cursor?: string, take = 50) {
    return prisma.deposit.findMany({
      where: { userId },
      orderBy: { dataCriacao: "desc" },
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        transactionId: true,
        tipo: true,
        valor: true,
        status: true,
        dataCriacao: true,
        dataPagamento: true,
      },
    });
  },

  async findByTransactionId(transactionId: string) {
    return prisma.deposit.findFirst({
      where: { transactionId },
      select: {
        id: true,
        userId: true,
        status: true,
        valor: true,
        tipo: true,
      },
    });
  },

  async updateStatus(
    id: string,
    status: "concluido" | "pendente" | "cancelado" | "processando",
    dataPagamento?: Date,
  ) {
    return prisma.deposit.update({
      where: { id },
      data: {
        status,
        ...(dataPagamento ? { dataPagamento } : {}),
      },
    });
  },
};
