import { prisma } from "@/lib/prisma";

/**
 * Repository para operações de Withdrawal no banco de dados.
 */
export const withdrawalRepository = {
  async findByUserId(userId: string, cursor?: string, take = 50) {
    return prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { dataPedido: "desc" },
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        dataPedido: true,
        dataPagamento: true,
        tipoChave: true,
        chave: true,
        tipo: true,
        status: true,
        valor: true,
        taxa: true,
      },
    });
  },

  async create(data: {
    userId: string;
    valor: number;
    taxa: number;
    tipoChave: string;
    chave: string;
    tipo: "usuario" | "afiliado";
  }) {
    return prisma.withdrawal.create({
      data: {
        ...data,
        status: "pendente",
      },
    });
  },

  async updateStatus(
    id: string,
    status: "concluido" | "pendente" | "cancelado" | "processando",
  ) {
    return prisma.withdrawal.update({
      where: { id },
      data: { status },
    });
  },
};
