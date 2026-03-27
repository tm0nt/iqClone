import { db } from "@/db";
import { withdrawals, balances, users } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function getWithdrawals(opts: {
  status?: string;
  take?: number;
} = {}) {
  const { status, take = 50 } = opts;

  const query = db
    .select({
      id: withdrawals.id,
      userId: withdrawals.userId,
      valor: withdrawals.valor,
      taxa: withdrawals.taxa,
      status: withdrawals.status,
      tipoChave: withdrawals.tipoChave,
      chave: withdrawals.chave,
      tipo: withdrawals.tipo,
      dataPedido: withdrawals.dataPedido,
      dataPagamento: withdrawals.dataPagamento,
      userName: users.nome,
      userEmail: users.email,
    })
    .from(withdrawals)
    .innerJoin(users, eq(withdrawals.userId, users.id))
    .orderBy(desc(withdrawals.dataPedido))
    .limit(take);

  if (status) {
    return query.where(eq(withdrawals.status, status as any));
  }

  return query;
}

export async function getWithdrawalById(id: string) {
  const rows = await db
    .select({
      id: withdrawals.id,
      userId: withdrawals.userId,
      valor: withdrawals.valor,
      taxa: withdrawals.taxa,
      status: withdrawals.status,
      tipoChave: withdrawals.tipoChave,
      chave: withdrawals.chave,
      userName: users.nome,
      userEmail: users.email,
    })
    .from(withdrawals)
    .innerJoin(users, eq(withdrawals.userId, users.id))
    .where(eq(withdrawals.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export async function approveWithdrawal(id: string) {
  const rows = await db
    .update(withdrawals)
    .set({ status: "concluido", dataPagamento: new Date() })
    .where(eq(withdrawals.id, id))
    .returning();

  return rows[0] ?? null;
}

export async function rejectWithdrawal(id: string) {
  // Transaction: cancel withdrawal and refund balance
  return db.transaction(async (tx) => {
    const [withdrawal] = await tx
      .update(withdrawals)
      .set({ status: "cancelado" })
      .where(eq(withdrawals.id, id))
      .returning();

    if (!withdrawal) throw new Error("Saque não encontrado");

    await tx
      .update(balances)
      .set({ saldoReal: sql`${balances.saldoReal} + ${withdrawal.valor}` })
      .where(eq(balances.userId, withdrawal.userId));

    return withdrawal;
  });
}
