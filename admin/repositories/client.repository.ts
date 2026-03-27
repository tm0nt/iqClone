import { db } from "@/db";
import { users, balances } from "@/db/schema";
import { eq, ilike, or, desc, count, gte, sql } from "drizzle-orm";

/**
 * Repository para operações de Client (User) no painel admin.
 */
export const clientRepository = {
  async findAll(cursor?: string, take = 50) {
    return db.query.users.findMany({
      limit: take,
      ...(cursor ? { offset: 1 } : {}),
      columns: {
        id: true,
        email: true,
        nome: true,
        cpf: true,
        telefone: true,
        kyc: true,
        createdAt: true,
      },
      with: {
        balance: {
          columns: { saldoReal: true, saldoDemo: true },
        },
      },
      orderBy: [desc(users.createdAt)],
    });
  },

  async search(query: string) {
    return db.query.users.findMany({
      where: or(
        ilike(users.nome, `%${query}%`),
        ilike(users.email, `%${query}%`),
        sql`${users.cpf} LIKE ${`%${query}%`}`,
      ),
      columns: {
        id: true,
        email: true,
        nome: true,
        cpf: true,
        telefone: true,
        kyc: true,
        createdAt: true,
      },
      with: {
        balance: {
          columns: { saldoReal: true, saldoDemo: true },
        },
      },
      limit: 50,
    });
  },

  async findById(id: string) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        id: true,
        email: true,
        nome: true,
        cpf: true,
        telefone: true,
        nacionalidade: true,
        kyc: true,
        createdAt: true,
      },
      with: {
        balance: {
          columns: { saldoReal: true, saldoDemo: true, saldoComissao: true },
        },
        deposits: {
          columns: { id: true, valor: true, status: true, dataCriacao: true },
          orderBy: (deposits, { desc }) => [desc(deposits.dataCriacao)],
          limit: 10,
        },
        withdrawals: {
          columns: {
            id: true,
            valor: true,
            taxa: true,
            status: true,
            dataPedido: true,
          },
          orderBy: (withdrawals, { desc }) => [desc(withdrawals.dataPedido)],
          limit: 10,
        },
      },
    });
  },

  async overview() {
    const oneMonthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1));
    const [totalResult, novosResult] = await Promise.all([
      db.select({ value: count() }).from(users),
      db
        .select({ value: count() })
        .from(users)
        .where(gte(users.createdAt, oneMonthAgo)),
    ]);
    return {
      totalClientes: totalResult[0]?.value ?? 0,
      novosClientes: novosResult[0]?.value ?? 0,
    };
  },

  async delete(id: string) {
    const [user] = await db.delete(users).where(eq(users.id, id)).returning();
    return user;
  },
};
