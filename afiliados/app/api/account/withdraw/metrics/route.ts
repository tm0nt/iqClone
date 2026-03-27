import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { withdrawals } from "@/db/schema";
import { eq, and, sum, sql } from "drizzle-orm";
import { requireAffiliateAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = await requireAffiliateAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.userId;

  try {
    // Consultando os saques recebidos agrupados por mês
    const receivedWithdrawals = await db
      .select({
        month: sql<string>`to_char(${withdrawals.dataPedido}, 'MM')`,
        total: sum(withdrawals.valor),
      })
      .from(withdrawals)
      .where(and(eq(withdrawals.userId, userId), eq(withdrawals.status, 'concluido')))
      .groupBy(sql`to_char(${withdrawals.dataPedido}, 'MM')`)
      .orderBy(sql`to_char(${withdrawals.dataPedido}, 'MM')`);

    // Consultando os saques pendentes agrupados por mês
    const pendingWithdrawals = await db
      .select({
        month: sql<string>`to_char(${withdrawals.dataPedido}, 'MM')`,
        total: sum(withdrawals.valor),
      })
      .from(withdrawals)
      .where(and(eq(withdrawals.userId, userId), eq(withdrawals.status, 'pendente')))
      .groupBy(sql`to_char(${withdrawals.dataPedido}, 'MM')`)
      .orderBy(sql`to_char(${withdrawals.dataPedido}, 'MM')`);

    // Combinando os dados de recebidos e pendentes por mês
    const combinedData = [];
    for (let i = 1; i <= 12; i++) {
      const month = i < 10 ? `0${i}` : `${i}`;
      const received = receivedWithdrawals.find((data) => data.month === month);
      const pending = pendingWithdrawals.find((data) => data.month === month);

      combinedData.push({
        name: month,
        recebido: received ? Number(received.total) : 0,
        pendente: pending ? Number(pending.total) : 0,
      });
    }

    return NextResponse.json(combinedData);
  } catch (err) {
    console.error('Erro ao buscar dados de saques:', err);
    return NextResponse.json({ error: 'Erro ao buscar saques' }, { status: 500 });
  }
}
