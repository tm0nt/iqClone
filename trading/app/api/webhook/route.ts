import { NextRequest, NextResponse } from "next/server";

export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      message:
        "Nenhum webhook de provedor de pagamento está ativo nesta instalação.",
    },
    { status: 410 },
  );
}
