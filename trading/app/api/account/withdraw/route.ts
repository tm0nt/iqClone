import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { withdrawalService } from "@/lib/services/withdrawal-service";
import { ApiError } from "@/lib/errors";
import { normalizeGatewayMethod } from "@/lib/gateways/index";
import { sendPlatformPostback } from "@/lib/services/platform-postback";

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

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
      [body.routingNumber, body.accountNumber, body.accountHolderName]
        .filter(Boolean)
        .join(" | ");

    const gatewayMethod =
      normalizedMethod === "crypto" || body.walletAddress ? "crypto" : "pix";

    const result = await withdrawalService.createWithdrawal({
      userId: session.userId,
      valor,
      tipoChave,
      chave,
      gatewayMethod,
    });

    await sendPlatformPostback("withdraw", {
      withdrawalId: result.withdrawal.id,
      userId: session.userId,
      amount: result.withdrawal.valor,
      fee: result.withdrawal.taxa,
      method: gatewayMethod,
      status: result.withdrawal.status,
    });

    return NextResponse.json({
      id: result.withdrawal.id,
      success: true,
      message: "Saque solicitado com sucesso",
      withdrawal: {
        ...result.withdrawal,
        valorLiquido: result.withdrawal.valor,
        dataPedido: result.withdrawal.dataPedido?.toISOString?.() ?? new Date().toISOString(),
      },
      gateway: result.gateway,
      newBalance: result.newBalance,
      taxaAplicada: result.taxaFormatted,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message, detail: error.details },
        { status: error.statusCode },
      );
    }
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
