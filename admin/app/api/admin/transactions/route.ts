import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { deposits, withdrawals, users } from "@/db/schema";
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
  const type = searchParams.get("type") || "all";
  const status = searchParams.get("status") || "all";

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
    const statuses = ["pendente", "processando", "concluido", "cancelado"] as const;

    const fetchDeposits = async () => {
      const dateFilter = and(
        gte(deposits.dataCriacao, startDate),
        lte(deposits.dataCriacao, endDate)
      );
      const statusFilter = status !== "all"
        ? and(dateFilter, eq(deposits.status, status as any))
        : dateFilter;

      const [totalRow] = await db.select({ c: count() }).from(deposits).where(statusFilter!);

      const countsByStatus = await Promise.all(
        statuses.map(async (s) => {
          const [row] = await db
            .select({ c: count(), v: sum(deposits.valor) })
            .from(deposits)
            .where(and(dateFilter, eq(deposits.status, s)));
          return { status: s, count: row?.c ?? 0, value: Number(row?.v) || 0 };
        })
      );

      const items = await db
        .select({
          id: deposits.id,
          transactionId: deposits.transactionId,
          status: deposits.status,
          tipo: deposits.tipo,
          valor: deposits.valor,
          dataCriacao: deposits.dataCriacao,
          dataPagamento: deposits.dataPagamento,
          userId: users.id,
          nome: users.nome,
          email: users.email,
        })
        .from(deposits)
        .leftJoin(users, eq(deposits.userId, users.id))
        .where(statusFilter!)
        .orderBy(deposits.dataCriacao)
        .offset((page - 1) * limit)
        .limit(limit);

      const byStatus = Object.fromEntries(countsByStatus.map((c) => [c.status, c]));

      return {
        total: totalRow?.c ?? 0,
        totalProcessing: byStatus.processando?.count ?? 0,
        totalCompleted: byStatus.concluido?.count ?? 0,
        totalPending: byStatus.pendente?.count ?? 0,
        totalCanceled: byStatus.cancelado?.count ?? 0,
        totalProcessingValue: byStatus.processando?.value ?? 0,
        totalCompletedValue: byStatus.concluido?.value ?? 0,
        totalPendingValue: byStatus.pendente?.value ?? 0,
        totalCanceledValue: byStatus.cancelado?.value ?? 0,
        totalValue: countsByStatus.reduce((s, c) => s + c.value, 0),
        items: items.map((item) => ({
          id: item.id,
          transactionId: item.transactionId,
          type: "deposit",
          status: item.status,
          tipo: item.tipo,
          valor: item.valor,
          data: item.dataCriacao,
          dataPagamento: item.dataPagamento,
          email: item.email,
          nomeCliente: item.nome,
          idCliente: item.userId,
        })),
      };
    };

    const fetchWithdrawals = async () => {
      const dateFilter = and(
        gte(withdrawals.dataPedido, startDate),
        lte(withdrawals.dataPedido, endDate)
      );
      const statusFilter = status !== "all"
        ? and(dateFilter, eq(withdrawals.status, status as any))
        : dateFilter;

      const [totalRow] = await db.select({ c: count() }).from(withdrawals).where(statusFilter!);

      const countsByStatus = await Promise.all(
        statuses.map(async (s) => {
          const [row] = await db
            .select({ c: count(), v: sum(withdrawals.valor) })
            .from(withdrawals)
            .where(and(dateFilter, eq(withdrawals.status, s)));
          return { status: s, count: row?.c ?? 0, value: Number(row?.v) || 0 };
        })
      );

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
        .where(statusFilter!)
        .orderBy(withdrawals.dataPedido)
        .offset((page - 1) * limit)
        .limit(limit);

      const byStatus = Object.fromEntries(countsByStatus.map((c) => [c.status, c]));

      return {
        total: totalRow?.c ?? 0,
        totalProcessing: byStatus.processando?.count ?? 0,
        totalCompleted: byStatus.concluido?.count ?? 0,
        totalPending: byStatus.pendente?.count ?? 0,
        totalCanceled: byStatus.cancelado?.count ?? 0,
        totalProcessingValue: byStatus.processando?.value ?? 0,
        totalCompletedValue: byStatus.concluido?.value ?? 0,
        totalPendingValue: byStatus.pendente?.value ?? 0,
        totalCanceledValue: byStatus.cancelado?.value ?? 0,
        totalValue: countsByStatus.reduce((s, c) => s + c.value, 0),
        items: items.map((item) => ({
          id: item.id,
          type: "withdrawal",
          status: item.status,
          tipo: item.tipo,
          valor: item.valor,
          chave: item.chave,
          tipoChave: item.tipoChave,
          data: item.dataPedido,
          dataPagamento: item.dataPagamento,
          email: item.email,
          nomeCliente: item.nome,
          idCliente: item.userId,
        })),
      };
    };

    let depositsData, withdrawalsData;

    if (type === "all" || type === "deposit") {
      depositsData = await fetchDeposits();
    }

    if (type === "all" || type === "withdrawal") {
      withdrawalsData = await fetchWithdrawals();
    }

    return NextResponse.json({
      deposits: type === "all" || type === "deposit" ? depositsData?.items : [],
      withdrawals: type === "all" || type === "withdrawal" ? withdrawalsData?.items : [],
      totals: {
        deposits: depositsData || null,
        withdrawals: withdrawalsData || null,
      },
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  } catch (err) {
    console.error("Erro ao buscar transações:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor ao buscar transações" },
      { status: 500 }
    );
  }
}
