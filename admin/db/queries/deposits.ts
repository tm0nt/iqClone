import { db } from "@/db";
import { deposits, withdrawals, users } from "@/db/schema";
import { desc, eq, and, gte, lte, sql } from "drizzle-orm";

export async function getTransactions(opts: {
  startDate?: Date;
  endDate?: Date;
  take?: number;
  offset?: number;
} = {}) {
  const { startDate, endDate, take = 50, offset = 0 } = opts;

  const conditions = [];
  if (startDate) conditions.push(gte(deposits.dataCriacao, startDate));
  if (endDate) conditions.push(lte(deposits.dataCriacao, endDate));

  const depositRows = await db
    .select({
      id: deposits.id,
      tipo: sql<string>`'deposit'`.as("tipo"),
      valor: deposits.valor,
      status: deposits.status,
      data: deposits.dataCriacao,
      userId: deposits.userId,
      userName: users.nome,
      userEmail: users.email,
    })
    .from(deposits)
    .innerJoin(users, eq(deposits.userId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(deposits.dataCriacao))
    .limit(take)
    .offset(offset);

  return depositRows;
}

export async function getFinanceOverview(startDate: Date, endDate: Date) {
  const [depositData, withdrawalData] = await Promise.all([
    db
      .select({
        month: sql<string>`to_char(${deposits.dataCriacao}, 'YYYY-MM')`,
        total: sql<number>`coalesce(sum(${deposits.valor}), 0)`,
      })
      .from(deposits)
      .where(
        and(
          eq(deposits.status, "concluido"),
          gte(deposits.dataCriacao, startDate),
          lte(deposits.dataCriacao, endDate),
        ),
      )
      .groupBy(sql`to_char(${deposits.dataCriacao}, 'YYYY-MM')`),

    db
      .select({
        month: sql<string>`to_char(${withdrawals.dataPedido}, 'YYYY-MM')`,
        total: sql<number>`coalesce(sum(${withdrawals.valor}), 0)`,
      })
      .from(withdrawals)
      .where(
        and(
          eq(withdrawals.status, "concluido"),
          gte(withdrawals.dataPedido, startDate),
          lte(withdrawals.dataPedido, endDate),
        ),
      )
      .groupBy(sql`to_char(${withdrawals.dataPedido}, 'YYYY-MM')`),
  ]);

  return { deposits: depositData, withdrawals: withdrawalData };
}
