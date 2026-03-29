import { prisma } from "@/lib/prisma";
import { withdrawalRepository } from "@/repositories/withdrawal.repository";
import { balanceRepository } from "@/repositories/balance.repository";
import { ApiError } from "@/lib/errors";
import { formatUsd } from "@shared/platform/branding";
import { resolveGatewayForFlow } from "@/lib/gateways/index";

/**
 * Service de Withdrawals.
 * Centraliza validacao, calculo de taxa e criacao atomica de saque.
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
    gatewayMethod?: string;
  }) {
    const { userId, valor, tipoChave, chave, gatewayMethod = "pix" } = input;

    if (!tipoChave || !chave || !valor || valor <= 0) {
      throw ApiError.badRequest("Dados incompletos. Preencha todos os campos.");
    }

    const config = await prisma.config.findUnique({
      where: { id: 1 },
      select: { valorMinimoSaque: true, taxa: true },
    });

    const valorMinimoSaque = config?.valorMinimoSaque ?? 50.0;
    const taxaFixa = config?.taxa ?? 5.0;

    if (valor < valorMinimoSaque) {
      throw ApiError.badRequest(
        `Minimum withdrawal amount is ${formatUsd(valorMinimoSaque, "en-US")}`,
      );
    }

    const balance = await balanceRepository.findByUserId(userId);
    if (!balance) {
      throw ApiError.notFound("Saldo nao encontrado");
    }

    const valorTotal = valor + taxaFixa;

    if (balance.saldoReal < valorTotal) {
      throw ApiError.badRequest("Saldo insuficiente", {
        detail: `Your real balance is ${formatUsd(balance.saldoReal, "en-US")} and the requested amount plus fixed fee ${formatUsd(taxaFixa, "en-US")} totals ${formatUsd(valorTotal, "en-US")}.`,
      });
    }

    const gateway = await resolveGatewayForFlow({
      method: gatewayMethod,
      direction: "withdraw",
    });

    const withdrawal = await prisma.$transaction(async (tx) => {
      await tx.balance.update({
        where: { userId },
        data: { saldoReal: { decrement: valorTotal } },
      });

      return tx.withdrawal.create({
        data: {
          userId,
          gatewayId: gateway?.id ?? null,
          valor,
          taxa: taxaFixa,
          tipoChave,
          chave,
          tipo: "usuario",
          status: "pendente",
          dataPedido: new Date(),
        },
      });
    });

    return {
      withdrawal,
      gateway: gateway
        ? { id: gateway.id, name: gateway.name, provider: gateway.provider }
        : null,
      newBalance: balance.saldoReal - valorTotal,
      taxaFormatted: formatUsd(taxaFixa, "en-US"),
    };
  },
};
