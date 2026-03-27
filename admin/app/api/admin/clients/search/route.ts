import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, balances, deposits, withdrawals } from "@/db/schema";
import { eq, sum, and } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin("SUPER_ADMIN", "ADMIN");
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("userId");

  if (!clientId) {
    return NextResponse.json(
      { error: "ID do cliente não fornecido" },
      { status: 400 }
    );
  }

  try {
    const [client] = await db
      .select()
      .from(users)
      .where(eq(users.id, clientId))
      .limit(1);

    if (!client) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    const [balance] = await db
      .select()
      .from(balances)
      .where(eq(balances.userId, clientId))
      .limit(1);

    const [depositSum] = await db
      .select({ total: sum(deposits.valor) })
      .from(deposits)
      .where(and(eq(deposits.userId, clientId), eq(deposits.status, "concluido")));

    const [withdrawalSum] = await db
      .select({ total: sum(withdrawals.valor) })
      .from(withdrawals)
      .where(and(eq(withdrawals.userId, clientId), eq(withdrawals.status, "concluido")));

    const response = {
      id: client.id,
      name: client.nome,
      email: client.email,
      cpf: client.cpf,
      phone: client.telefone,
      birthDate: client.dataNascimento,
      documentType: client.documentoTipo,
      documentNumber: client.documentoNumero,
      realBalance: balance?.saldoReal || 0,
      demoBalance: balance?.saldoDemo || 0,
      commissionBalance: balance?.saldoComissao || 0,
      totalDeposited: Number(depositSum?.total) || 0,
      totalWithdrawn: Number(withdrawalSum?.total) || 0,
      status: "active",
      registrationDate: client.createdAt,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
