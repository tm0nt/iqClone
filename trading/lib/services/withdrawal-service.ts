import { prisma } from "@/lib/prisma";
import { withdrawalRepository } from "@/repositories/withdrawal.repository";
import { balanceRepository } from "@/repositories/balance.repository";
import { ApiError } from "@/lib/errors";
import { formatUsd } from "@shared/platform/branding";

/**
 * Service de Withdrawals.
 * Valida limites mínimos, calcula taxa e cria o saque atomicamente.
 */
export const withdrawalService = {
  async listByUser(userId: string, cursor?: string) {
    const withdrawals = await withdrawalRepository.findByUserId(
      userId,
      cursor,
    );
    return withdrawals.map((w) => ({
      ...w,
      valorLiquido: w.valor - w.taxa,
    }));
  },

  async createWithdrawal(input: {
    userId: string;
    valor: number;
    tipoChave: string;
    chave: string;
  }) {
    const { userId, valor, tipoChave, chave } = input;

    if (!tipoChave || !chave || valor <= 0) {
      throw ApiError.badRequest("Dados do saque inválidos");
    }

    // Busca config para valores mínimos e taxa
    const config = await prisma.config.findFirst({
      select: { valorMinimoSaque: true, taxa: true },
    });

    const minSaque = config?.valorMinimoSaque ?? 100;
    const taxaPercent = config?.taxa ?? 10;

    if (valor < minSaque) {
      throw ApiError.badRequest(
        `Valor mínimo para saque: ${formatUsd(minSaque, "en-US")}`,
      );
    }

    const balance = await balanceRepository.findByUserId(userId);
    if (!balance) throw ApiError.notFound("Saldo não encontrado");

    if (balance.saldoReal < valor) {
      throw ApiError.badRequest("Saldo insuficiente");
    }

    const taxa = (valor * taxaPercent) / 100;

    return prisma.$transaction(async (tx) => {
      await tx.balance.update({
        where: { userId },
        data: { saldoReal: { decrement: valor } },
      });

      return tx.withdrawal.create({
        data: {
          userId,
          valor,
          taxa,
          tipoChave,
          chave,
          tipo: "usuario",
          status: "pendente",
        },
      });
    });
  },
};
