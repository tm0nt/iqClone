import { prisma } from "@/lib/prisma";
import { tradeRepository } from "@/repositories/trade.repository";
import { balanceRepository } from "@/repositories/balance.repository";
import { ApiError } from "@/lib/errors";
import type { CreateOperationInput } from "@/types";
import {
  processAffiliateRevShareOnLoss,
  processAffiliateRevShareOnWin,
} from "@/lib/services/affiliate-commission-service";
import { getPlatformConfig } from "@/lib/config/site-config";
import { getActiveRevenueMultiplierForUser } from "@/lib/services/promotion-service";
import {
  computeExpiresAtFromMinutes,
  minutesToTempo,
  tempoToMinutes,
} from "@/lib/services/trading-runtime";
import { calculateLiveOperationSellSnapshot } from "@/lib/trade-operation-math";

async function getDefaultPayoutRate(): Promise<number> {
  const setting = await prisma.systemSettings.findUnique({
    where: { key: "trading.default_payout_rate" },
    select: { value: true },
  });
  const parsed = parseFloat(setting?.value ?? "");
  return isNaN(parsed) ? 0.9 : parsed;
}

function inferProviderSlug(symbol: string) {
  return /(USDT|BUSD|BTC|ETH|BNB)$/i.test(symbol) ? "binance" : "tiingo";
}

/**
 * Service de Trade Operations.
 * Encapsula toda lógica de negócio para abertura/fechamento de operações.
 */
export const tradeService = {
  async listByUser(userId: string, cursor?: string, take = 50) {
    return tradeRepository.findByUserId(userId, cursor, take);
  },

  /**
   * Open a new binary-option operation.
   * - Validates inputs and balance.
   * - Deducts balance atomically.
   * - Creates the TradeOperation with an `expiresAt` timestamp.
   */
  async createOperation(input: CreateOperationInput) {
    const { userId, valor, tipo } = input;

    if (
      !input.ativo ||
      !input.tempo ||
      !input.previsao ||
      !input.vela ||
      valor <= 0
    ) {
      throw ApiError.badRequest(
        "Campos obrigatórios faltando ou valor inválido",
      );
    }

    // Validate balance
    const balance = await balanceRepository.findByUserId(userId);
    if (!balance) throw ApiError.notFound("Saldo não encontrado");

    const saldoAtual =
      tipo === "demo" ? balance.saldoDemo : balance.saldoReal;
    if (saldoAtual < valor) {
      throw ApiError.badRequest("Saldo insuficiente");
    }

    const [pair, defaultPayoutRate, platformConfig, revenuePromotion] = await Promise.all([
      prisma.tradingPair.findFirst({
        where: { symbol: input.ativo.toUpperCase() },
        orderBy: [
          { marketProvider: { sortOrder: "asc" } },
          { displayOrder: "asc" },
        ],
        select: {
          id: true,
          payoutRate: true,
          priceSource: true,
          priceSymbol: true,
          marketProvider: {
            select: {
              slug: true,
            },
          },
        },
      }),
      getDefaultPayoutRate(),
      getPlatformConfig(),
      getActiveRevenueMultiplierForUser(userId),
    ]);

    const payoutRate = pair?.payoutRate ?? defaultPayoutRate;
    const revenueMultiplier = Math.max(
      revenuePromotion?.promotion.revenueMultiplier ?? 1,
      1,
    );
    const effectivePayoutRate = payoutRate * revenueMultiplier;
    const receita = valor * effectivePayoutRate;
    const requestedExpiryMinutes = tempoToMinutes(
      input.tempo,
      platformConfig.defaultExpiryMinutes,
    );
    const expiryMinutes = platformConfig.expiryOptions.includes(
      requestedExpiryMinutes,
    )
      ? requestedExpiryMinutes
      : platformConfig.defaultExpiryMinutes;
    const now = new Date();
    const hasValidClientExpiry =
      input.expiresAt instanceof Date &&
      !Number.isNaN(input.expiresAt.getTime()) &&
      requestedExpiryMinutes === expiryMinutes;
    const expiresAt =
      hasValidClientExpiry
        ? (input.expiresAt as Date)
        : computeExpiresAtFromMinutes(expiryMinutes, now);
    const durationSeconds = Math.max(
      1,
      Math.round((expiresAt.getTime() - now.getTime()) / 1000),
    );
    const normalizedTempo = minutesToTempo(expiryMinutes);
    const providerSlug =
      pair?.marketProvider?.slug ||
      pair?.priceSource ||
      inferProviderSlug(input.ativo);
    const marketSymbol = pair?.priceSymbol ?? input.ativo.toUpperCase();
    const scheduledFor = new Date(
      expiresAt.getTime() + platformConfig.settlementGraceSeconds * 1000,
    );

    // Atomic: deduct balance + create operation
    return prisma.$transaction(async (tx) => {
      if (tipo === "demo") {
        await tx.balance.update({
          where: { userId },
          data: { saldoDemo: { decrement: valor } },
        });
      } else {
        await tx.balance.update({
          where: { userId },
          data: { saldoReal: { decrement: valor } },
        });
      }

      return tx.tradeOperation.create({
        data: {
          userId,
          pairId: pair?.id,
          tipo: input.tipo,
          data: now,
          ativo: input.ativo.toUpperCase(),
          tempo: normalizedTempo,
          previsao: input.previsao,
          vela: input.vela,
          abertura: input.abertura,
          valor: input.valor,
          durationSeconds,
          payoutRateSnapshot: effectivePayoutRate,
          minPriceVariation: platformConfig.minPriceVariation,
          settlementTolerance: platformConfig.settlementTolerance,
          settlementGraceSeconds: platformConfig.settlementGraceSeconds,
          providerSlug,
          marketSymbol,
          status: "executado",
          receita,
          resultado: "pendente",
          expiresAt,
        },
      }).then(async (operation) => {
        await tx.operationSettlementJob.create({
          data: {
            operationId: operation.id,
            scheduledFor,
          },
        });

        return operation;
      });
    });
  },

  /**
   * Settle (resolve) an operation.
   * Called by the settlement worker when `expiresAt` is reached.
   *
   * @param operationId - The TradeOperation ID
   * @param resultado   - "ganho" or "perda"
   * @param fechamento  - The closing price at expiration
   */
  async resolveOperation(
    operationId: string,
    resultado: "ganho" | "perda",
    fechamento: number,
  ) {
    const operation = await tradeRepository.findById(operationId);
    if (!operation) throw ApiError.notFound("Operação não encontrada");
    if (operation.resultado && operation.resultado !== "pendente") {
      throw ApiError.badRequest("Operação já foi resolvida");
    }

    const defaultPayoutRate = await getDefaultPayoutRate();
    const receita =
      resultado === "ganho"
        ? operation.receita ??
          operation.valor * (operation.payoutRateSnapshot ?? defaultPayoutRate)
        : 0;

    const updated = await prisma.$transaction(async (tx) => {
      const updated = await tx.tradeOperation.update({
        where: { id: operationId },
        data: {
          resultado,
          fechamento,
          resolvedAt: new Date(),
          receita,
          status: resultado === "ganho" ? "ganho" : "perda",
          executado: true,
        },
      });

      // Credit the user's balance if they won (valor + receita)
      if (resultado === "ganho") {
        const field =
          operation.tipo === "demo" ? "saldoDemo" : "saldoReal";
        await tx.balance.update({
          where: { userId: operation.userId },
          data: { [field]: { increment: operation.valor + receita } },
        });
      }

      return updated;
    });

    if (resultado === "perda") {
      await processAffiliateRevShareOnLoss({
        referredUserId: operation.userId,
        operationId,
        amount: operation.valor,
      });
    } else {
      await processAffiliateRevShareOnWin({
        referredUserId: operation.userId,
        operationId,
        amount: receita,
      });
    }

    return updated;
  },

  async sellOperation(operationId: string, fechamento: number) {
    const operation = await tradeRepository.findById(operationId);
    if (!operation) throw ApiError.notFound("Operação não encontrada");
    if (operation.resultado && operation.resultado !== "pendente") {
      throw ApiError.badRequest("Operação já foi resolvida");
    }

    const defaultPayoutRate = await getDefaultPayoutRate();
    const expectedProfit =
      operation.receita ??
      operation.valor * (operation.payoutRateSnapshot ?? defaultPayoutRate);
    const snapshot = calculateLiveOperationSellSnapshot({
      type: operation.previsao === "call" ? "buy" : "sell",
      value: operation.valor,
      entryPrice: operation.abertura,
      expectedProfit,
      livePrice: fechamento,
    });
    const resultado = snapshot.pnl > 0 ? "ganho" : "perda";
    const balanceField = operation.tipo === "demo" ? "saldoDemo" : "saldoReal";

    const updated = await prisma.$transaction(async (tx) => {
      const updatedOperation = await tx.tradeOperation.update({
        where: { id: operationId },
        data: {
          resultado,
          fechamento,
          resolvedAt: new Date(),
          receita: snapshot.pnl,
          status: "vendido",
          executado: true,
        },
      });

      await tx.operationSettlementJob.updateMany({
        where: { operationId },
        data: {
          status: "completed",
          processedAt: new Date(),
          lastError: "manual-sell",
        },
      });

      if (snapshot.exitValue > 0) {
        await tx.balance.update({
          where: { userId: operation.userId },
          data: { [balanceField]: { increment: snapshot.exitValue } },
        });
      }

      return updatedOperation;
    });

    if (snapshot.pnl < 0) {
      await processAffiliateRevShareOnLoss({
        referredUserId: operation.userId,
        operationId,
        amount: Math.abs(snapshot.pnl),
      });
    } else if (snapshot.pnl > 0) {
      await processAffiliateRevShareOnWin({
        referredUserId: operation.userId,
        operationId,
        amount: snapshot.pnl,
      });
    }

    return {
      operation: updated,
      creditedAmount: snapshot.exitValue,
      profit: snapshot.pnl,
      result: resultado,
    };
  },
};
