import { db } from "@/db";
import {
  tradeOperations,
  operationSettlementJobs,
  balances,
  tradingPairs,
} from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

const PAYOUT_RATE = 0.9;

function computeExpiresAt(tempo: string): Date {
  const match = tempo.match(/^(\d+)(m|h|d)$/);
  if (!match) return new Date(Date.now() + 5 * 60 * 1000);

  const amount = parseInt(match[1], 10);
  const unit = match[2];
  let ms: number;

  switch (unit) {
    case "m": ms = amount * 60 * 1000; break;
    case "h": ms = amount * 60 * 60 * 1000; break;
    case "d": ms = amount * 24 * 60 * 60 * 1000; break;
    default: ms = 5 * 60 * 1000;
  }

  return new Date(Date.now() + ms);
}

export const tradeService = {
  async createOperation(input: {
    userId: string;
    tipo: string;
    ativo: string;
    tempo: string;
    previsao: string;
    vela: string;
    abertura: number;
    valor: number;
    expiresAt?: Date;
  }) {
    const { userId, valor, tipo } = input;

    if (!input.ativo || !input.tempo || !input.previsao || !input.vela || valor <= 0) {
      throw new Error("Campos obrigatórios faltando ou valor inválido");
    }

    // Validate balance
    const [balance] = await db
      .select()
      .from(balances)
      .where(eq(balances.userId, userId))
      .limit(1);

    if (!balance) throw new Error("Saldo não encontrado");

    const saldoAtual = tipo === "demo" ? balance.saldoDemo : balance.saldoReal;
    if (saldoAtual < valor) throw new Error("Saldo insuficiente");

    // Get payout rate from trading pair
    const [pair] = await db
      .select({ id: tradingPairs.id, payoutRate: tradingPairs.payoutRate })
      .from(tradingPairs)
      .where(eq(tradingPairs.symbol, input.ativo.toUpperCase()))
      .limit(1);

    const payoutRate = pair?.payoutRate ?? PAYOUT_RATE;
    const receita = valor * payoutRate;
    const expiresAt = input.expiresAt ?? computeExpiresAt(input.tempo);

    // Deduct balance
    const field = tipo === "demo" ? "saldoDemo" : "saldoReal";
    await db
      .update(balances)
      .set({ [field]: sql`${balances[field]} - ${valor}` })
      .where(eq(balances.userId, userId));

    // Create operation
    const [operation] = await db.insert(tradeOperations).values({
      userId,
      pairId: pair?.id,
      tipo: input.tipo,
      data: new Date(),
      ativo: input.ativo.toUpperCase(),
      tempo: input.tempo,
      previsao: input.previsao,
      vela: input.vela,
      abertura: input.abertura,
      valor: input.valor,
      status: "executado",
      receita,
      resultado: "pendente",
      expiresAt,
    }).returning();

    // Create settlement job
    await db.insert(operationSettlementJobs).values({
      operationId: operation.id,
      scheduledFor: expiresAt,
    });

    return operation;
  },

  async resolveOperation(
    operationId: string,
    resultado: "ganho" | "perda",
    fechamento: number,
  ) {
    const [operation] = await db
      .select()
      .from(tradeOperations)
      .where(eq(tradeOperations.id, operationId))
      .limit(1);

    if (!operation) throw new Error("Operação não encontrada");
    if (operation.resultado && operation.resultado !== "pendente") {
      throw new Error("Operação já foi resolvida");
    }

    const receita = resultado === "ganho"
      ? (operation.receita ?? operation.valor * PAYOUT_RATE)
      : 0;

    // Update operation
    await db
      .update(tradeOperations)
      .set({
        resultado,
        fechamento,
        receita,
        status: resultado === "ganho" ? "ganho" : "perda",
        executado: true,
      })
      .where(eq(tradeOperations.id, operationId));

    // Credit balance if won
    if (resultado === "ganho") {
      const field = operation.tipo === "demo" ? "saldoDemo" : "saldoReal";
      await db
        .update(balances)
        .set({ [field]: sql`${balances[field]} + ${operation.valor + receita}` })
        .where(eq(balances.userId, operation.userId));
    }

    return { id: operationId, resultado, fechamento, receita };
  },
};
