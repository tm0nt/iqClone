import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    // Buscar as operações do usuário no banco de dados
    const operations = await prisma.tradeOperation.findMany({
      where: { userId: session.userId },
      orderBy: {
        data: "desc", // Ordena as operações pela data, do mais recente para o mais antigo
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

    // Se não encontrar nenhuma operação
    if (!operations || operations.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma operação encontrada" },
        { status: 404 },
      );
    }

    // Retorna as operações
    return NextResponse.json({
      operations: operations.map((op) => ({
        id: op.id,
        ativo: op.ativo,
        tempo: op.tempo,
        previsao: op.previsao,
        vela: op.vela,
        tipo: op.tipo,
        abertura: op.abertura,
        fechamento: op.fechamento,
        valor: op.valor,
        status: op.status,
        resultado: op.resultado,
        receita: op.receita,
        data: op.data.toISOString(), // Formato ISO para facilitar o uso no frontend
        resolvedAt: op.resolvedAt?.toISOString() ?? null,
        expiresAt: op.expiresAt?.toISOString() ?? null,
        durationSeconds: op.durationSeconds ?? 0,
      })),
    });
  } catch (error) {
    console.error("Erro ao processar a requisição:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
