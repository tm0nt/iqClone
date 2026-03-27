import { NextResponse } from "next/server";
import { db } from "@/db";
import { operationSettlementJobs, tradeOperations } from "@/db/schema";
import { eq, and, lte, inArray } from "drizzle-orm";
import { tradeService } from "@/lib/services/trade-service";

function isCryptoSymbol(symbol: string): boolean {
  const s = symbol.toUpperCase();
  return /USDT$|BUSD$|BTC$|ETH$|BNB$/.test(s);
}

function determineResult(previsao: string, abertura: number, fechamento: number): boolean {
  return previsao === "call" ? fechamento > abertura : fechamento < abertura;
}

async function fetchBinancePrice(symbol: string): Promise<number> {
  const pair = symbol.toUpperCase();
  try {
    const res = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${pair}`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (res.ok) {
      const data = await res.json();
      const price = parseFloat(data.price);
      if (!isNaN(price) && price > 0) return price;
    }
  } catch {}

  // DB fallback
  const [lastOp] = await db
    .select({ fechamento: tradeOperations.fechamento })
    .from(tradeOperations)
    .where(eq(tradeOperations.ativo, symbol))
    .orderBy(tradeOperations.data)
    .limit(1);
  if (lastOp?.fechamento) return lastOp.fechamento;
  throw new Error(`Cannot fetch price for ${symbol}`);
}

async function fetchITickPrice(symbol: string): Promise<number> {
  const pair = symbol.toUpperCase().replace("/", "");
  const itickKey = process.env.NEXT_PUBLIC_ITICK_API_KEY;

  if (itickKey && itickKey !== "your-api-key-here") {
    try {
      const res = await fetch(
        `https://api.itick.org/forex/quote?symbol=${pair}$GB&token=${itickKey}`,
        { signal: AbortSignal.timeout(5000) },
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.data?.ld) return data.data.ld;
        if (data?.data?.c) return data.data.c;
      }
    } catch {}
  }

  // DB fallback
  const [lastOp] = await db
    .select({ fechamento: tradeOperations.fechamento })
    .from(tradeOperations)
    .where(eq(tradeOperations.ativo, symbol))
    .orderBy(tradeOperations.data)
    .limit(1);
  if (lastOp?.fechamento) return lastOp.fechamento;
  throw new Error(`Cannot fetch price for ${symbol}`);
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("x-settle-secret");
    const settleSecret = process.env.SETTLE_SECRET;
    if (settleSecret && authHeader !== settleSecret) {
      const cookieHeader = request.headers.get("cookie") ?? "";
      if (!cookieHeader.includes("session=")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const dueJobs = await db
      .select()
      .from(operationSettlementJobs)
      .where(
        and(
          inArray(operationSettlementJobs.status, ["pending", "failed"]),
          lte(operationSettlementJobs.scheduledFor, new Date()),
        ),
      )
      .orderBy(operationSettlementJobs.scheduledFor)
      .limit(50);

    if (dueJobs.length === 0) {
      return NextResponse.json({ settled: 0 });
    }

    const results: Array<{ id: string; resultado: string; source: string }> = [];

    for (const job of dueJobs) {
      try {
        // Claim job
        await db
          .update(operationSettlementJobs)
          .set({
            status: "processing",
            startedAt: new Date(),
            attempts: (job.attempts ?? 0) + 1,
            lastError: null,
          })
          .where(eq(operationSettlementJobs.id, job.id));

        // Get operation
        const [op] = await db
          .select()
          .from(tradeOperations)
          .where(eq(tradeOperations.id, job.operationId))
          .limit(1);

        if (!op || op.resultado !== "pendente") {
          await db
            .update(operationSettlementJobs)
            .set({ status: "completed", processedAt: new Date() })
            .where(eq(operationSettlementJobs.id, job.id));
          continue;
        }

        const isCrypto = isCryptoSymbol(op.ativo);
        const closePrice = isCrypto
          ? await fetchBinancePrice(op.ativo)
          : await fetchITickPrice(op.ativo);

        const isWin = determineResult(op.previsao, op.abertura, closePrice);
        const resultado = isWin ? "ganho" : "perda";

        await tradeService.resolveOperation(op.id, resultado, closePrice);
        await db
          .update(operationSettlementJobs)
          .set({ status: "completed", processedAt: new Date(), lastError: null })
          .where(eq(operationSettlementJobs.id, job.id));

        results.push({ id: op.id, resultado, source: isCrypto ? "binance" : "itick" });
      } catch (err) {
        console.error(`[settle] Error settling operation ${job.operationId}:`, err);
        await db
          .update(operationSettlementJobs)
          .set({
            status: "failed",
            lastError: err instanceof Error ? err.message : "Unknown error",
          })
          .where(eq(operationSettlementJobs.id, job.id));
      }
    }

    return NextResponse.json({ settled: results.length, results });
  } catch (error) {
    console.error("[settle] Worker error:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
