import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/account/operations/search?id=<uuid>
 *
 * Settles an operation with a result (ganho/perda).
 * Protected by authentication; validates operation ownership.
 */
export async function PATCH(request: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const userId = session.userId;

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID da operação não fornecido" },
        { status: 400 },
      );
    }

    const { tipo, resultado, fechamento } = await request.json();

    if (!["demo", "real"].includes(tipo)) {
      return NextResponse.json(
        { error: "Tipo de saldo inválido" },
        { status: 400 },
      );
    }

    if (!["perda", "ganho"].includes(resultado)) {
      return NextResponse.json(
        { error: "Resultado inválido" },
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
        { error: "Operação não encontrada" },
        { status: 404 },
      );
    }

    if (operation.userId !== userId) {
      return NextResponse.json(
        { error: "Operação não pertence ao usuário" },
        { status: 403 },
      );
    }

    // Prevent re-settlement
    if (operation.resultado && operation.resultado !== "pendente") {
      return NextResponse.json(
        { error: "Operação já foi liquidada" },
        { status: 400 },
      );
    }

    // Find user balance
    const balance = await prisma.balance.findUnique({
      where: { userId },
    });

    if (!balance) {
      return NextResponse.json(
        { error: "Saldo não encontrado" },
        { status: 404 },
      );
    }

    if (resultado === "perda") {
      await prisma.tradeOperation.update({
        where: { id },
        data: {
          fechamento,
          resultado,
          resolvedAt: new Date(),
          status: "perda",
          executado: true,
        },
      });
      return NextResponse.json({
        message: "Sem alteração no saldo devido à perda",
        saldoAtualizado: {
          tipo,
          saldo: tipo === "demo" ? balance.saldoDemo : balance.saldoReal,
        },
      });
    }

    // ganho: credit balance with valor + receita
    const tradeOperation = await prisma.tradeOperation.findUnique({
      where: { id },
    });

    if (!tradeOperation) {
      return NextResponse.json(
        { error: "Operação não encontrada" },
        { status: 404 },
      );
    }

    const valorReceita = tradeOperation.valor + tradeOperation.receita;

    let novoSaldo: number;
    if (tipo === "demo") {
      novoSaldo = balance.saldoDemo + valorReceita;
      await prisma.balance.update({
        where: { userId },
        data: { saldoDemo: novoSaldo },
      });
    } else {
      novoSaldo = balance.saldoReal + valorReceita;
      await prisma.balance.update({
        where: { userId },
        data: { saldoReal: novoSaldo },
      });
    }

    await prisma.tradeOperation.update({
      where: { id },
      data: {
        fechamento,
        resultado,
        resolvedAt: new Date(),
        status: "ganho",
        executado: true,
      },
    });

    return NextResponse.json({
      message: "Saldo atualizado com sucesso",
      saldoAtualizado: { tipo, saldo: novoSaldo },
    });
  } catch (error) {
    console.error("Erro ao atualizar saldo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
