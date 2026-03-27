import { db } from "@/db";
import { withdrawals, balances } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

/**
 * Repository para operações de Withdrawal no painel admin.
 */
export const withdrawalRepository = {
  async findAll(status?: string, cursor?: string, take = 50) {
    return db.query.withdrawals.findMany({
      where: status ? eq(withdrawals.status, status as any) : undefined,
      limit: take,
      columns: {
        id: true,
        userId: true,
        valor: true,
        taxa: true,
        status: true,
        tipoChave: true,
        chave: true,
        tipo: true,
        dataPedido: true,
        dataPagamento: true,
      },
      with: {
        user: {
          columns: { nome: true, email: true },
        },
      },
      orderBy: [desc(withdrawals.dataPedido)],
    });
  },

  async findById(id: string) {
    return db.query.withdrawals.findFirst({
      where: eq(withdrawals.id, id),
      columns: {
        id: true,
        userId: true,
        valor: true,
        taxa: true,
        status: true,
        tipoChave: true,
        chave: true,
      },
      with: {
        user: {
          columns: { nome: true, email: true },
        },
      },
    });
  },

  async approve(id: string) {
    const [withdrawal] = await db
      .update(withdrawals)
      .set({ status: "concluido", dataPagamento: new Date() })
      .where(eq(withdrawals.id, id))
      .returning();
    return withdrawal;
  },

  async reject(id: string) {
    return db.transaction(async (tx) => {
      const [withdrawal] = await tx
        .update(withdrawals)
        .set({ status: "cancelado" })
        .where(eq(withdrawals.id, id))
        .returning();

      if (!withdrawal) throw new Error("Withdrawal não encontrado");

      // Devolve o valor ao saldo do usuário
      await tx
        .update(balances)
        .set({
          saldoReal: sql`${balances.saldoReal} + ${withdrawal.valor}`,
        })
        .where(eq(balances.userId, withdrawal.userId));

      return withdrawal;
    });
  },
};
