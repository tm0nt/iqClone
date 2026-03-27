import { db } from "@/db";
import { users, balances, deposits, withdrawals } from "@/db/schema";
import { eq, desc, ilike, or, count, gte, lte, and } from "drizzle-orm";

const clientSelectFields = {
  id: users.id,
  email: users.email,
  nome: users.nome,
  cpf: users.cpf,
  telefone: users.telefone,
  kyc: users.kyc,
  createdAt: users.createdAt,
} as const;

export async function getClients(opts: { cursor?: string; take?: number } = {}) {
  const { take = 50 } = opts;

  // Drizzle doesn't have native cursor pagination like Prisma.
  // We use a subquery approach: fetch clients ordered by createdAt desc, then join balance.
  const rows = await db
    .select({
      ...clientSelectFields,
      saldoReal: balances.saldoReal,
      saldoDemo: balances.saldoDemo,
    })
    .from(users)
    .leftJoin(balances, eq(users.id, balances.userId))
    .orderBy(desc(users.createdAt))
    .limit(take);

  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    nome: r.nome,
    cpf: r.cpf,
    telefone: r.telefone,
    kyc: r.kyc,
    createdAt: r.createdAt,
    balance: r.saldoReal != null ? { saldoReal: r.saldoReal, saldoDemo: r.saldoDemo! } : null,
  }));
}

export async function searchClients(query: string) {
  const rows = await db
    .select({
      ...clientSelectFields,
      saldoReal: balances.saldoReal,
      saldoDemo: balances.saldoDemo,
    })
    .from(users)
    .leftJoin(balances, eq(users.id, balances.userId))
    .where(
      or(
        ilike(users.nome, `%${query}%`),
        ilike(users.email, `%${query}%`),
        ilike(users.cpf, `%${query}%`),
      ),
    )
    .limit(50);

  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    nome: r.nome,
    cpf: r.cpf,
    telefone: r.telefone,
    kyc: r.kyc,
    createdAt: r.createdAt,
    balance: r.saldoReal != null ? { saldoReal: r.saldoReal, saldoDemo: r.saldoDemo! } : null,
  }));
}

export async function getClientById(id: string) {
  const userRows = await db
    .select({
      id: users.id,
      email: users.email,
      nome: users.nome,
      cpf: users.cpf,
      telefone: users.telefone,
      nacionalidade: users.nacionalidade,
      kyc: users.kyc,
      createdAt: users.createdAt,
      saldoReal: balances.saldoReal,
      saldoDemo: balances.saldoDemo,
      saldoComissao: balances.saldoComissao,
    })
    .from(users)
    .leftJoin(balances, eq(users.id, balances.userId))
    .where(eq(users.id, id))
    .limit(1);

  if (!userRows[0]) return null;
  const u = userRows[0];

  // Fetch recent deposits and withdrawals in parallel (avoids N+1)
  const [recentDeposits, recentWithdrawals] = await Promise.all([
    db
      .select({
        id: deposits.id,
        valor: deposits.valor,
        status: deposits.status,
        dataCriacao: deposits.dataCriacao,
      })
      .from(deposits)
      .where(eq(deposits.userId, id))
      .orderBy(desc(deposits.dataCriacao))
      .limit(10),
    db
      .select({
        id: withdrawals.id,
        valor: withdrawals.valor,
        taxa: withdrawals.taxa,
        status: withdrawals.status,
        dataPedido: withdrawals.dataPedido,
      })
      .from(withdrawals)
      .where(eq(withdrawals.userId, id))
      .orderBy(desc(withdrawals.dataPedido))
      .limit(10),
  ]);

  return {
    id: u.id,
    email: u.email,
    nome: u.nome,
    cpf: u.cpf,
    telefone: u.telefone,
    nacionalidade: u.nacionalidade,
    kyc: u.kyc,
    createdAt: u.createdAt,
    balance:
      u.saldoReal != null
        ? { saldoReal: u.saldoReal, saldoDemo: u.saldoDemo!, saldoComissao: u.saldoComissao! }
        : null,
    deposits: recentDeposits,
    withdrawals: recentWithdrawals,
  };
}

export async function getClientOverview() {
  const now = new Date();
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

  const [totalResult, newResult] = await Promise.all([
    db.select({ total: count() }).from(users),
    db.select({ total: count() }).from(users).where(gte(users.createdAt, oneMonthAgo)),
  ]);

  return {
    totalClientes: totalResult[0]!.total,
    novosClientes: newResult[0]!.total,
  };
}

export async function deleteClient(id: string) {
  return db.delete(users).where(eq(users.id, id));
}

export async function updateClient(
  id: string,
  data: Partial<{
    nome: string;
    email: string;
    cpf: string;
    telefone: string;
    nacionalidade: string;
    kyc: "APPROVED" | "PENDING" | "REJECT";
  }>,
) {
  const rows = await db
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning({ id: users.id });

  return rows[0] ?? null;
}
