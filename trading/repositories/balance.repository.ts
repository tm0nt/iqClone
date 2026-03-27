import { prisma } from "@/lib/prisma";

/**
 * Repository para operações de Balance no banco de dados.
 */
export const balanceRepository = {
  async findByUserId(userId: string) {
    return prisma.balance.findUnique({
      where: { userId },
      select: {
        id: true,
        saldoDemo: true,
        saldoReal: true,
        saldoComissao: true,
      },
    });
  },

  async updateDemo(userId: string, value: number) {
    return prisma.balance.update({
      where: { userId },
      data: { saldoDemo: value },
      select: { saldoDemo: true },
    });
  },

  async updateReal(userId: string, value: number) {
    return prisma.balance.update({
      where: { userId },
      data: { saldoReal: value },
      select: { saldoReal: true },
    });
  },

  async resetDemo(userId: string, defaultBalance = 10000) {
    return prisma.balance.update({
      where: { userId },
      data: { saldoDemo: defaultBalance },
      select: { saldoDemo: true },
    });
  },

  async incrementReal(userId: string, amount: number) {
    return prisma.balance.update({
      where: { userId },
      data: { saldoReal: { increment: amount } },
      select: { saldoReal: true },
    });
  },

  async decrementReal(userId: string, amount: number) {
    return prisma.balance.update({
      where: { userId },
      data: { saldoReal: { decrement: amount } },
      select: { saldoReal: true },
    });
  },
};
