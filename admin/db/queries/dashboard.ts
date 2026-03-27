import { db } from "@/db";
import { deposits, withdrawals, users } from "@/db/schema";
import { eq, and, gte, lte, count, sum, sql } from "drizzle-orm";

export interface DashboardStats {
  totalDepositoValor: number;
  totalSaquesComTaxa: number;
  totalSaquesPendentes: number;
  saquesPendentesCount: number;
  totalClientes: number;
  crescimentoClientes: number;
}

/**
 * Dashboard stats em uma única função otimizada.
 * Executa queries em paralelo para evitar N+1.
 */
export async function getDashboardStats(
  startDate: Date,
  endDate: Date,
): Promise<DashboardStats> {
  const [
    depositResult,
    withdrawalResult,
    pendingResult,
    pendingCountResult,
    clientResult,
    prevMonthClientResult,
  ] = await Promise.all([
    // Total de depósitos concluídos
    db
      .select({ total: sum(deposits.valor) })
      .from(deposits)
      .where(
        and(
          eq(deposits.status, "concluido"),
          gte(deposits.dataPagamento, startDate),
          lte(deposits.dataPagamento, endDate),
        ),
      ),

    // Saques concluídos (valor - taxa para cada)
    db
      .select({
        totalValor: sum(deposits.valor),
        totalComTaxa: sql<number>`coalesce(sum(${withdrawals.valor} - 10), 0)`,
      })
      .from(withdrawals)
      .where(
        and(
          eq(withdrawals.status, "concluido"),
          gte(withdrawals.dataPagamento, startDate),
          lte(withdrawals.dataPagamento, endDate),
        ),
      ),

    // Saques pendentes (valor)
    db
      .select({ total: sum(withdrawals.valor) })
      .from(withdrawals)
      .where(
        and(
          eq(withdrawals.status, "pendente"),
          gte(withdrawals.dataPedido, startDate),
          lte(withdrawals.dataPedido, endDate),
        ),
      ),

    // Saques pendentes (count)
    db
      .select({ total: count() })
      .from(withdrawals)
      .where(
        and(
          eq(withdrawals.status, "pendente"),
          gte(withdrawals.dataPedido, startDate),
          lte(withdrawals.dataPedido, endDate),
        ),
      ),

    // Total clientes no período
    db
      .select({ total: count() })
      .from(users)
      .where(and(gte(users.createdAt, startDate), lte(users.createdAt, endDate))),

    // Clientes mês anterior
    (() => {
      const prevStart = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
      const prevEnd = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
      return db
        .select({ total: count() })
        .from(users)
        .where(and(gte(users.createdAt, prevStart), lte(users.createdAt, prevEnd)));
    })(),
  ]);

  const totalClientes = clientResult[0]!.total;
  const clientesMesAnterior = prevMonthClientResult[0]!.total;
  const crescimentoClientes =
    clientesMesAnterior > 0
      ? ((totalClientes - clientesMesAnterior) / clientesMesAnterior) * 100
      : 0;

  return {
    totalDepositoValor: Number(depositResult[0]?.total) || 0,
    totalSaquesComTaxa: Number(withdrawalResult[0]?.totalComTaxa) || 0,
    totalSaquesPendentes: Number(pendingResult[0]?.total) || 0,
    saquesPendentesCount: pendingCountResult[0]!.total,
    totalClientes,
    crescimentoClientes,
  };
}
