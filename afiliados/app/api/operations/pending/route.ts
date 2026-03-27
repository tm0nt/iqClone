import { NextResponse } from "next/server";
import { db } from "@/db";
import { tradeOperations } from "@/db/schema";
import { eq, and, or, gte, inArray } from "drizzle-orm";
import { requireAffiliateAuth } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await requireAffiliateAuth();
    if (auth.error) return auth.error;

    const recentCutoff = new Date(Date.now() - 60_000);

    const operations = await db
      .select({
        id: tradeOperations.id,
        ativo: tradeOperations.ativo,
        previsao: tradeOperations.previsao,
        valor: tradeOperations.valor,
        receita: tradeOperations.receita,
        abertura: tradeOperations.abertura,
        fechamento: tradeOperations.fechamento,
        tempo: tradeOperations.tempo,
        data: tradeOperations.data,
        resultado: tradeOperations.resultado,
        tipo: tradeOperations.tipo,
        status: tradeOperations.status,
        expiresAt: tradeOperations.expiresAt,
      })
      .from(tradeOperations)
      .where(
        and(
          eq(tradeOperations.userId, auth.session.userId),
          or(
            eq(tradeOperations.resultado, "pendente"),
            and(
              inArray(tradeOperations.resultado, ["ganho", "perda"]),
              gte(tradeOperations.data, recentCutoff),
            ),
          ),
        ),
      )
      .orderBy(tradeOperations.data)
      .limit(50);

    return NextResponse.json(operations);
  } catch (error) {
    console.error("Erro ao buscar operações pendentes:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
