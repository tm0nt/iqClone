import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tradeOperations, tradingPairs } from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { requireAffiliateAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = await requireAffiliateAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.userId;

  const { searchParams } = request.nextUrl;
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");
  const pageParam = searchParams.get("page");
  const limitParam = searchParams.get("limit");

  const page = Math.max(1, parseInt(pageParam || "1"));
  const limit = Math.min(100, parseInt(limitParam || "20"));
  const offset = (page - 1) * limit;

  const endDate = endDateParam ? new Date(endDateParam) : new Date();
  let startDate = startDateParam ? new Date(startDateParam) : new Date();
  if (!startDateParam) startDate.setDate(startDate.getDate() - 30);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
    return NextResponse.json({ error: "Intervalo de datas inválido" }, { status: 400 });
  }

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
        fechamento: tradeOperations.fechamento,
        valor: tradeOperations.valor,
        receita: tradeOperations.receita,
        status: tradeOperations.status,
        resultado: tradeOperations.resultado,
        estornado: tradeOperations.estornado,
        pairLogo: tradingPairs.logo,
        pairName: tradingPairs.name,
      })
      .from(tradeOperations)
      .leftJoin(tradingPairs, eq(tradeOperations.pairId, tradingPairs.id))
      .where(
        and(
          eq(tradeOperations.userId, userId),
          eq(tradeOperations.executado, true),
          gte(tradeOperations.data, startDate),
          lte(tradeOperations.data, endDate),
        )
      )
      .orderBy(desc(tradeOperations.data))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ operations, page, limit });
  } catch (err) {
    console.error("Erro ao buscar histórico de operações:", err);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
