import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tradeOperations, tradingPairs } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAffiliateAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = await requireAffiliateAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.userId;

  try {
    const operations = await db
      .select({
        id: tradeOperations.id,
        ativo: tradeOperations.ativo,
        tipo: tradeOperations.tipo,
        data: tradeOperations.data,
        tempo: tradeOperations.tempo,
        previsao: tradeOperations.previsao,
        abertura: tradeOperations.abertura,
        valor: tradeOperations.valor,
        status: tradeOperations.status,
        resultado: tradeOperations.resultado,
        expiresAt: tradeOperations.expiresAt,
        pairLogo: tradingPairs.logo,
        pairName: tradingPairs.name,
      })
      .from(tradeOperations)
      .leftJoin(tradingPairs, eq(tradeOperations.pairId, tradingPairs.id))
      .where(
        and(
          eq(tradeOperations.userId, userId),
          eq(tradeOperations.executado, false),
        )
      )
      .orderBy(desc(tradeOperations.data));

    return NextResponse.json({ operations });
  } catch (err) {
    console.error("Erro ao buscar operações ativas:", err);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
