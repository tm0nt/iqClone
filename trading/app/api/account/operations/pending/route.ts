import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { ensureSettlementWorkerLoop } from "@/lib/services/settlement-worker";

export const runtime = "nodejs";

ensureSettlementWorkerLoop();

/**
 * GET /api/account/operations/pending
 *
 * Returns all operations belonging to the current user that have been
 * settled (resultado != 'pendente') in the last 60 seconds, so the
 * frontend can finalize them. Also returns still-pending operations
 * so the client can resume timers after a page reload.
 */
export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const recentCutoff = new Date(Date.now() - 60_000);

    const operations = await prisma.tradeOperation.findMany({
      where: {
        userId: session.userId,
        OR: [
          { resultado: "pendente" },
          {
            resultado: { in: ["ganho", "perda"] },
            resolvedAt: { gte: recentCutoff },
          },
        ],
      },
      orderBy: [{ expiresAt: "asc" }, { resolvedAt: "desc" }, { data: "desc" }],
      take: 200,
      select: {
        id: true,
        ativo: true,
        previsao: true,
        valor: true,
        receita: true,
        abertura: true,
        fechamento: true,
        tempo: true,
        data: true,
        resultado: true,
        tipo: true,
        status: true,
        expiresAt: true,
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

    return NextResponse.json(operations);
  } catch (error) {
    console.error("Erro ao buscar operações pendentes:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
