import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    // Fetch user withdrawals from database
    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId: session.userId },
      orderBy: {
        dataPedido: "desc", // Order by request date (newest first)
      },
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    // If no withdrawals found, return empty array
    if (!withdrawals || withdrawals.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Format and return withdrawals
    return NextResponse.json(
      withdrawals.map((withdrawal) => ({
        id: withdrawal.id,
        tipoChave: withdrawal.tipoChave,
        chave: withdrawal.chave,
        valor: withdrawal.valor,
        taxa: withdrawal.taxa,
        valorLiquido: withdrawal.valor - withdrawal.taxa, // Calculated field
        status: withdrawal.status,
        dataPedido: withdrawal.dataPedido.toISOString(),
        dataPagamento: withdrawal.dataPagamento?.toISOString() || null,
        user: {
          id: withdrawal.user.id,
          nome: withdrawal.user.nome,
          email: withdrawal.user.email,
        },
      })),
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao processar a requisição:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
