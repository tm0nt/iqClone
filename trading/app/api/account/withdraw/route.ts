// app/api/account/withdraw/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { formatUsd } from "@shared/platform/branding";
import {
  normalizeGatewayMethod,
  resolveGatewayForFlow,
} from "@/lib/gateways/index";
import { sendPlatformPostback } from "@/lib/services/platform-postback";

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;
    const userId = session.userId;

    const body = await request.json();
    const valor = Number(body.valor);
    const normalizedMethod = normalizeGatewayMethod(body.method);
    const tipoChave =
      body.tipoChave ||
      (normalizedMethod === "crypto"
        ? "wallet"
        : body.accountType || "bank_transfer");
    const chave =
      body.chave ||
      body.walletAddress ||
      [
        body.routingNumber,
        body.accountNumber,
        body.accountHolderName,
      ]
        .filter(Boolean)
        .join(" | ");

    if (!valor || !tipoChave || !chave) {
      return NextResponse.json(
        { error: "Dados incompletos. Preencha todos os campos." },
        { status: 400 },
      );
    }

    // 3. Obter configurações do sistema
    const config = await prisma.config.findUnique({
      where: { id: 1 },
      select: {
        valorMinimoSaque: true,
        taxa: true, // Usando o campo correto do seu schema
      },
    });

    const valorMinimoSaque = config?.valorMinimoSaque ?? 50.0;
    const taxaFixa = config?.taxa ?? 5.0; // Usando o campo taxa do schema

    // 4. Verificar valor mínimo de saque
    if (valor < valorMinimoSaque) {
      return NextResponse.json(
        {
          error: `Minimum withdrawal amount is ${formatUsd(valorMinimoSaque)}`,
        },
        { status: 400 },
      );
    }

    // 5. Verificar saldo real disponível
    const balance = await prisma.balance.findUnique({
      where: { userId },
      select: { saldoReal: true },
    });

    if (!balance) {
      return NextResponse.json(
        { error: "Saldo não encontrado" },
        { status: 400 },
      );
    }

    // Calculando valor total (valor solicitado + taxa fixa)
    const valorTotal = valor + taxaFixa;

    if (balance.saldoReal < valorTotal) {
      return NextResponse.json(
        {
          error: "Saldo insuficiente",
          detail: `Your real balance is ${formatUsd(balance.saldoReal)} and the requested amount plus fixed fee ${formatUsd(taxaFixa)} totals ${formatUsd(valorTotal)}.`,
        },
        { status: 400 },
      );
    }

    const gatewayMethod =
      normalizedMethod === "crypto" || body.walletAddress ? "crypto" : "pix";
    const gateway = await resolveGatewayForFlow({
      method: gatewayMethod,
      direction: "withdraw",
    });

    // 6. Criar registro de saque
    const withdrawal = await prisma.$transaction(async (prisma) => {
      // Atualizar saldo (decrementar valor total)
      await prisma.balance.update({
        where: { userId },
        data: { saldoReal: { decrement: valorTotal } },
      });

      // Criar registro de saque
      return await prisma.withdrawal.create({
        data: {
          userId,
          gatewayId: gateway?.id ?? null,
          valor,
          taxa: taxaFixa,
          tipoChave,
          chave,
          tipo: "usuario",
          status: "pendente",
          dataPedido: new Date(),
        },
      });
    });

    await sendPlatformPostback("withdraw", {
      withdrawalId: withdrawal.id,
      userId,
      amount: withdrawal.valor,
      fee: withdrawal.taxa,
      method: gatewayMethod,
      status: withdrawal.status,
    });

    // 7. Retornar resposta de sucesso
    return NextResponse.json({
      id: withdrawal.id,
      success: true,
      message: "Saque solicitado com sucesso",
      withdrawal: {
        ...withdrawal,
        valorLiquido: withdrawal.valor, // Valor líquido é igual ao valor solicitado
        dataPedido: withdrawal.dataPedido.toISOString(),
      },
      gateway: gateway
        ? {
            id: gateway.id,
            name: gateway.name,
            provider: gateway.provider,
          }
        : null,
      newBalance: balance.saldoReal - valorTotal,
      taxaAplicada: formatUsd(taxaFixa),
    });
  } catch (error) {
    console.error("Erro ao processar saque:", error);
    return NextResponse.json(
      {
        error: "Erro ao processar saque",
        detail: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}
