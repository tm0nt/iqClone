import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { listPromotionsForUser } from "@/lib/services/promotion-service";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const promotions = await listPromotionsForUser(session.userId);
    return NextResponse.json(promotions);
  } catch (error) {
    console.error("Erro ao carregar promoções:", error);
    return NextResponse.json(
      { error: "Não foi possível carregar as promoções." },
      { status: 500 },
    );
  }
}
