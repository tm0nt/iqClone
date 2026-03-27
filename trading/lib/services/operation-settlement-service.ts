import { prisma } from "@/lib/prisma";
import { tradeService } from "@/lib/services/trade-service";
import { resolveTradeOutcome } from "@/lib/services/trading-runtime";
import { fetchOperationClosePrice } from "@/lib/services/operation-close-price";

type SettlementResult = {
  id: string;
  resultado: "ganho" | "perda";
  source: string;
  closePrice: number;
};

type SettlementBatchResult = {
  settled: number;
  results: SettlementResult[];
  reason?: string;
};

export async function runSettlementBatch(): Promise<SettlementBatchResult> {
  const workerConfig = await prisma.workerConfig.findUnique({
    where: { workerName: "settlement" },
  });

  if (workerConfig && !workerConfig.isEnabled) {
    return { settled: 0, results: [], reason: "worker disabled" };
  }

  const batchSize = workerConfig?.batchSize ?? 50;
  const maxAttempts = workerConfig?.maxAttempts ?? 10;
  const timeoutMs = Math.max(1_000, workerConfig?.timeoutMs ?? 5_000);
  const retryDelayMs = Math.max(1_000, workerConfig?.retryDelayMs ?? 60_000);
  const now = new Date();

  await prisma.operationSettlementJob.updateMany({
    where: {
      status: "processing",
      startedAt: {
        lte: new Date(now.getTime() - timeoutMs),
      },
    },
    data: {
      status: "failed",
      startedAt: null,
      lastError: "processing-timeout",
      scheduledFor: now,
    },
  });

  const dueJobs = await prisma.operationSettlementJob.findMany({
    where: {
      status: { in: ["pending", "failed"] },
      scheduledFor: { lte: now },
      attempts: { lt: maxAttempts },
    },
    include: {
      operation: {
        include: {
          pair: {
            select: {
              priceSource: true,
              priceSymbol: true,
              marketProvider: { select: { slug: true } },
            },
          },
        },
      },
    },
    orderBy: { scheduledFor: "asc" },
    take: batchSize,
  });

  if (dueJobs.length === 0) {
    return { settled: 0, results: [] };
  }

  const results: SettlementResult[] = [];

  for (const job of dueJobs) {
    const claimed = await prisma.operationSettlementJob.updateMany({
      where: {
        id: job.id,
        status: { in: ["pending", "failed"] },
      },
      data: {
        status: "processing",
        startedAt: new Date(),
        attempts: { increment: 1 },
        lastError: null,
      },
    });

    if (claimed.count === 0) {
      continue;
    }

    const operation = job.operation;

    try {
      if (!operation) {
        await prisma.operationSettlementJob.update({
          where: { id: job.id },
          data: {
            status: "completed",
            processedAt: new Date(),
            lastError: "Operation not found",
          },
        });
        continue;
      }

      if (operation.resultado !== "pendente") {
        await prisma.operationSettlementJob.update({
          where: { id: job.id },
          data: {
            status: "completed",
            processedAt: new Date(),
            lastError: null,
          },
        });
        continue;
      }

      const priceSource =
        operation.providerSlug ||
        operation.pair?.marketProvider?.slug ||
        operation.pair?.priceSource ||
        "itick";
      const marketSymbol =
        operation.marketSymbol ||
        operation.pair?.priceSymbol ||
        operation.ativo;
      const closePriceData = await fetchOperationClosePrice(
        priceSource,
        marketSymbol,
      );
      const outcome = resolveTradeOutcome({
        previsao: operation.previsao,
        abertura: operation.abertura,
        fechamento: closePriceData.price,
        minPriceVariation: operation.minPriceVariation,
        settlementTolerance: operation.settlementTolerance,
      });
      const resultado = outcome.didWin ? "ganho" : "perda";

      await tradeService.resolveOperation(
        operation.id,
        resultado,
        closePriceData.price,
      );
      await prisma.operationSettlementJob.update({
        where: { id: job.id },
        data: {
          status: "completed",
          processedAt: new Date(),
          lastError: null,
        },
      });

      results.push({
        id: operation.id,
        resultado,
        source: closePriceData.source,
        closePrice: closePriceData.price,
      });
    } catch (error) {
      const nextAttempts = job.attempts + 1;
      const lastError =
        error instanceof Error ? error.message : "Unknown settlement error";

      if (operation && nextAttempts >= maxAttempts) {
        const fallbackOutcome = resolveTradeOutcome({
          previsao: operation.previsao,
          abertura: operation.abertura,
          fechamento: operation.abertura,
          minPriceVariation: operation.minPriceVariation,
          settlementTolerance: operation.settlementTolerance,
        });
        const fallbackResult = fallbackOutcome.didWin ? "ganho" : "perda";

        await tradeService.resolveOperation(
          operation.id,
          fallbackResult,
          operation.abertura,
        );
        await prisma.operationSettlementJob.update({
          where: { id: job.id },
          data: {
            status: "completed",
            processedAt: new Date(),
            lastError: `${lastError} | fallback:entry-price`,
          },
        });
        results.push({
          id: operation.id,
          resultado: fallbackResult,
          source: "fallback:entry-price",
          closePrice: operation.abertura,
        });
        continue;
      }

      await prisma.operationSettlementJob.update({
        where: { id: job.id },
        data: {
          status: "failed",
          startedAt: null,
          scheduledFor: new Date(Date.now() + retryDelayMs),
          lastError,
        },
      });
    }
  }

  return {
    settled: results.length,
    results,
  };
}
