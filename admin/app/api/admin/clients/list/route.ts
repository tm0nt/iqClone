import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { users, balances } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin("SUPER_ADMIN", "ADMIN");
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  try {
    const [totalResult] = await db.select({ total: count() }).from(users);
    const total = totalResult!.total;

    const clients = await db
      .select({
        id: users.id,
        email: users.email,
        nome: users.nome,
        cpf: users.cpf,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        saldoDemo: balances.saldoDemo,
        saldoReal: balances.saldoReal,
        saldoComissao: balances.saldoComissao,
        balanceUpdatedAt: balances.updatedAt,
      })
      .from(users)
      .leftJoin(balances, eq(users.id, balances.userId))
      .orderBy(desc(users.createdAt))
      .offset((page - 1) * limit)
      .limit(limit);

    const formattedClients = clients.map((client) => ({
      id: client.id,
      email: client.email,
      nome: client.nome,
      cpf: client.cpf,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      saldoDemo: client.saldoDemo || 0,
      saldoReal: client.saldoReal || 0,
      saldoComissao: client.saldoComissao || 0,
      balanceUpdatedAt: client.balanceUpdatedAt || null,
    }));

    return NextResponse.json({ clients: formattedClients, total });
  } catch (err) {
    console.error("Erro ao buscar clientes:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor ao buscar clientes" },
      { status: 500 }
    );
  }
}
