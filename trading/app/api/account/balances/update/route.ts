import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { balanceService } from "@/lib/services/balance-service";
import { ApiError } from "@/lib/errors";

export async function PATCH(request: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { valor, tipo, operacao } = await request.json();

    if (!["demo", "real"].includes(tipo)) {
      return NextResponse.json(
        { error: "Tipo de saldo invalido" },
        { status: 400 },
      );
    }

    if (!["increase", "decrease"].includes(operacao)) {
      return NextResponse.json({ error: "Operacao invalida" }, { status: 400 });
    }

    if (typeof valor !== "number" || valor <= 0) {
      return NextResponse.json({ error: "Valor invalido" }, { status: 400 });
    }

    const result = await balanceService.updateBalance(
      session.userId,
      tipo,
      operacao,
      valor,
    );

    return NextResponse.json({
      message: "Saldo atualizado com sucesso",
      saldoAtualizado: result,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }
    console.error("Erro ao atualizar saldo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
