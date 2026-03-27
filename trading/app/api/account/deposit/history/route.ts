import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    // Fetch user deposits from database
    const deposits = await prisma.deposit.findMany({
      where: { userId: session.userId },
      orderBy: {
        dataCriacao: "desc", // Order by creation date (newest first)
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

    // If no deposits found
    if (!deposits || deposits.length === 0) {
      return NextResponse.json([], { status: 200 }); // Return empty array instead of error
    }

    // Format and return deposits
    return NextResponse.json(
      deposits.map((deposit) => ({
        id: deposit.id,
        tipo: deposit.tipo,
        valor: deposit.valor,
        status: deposit.status,
        dataCriacao: deposit.dataCriacao.toISOString(),
        dataPagamento: deposit.dataPagamento?.toISOString() || null,
        user: {
          id: deposit.user.id,
          nome: deposit.user.nome,
          email: deposit.user.email,
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
