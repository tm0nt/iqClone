import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { withdrawals, users } from "@/db/schema";
import { eq, and, gte, lte, sum, count } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin("SUPER_ADMIN", "ADMIN");
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");

  const now = new Date();
  const defaultStartDate = new Date(now.setDate(now.getDate() - 30));
  const startDate = startDateParam ? new Date(startDateParam) : defaultStartDate;
  const endDate = endDateParam ? new Date(endDateParam) : new Date();
  if (startDate.toDateString() === endDate.toDateString()) {
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
  } else {
    endDate.setHours(23, 59, 59, 999);
  }

  try {
    const dateFilter = and(
      gte(withdrawals.dataPedido, startDate),
      lte(withdrawals.dataPedido, endDate)
    );

    const [totalRow] = await db.select({ c: count() }).from(withdrawals).where(dateFilter);

    const [totalPaidValue] = await db
      .select({ total: sum(withdrawals.valor) })
      .from(withdrawals)
      .where(and(dateFilter, eq(withdrawals.status, "concluido")));

    const [totalPendingValue] = await db
      .select({ total: sum(withdrawals.valor) })
      .from(withdrawals)
      .where(and(dateFilter, eq(withdrawals.status, "pendente")));

    const [totalPaidRow] = await db
      .select({ c: count() })
      .from(withdrawals)
      .where(and(dateFilter, eq(withdrawals.status, "concluido")));

    const [totalPendingRow] = await db
      .select({ c: count() })
      .from(withdrawals)
      .where(and(dateFilter, eq(withdrawals.status, "pendente")));

    const items = await db
      .select({
        id: withdrawals.id,
        status: withdrawals.status,
        tipo: withdrawals.tipo,
        valor: withdrawals.valor,
        chave: withdrawals.chave,
        tipoChave: withdrawals.tipoChave,
        dataPedido: withdrawals.dataPedido,
        dataPagamento: withdrawals.dataPagamento,
        userId: users.id,
        nome: users.nome,
        email: users.email,
      })
      .from(withdrawals)
      .leftJoin(users, eq(withdrawals.userId, users.id))
      .where(dateFilter)
      .orderBy(withdrawals.dataPedido)
      .offset((page - 1) * limit)
      .limit(limit);

    const formattedWithdrawals = items.map((w) => ({
      id: w.id,
      status: w.status,
      tipo: w.tipo,
      valor: w.valor,
      chave: w.chave,
      tipoChave: w.tipoChave,
      email: w.email,
      dataPedido: w.dataPedido,
      dataPagamento: w.dataPagamento,
      nomeCliente: w.nome,
      idCliente: w.userId,
    }));

    const paidVal = Number(totalPaidValue?.total) || 0;
    const pendingVal = Number(totalPendingValue?.total) || 0;

    return NextResponse.json({
      withdrawals: formattedWithdrawals,
      total: totalRow?.c ?? 0,
      totalPaid: totalPaidRow?.c ?? 0,
      totalPending: totalPendingRow?.c ?? 0,
      totalPaidValue: paidVal,
      totalPendingValue: pendingVal,
      totalValue: paidVal + pendingVal,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  } catch (err) {
    console.error("Erro ao buscar retiradas:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor ao buscar retiradas" },
      { status: 500 }
    );
  }
}
