import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { fetchOperationClosePrice } from "@/lib/services/operation-close-price";
import { tradeService } from "@/lib/services/trade-service";
import { ApiError } from "@/lib/errors";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const isString = (value: unknown): value is string =>
      typeof value === "string" && value.length > 0;
    const payload = await request.json().catch(() => null);
    const rawOperationIds = Array.isArray(payload?.operationIds)
      ? payload.operationIds
      : [];
    const operationIds: string[] = Array.from(
      new Set(rawOperationIds.filter(isString)),
    );

    if (operationIds.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma operação ativa foi informada." },
        { status: 400 },
      );
    }

    const operations = await prisma.tradeOperation.findMany({
      where: {
        id: { in: operationIds },
        userId: session.userId,
        resultado: "pendente",
      },
      select: {
        id: true,
        ativo: true,
        valor: true,
        receita: true,
        abertura: true,
        tempo: true,
        data: true,
        expiresAt: true,
        previsao: true,
        tipo: true,
        pairId: true,
        providerSlug: true,
        marketSymbol: true,
      },
    });

    if (operations.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma operação pendente encontrada para venda." },
        { status: 404 },
      );
    }

    // Phase 1: Fetch all close prices in parallel
    const operationsWithPrices = await Promise.all(
      operations.map(async (operation) => {
        const pair = operation.pairId
          ? await prisma.tradingPair.findUnique({
              where: { id: operation.pairId },
              select: {
                priceSource: true,
                priceSymbol: true,
                marketProvider: {
                  select: { slug: true },
                },
              },
            })
          : null;
        const priceSource =
          operation.providerSlug ||
          pair?.marketProvider?.slug ||
          pair?.priceSource ||
          "tiingo";
        const marketSymbol =
          operation.marketSymbol ||
          pair?.priceSymbol ||
          operation.ativo;
        const closePriceData = await fetchOperationClosePrice(
          priceSource,
          marketSymbol,
        );
        return { operation, closePriceData };
      }),
    );

    // Phase 2: Process sells sequentially (same user, balance mutations)
    const results = [];

    for (const { operation, closePriceData } of operationsWithPrices) {
      const sold = await tradeService.sellOperation(
        operation.id,
        closePriceData.price,
      );

      results.push({
        id: operation.id,
        asset: operation.ativo,
        type: operation.previsao === "call" ? "buy" : "sell",
        accountType: operation.tipo,
        value: operation.valor,
        timeframe: operation.tempo,
        entryTime: operation.data.toISOString(),
        expiryTime: operation.expiresAt?.toISOString() ?? null,
        entryPrice: operation.abertura,
        closePrice: closePriceData.price,
        creditedAmount: sold.creditedAmount,
        profit: sold.profit,
        result: sold.result === "ganho" ? "win" : "loss",
        source: closePriceData.source,
      });
    }

    return NextResponse.json({ operations: results });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    console.error("Erro ao vender operações ativas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
