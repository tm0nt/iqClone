import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { balanceService } from "@/lib/services/balance-service";

export async function POST() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const result = await balanceService.resetDemoBalance(session.userId);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Erro ao recarregar saldo demo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
