import { prisma } from "@/lib/prisma";
import type { CreateOperationInput } from "@/types";

/**
 * Repository para operações de Trade (TradeOperation) no banco de dados.
 */
export const tradeRepository = {
  async findByUserId(userId: string, cursor?: string, take = 50) {
    return prisma.tradeOperation.findMany({
      where: { userId },
      orderBy: { data: "desc" },
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        tipo: true,
        data: true,
        ativo: true,
        tempo: true,
        previsao: true,
        vela: true,
        abertura: true,
        fechamento: true,
        valor: true,
        estornado: true,
        executado: true,
        status: true,
        receita: true,
        resultado: true,
        resolvedAt: true,
        durationSeconds: true,
        payoutRateSnapshot: true,
        minPriceVariation: true,
        settlementTolerance: true,
        settlementGraceSeconds: true,
        providerSlug: true,
        marketSymbol: true,
      },
    });
  },

  async findById(id: string) {
    return prisma.tradeOperation.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        tipo: true,
        ativo: true,
        abertura: true,
        valor: true,
        receita: true,
        previsao: true,
        status: true,
        resultado: true,
        expiresAt: true,
        tempo: true,
        resolvedAt: true,
        durationSeconds: true,
        payoutRateSnapshot: true,
        minPriceVariation: true,
        settlementTolerance: true,
        settlementGraceSeconds: true,
        providerSlug: true,
        marketSymbol: true,
      },
    });
  },

  /**
   * Find all pending operations whose expiresAt has passed.
   * Used by the settlement worker.
   */
  async findExpired() {
    return prisma.tradeOperation.findMany({
      where: {
        resultado: "pendente",
        expiresAt: { lte: new Date() },
      },
      select: {
        id: true,
        userId: true,
        tipo: true,
        ativo: true,
        abertura: true,
        valor: true,
        receita: true,
        previsao: true,
        expiresAt: true,
        tempo: true,
        durationSeconds: true,
        payoutRateSnapshot: true,
        minPriceVariation: true,
        settlementTolerance: true,
        settlementGraceSeconds: true,
        providerSlug: true,
        marketSymbol: true,
      },
    });
  },

  async create(input: CreateOperationInput) {
    return prisma.tradeOperation.create({
      data: {
        userId: input.userId,
        tipo: input.tipo,
        data: new Date(),
        ativo: input.ativo,
        tempo: input.tempo,
        previsao: input.previsao,
        vela: input.vela,
        abertura: input.abertura,
        valor: input.valor,
        status: "aberta",
        receita: input.receita ?? 0,
        expiresAt: input.expiresAt ?? null,
      },
    });
  },

  async updateResult(
    id: string,
    data: {
      resultado: "ganho" | "perda";
      fechamento: number;
      receita: number;
      status: string;
      executado: boolean;
    },
  ) {
    return prisma.tradeOperation.update({
      where: { id },
      data,
    });
  },
};
