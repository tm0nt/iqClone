import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function PATCH(request: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { valor, tipo, operacao } = await request.json();

    if (!["demo", "real"].includes(tipo)) {
      return NextResponse.json(
        { error: "Tipo de saldo inválido" },
        { status: 400 },
      );
    }

    if (!["increase", "decrease"].includes(operacao)) {
      return NextResponse.json({ error: "Operação inválida" }, { status: 400 });
    }

    if (typeof valor !== "number" || valor <= 0) {
      return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
    }

    // Buscar saldo atual
    const balance = await prisma.balance.findUnique({
      where: { userId: session.userId },
    });

    if (!balance) {
      return NextResponse.json(
        { error: "Saldo não encontrado" },
        { status: 404 },
      );
    }

    // Definir novo saldo
    let novoSaldo;
    if (tipo === "demo") {
      novoSaldo =
        operacao === "increase"
          ? balance.saldoDemo + valor
          : balance.saldoDemo - valor;

      if (novoSaldo < 0) novoSaldo = 0;

      await prisma.balance.update({
        where: { userId: session.userId },
        data: { saldoDemo: novoSaldo },
      });
    } else {
      novoSaldo =
        operacao === "increase"
          ? balance.saldoReal + valor
          : balance.saldoReal - valor;

      if (novoSaldo < 0) novoSaldo = 0;

      await prisma.balance.update({
        where: { userId: session.userId },
        data: { saldoReal: novoSaldo },
      });
    }

    return NextResponse.json({
      message: "Saldo atualizado com sucesso",
      saldoAtualizado: {
        tipo,
        saldo: novoSaldo,
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar saldo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
