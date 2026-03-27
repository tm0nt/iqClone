import { NextResponse } from "next/server";
import { tradeService } from "@/lib/services/trade-service";
import { ApiError } from "@/lib/errors";
import { requireAuth } from "@/lib/auth/session";
import { ensureSettlementWorkerLoop } from "@/lib/services/settlement-worker";

export const runtime = "nodejs";

ensureSettlementWorkerLoop();

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;
    const payload = await request.json();

    const requiredFields = ["tipo", "ativo", "tempo", "previsao", "vela", "abertura", "valor"];

    for (const field of requiredFields) {
      if (!(field in payload)) {
        return NextResponse.json(
          { error: `Campo obrigatório ausente: ${field}` },
          { status: 400 },
        );
      }
    }

    // Compute expiresAt from the payload
    let expiresAt: Date | undefined;
    if (payload.expiresAt) {
      expiresAt = new Date(payload.expiresAt);
    }

    const operation = await tradeService.createOperation({
      userId: session.userId,
      tipo: payload.tipo,
      ativo: payload.ativo,
      tempo: payload.tempo,
      previsao: payload.previsao,
      vela: payload.vela,
      abertura: Number(payload.abertura),
      valor: Number(payload.valor),
      expiresAt,
    });

    return NextResponse.json({
      id: operation.id,
      expiresAt: operation.expiresAt,
      receita: operation.receita,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }
    console.error("Erro ao registrar operação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
