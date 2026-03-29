import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { tradeService } from "@/lib/services/trade-service";
import { ApiError } from "@/lib/errors";

/**
 * PATCH /api/account/operations/search?id=<uuid>
 *
 * Settles an operation with a result (ganho/perda).
 * Delegates to tradeService.resolveOperation() for atomic settlement.
 */
export async function PATCH(request: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID da operacao nao fornecido" },
        { status: 400 },
      );
    }

    const { tipo, resultado, fechamento } = await request.json();

    if (!["demo", "real"].includes(tipo)) {
      return NextResponse.json(
        { error: "Tipo de saldo invalido" },
        { status: 400 },
      );
    }

    if (!["perda", "ganho"].includes(resultado)) {
      return NextResponse.json(
        { error: "Resultado invalido" },
        { status: 400 },
      );
    }

    // Validate operation ownership
    const operation = await prisma.tradeOperation.findUnique({
      where: { id },
      select: { userId: true, resultado: true },
    });

    if (!operation) {
      return NextResponse.json(
        { error: "Operacao nao encontrada" },
        { status: 404 },
      );
    }

    if (operation.userId !== session.userId) {
      return NextResponse.json(
        { error: "Operacao nao pertence ao usuario" },
        { status: 403 },
      );
    }

    // Delegate to service (atomic settlement with race-condition protection)
    const resolved = await tradeService.resolveOperation(
      id,
      resultado,
      fechamento,
    );

    if (!resolved) {
      return NextResponse.json(
        { error: "Operacao ja foi liquidada" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      message: "Operacao liquidada com sucesso",
      saldoAtualizado: { tipo },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }
    console.error("Erro ao liquidar operacao:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
