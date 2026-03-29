import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { balanceService } from "@/lib/services/balance-service";

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const data = await balanceService.getUserBalanceInfo(session.userId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao processar a requisicao:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
