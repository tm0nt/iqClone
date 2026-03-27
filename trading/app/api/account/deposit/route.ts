import { NextRequest, NextResponse } from "next/server";
import {
  getGatewayHandler,
  normalizeGatewayMethod,
  resolveGatewayForFlow,
} from "@/lib/gateways/index";
import { sendPlatformPostback } from "@/lib/services/platform-postback";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const amount = Number(body.amount);
    const name = body.name || body.accountHolderName || body.cardHolder || "";
    const cpf = body.cpf || body.ssn || "";
    const email = body.email || "";
    const method = normalizeGatewayMethod(body.method);

    if (!amount || !name || !cpf || !method) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const gateway = await resolveGatewayForFlow({
      method,
      direction: "deposit",
    });

    if (!gateway) {
      await sendPlatformPostback("deposit", {
        amount,
        method,
        email,
        status: "provider_missing",
      });
      return NextResponse.json(
        { error: "Nenhum provedor de pagamento configurado para esse método." },
        { status: 503 },
      );
    }

    const handlerParams: any = {
      amount,
      name,
      cpf,
      email,
      method,
      idGateway: gateway.id,
    };

    if (method === "credit") {
      const expiry = typeof body.card?.expiry === "string" ? body.card.expiry : "";
      const [expirationMonth = "", expirationYear = ""] = expiry.split("/");
      handlerParams.card = body.card
        ? {
            number: body.card.number,
            holderName: body.card.holderName,
            expirationMonth,
            expirationYear: expirationYear.length === 2 ? `20${expirationYear}` : expirationYear,
            cvv: body.card.cvv,
          }
        : null;
      handlerParams.installments = Number(body.installments || 1);
    }

    const resposta = await getGatewayHandler(handlerParams);

    await sendPlatformPostback("deposit", {
      amount,
      method,
      email,
      gatewayId: gateway.id,
      gatewayProvider: gateway.provider,
      status: "created",
    });

    return NextResponse.json(resposta);
  } catch (error) {
    console.error("Erro no processamento do depósito:", error);
    return NextResponse.json({ error: "Erro ao processar depósito" }, { status: 500 });
  }
}
