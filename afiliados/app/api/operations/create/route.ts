import { NextResponse } from "next/server";
import { tradeService } from "@/lib/services/trade-service";
import { requireAffiliateAuth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const auth = await requireAffiliateAuth();
    if (auth.error) return auth.error;

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

    let expiresAt: Date | undefined;
    if (payload.expiresAt) {
      expiresAt = new Date(payload.expiresAt);
    }

    const operation = await tradeService.createOperation({
      userId: auth.session.userId,
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
    const msg = error instanceof Error ? error.message : "Erro interno";
    const status = msg.includes("insuficiente") || msg.includes("inválido") ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
