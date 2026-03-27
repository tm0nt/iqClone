import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { withdrawals, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("SUPER_ADMIN", "ADMIN");
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const [withdrawal] = await db
      .select({
        id: withdrawals.id,
        userId: withdrawals.userId,
        dataPedido: withdrawals.dataPedido,
        dataPagamento: withdrawals.dataPagamento,
        tipoChave: withdrawals.tipoChave,
        chave: withdrawals.chave,
        tipo: withdrawals.tipo,
        status: withdrawals.status,
        valor: withdrawals.valor,
        taxa: withdrawals.taxa,
        userName: users.nome,
        userEmail: users.email,
        userCpf: users.cpf,
      })
      .from(withdrawals)
      .leftJoin(users, eq(withdrawals.userId, users.id))
      .where(eq(withdrawals.id, id))
      .limit(1);

    if (!withdrawal) {
      return NextResponse.json({ error: "Saque não encontrado" }, { status: 404 });
    }

    return NextResponse.json(withdrawal);
  } catch (error) {
    console.error("Erro ao buscar saque:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
