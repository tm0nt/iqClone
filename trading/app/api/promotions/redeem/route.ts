import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { redeemPromotion } from "@/lib/services/promotion-service";
import { ApiError } from "@/lib/errors";

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const promotionId = String(body.promotionId || "").trim();

    if (!promotionId) {
      return NextResponse.json(
        { error: "Promoção inválida." },
        { status: 400 },
      );
    }

    const redemption = await redeemPromotion(session.userId, promotionId);
    return NextResponse.json({
      id: redemption.id,
      promotionId: redemption.promotionId,
      status: redemption.status,
      redeemedAt: redemption.redeemedAt,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    console.error("Erro ao resgatar promoção:", error);
    return NextResponse.json(
      { error: "Não foi possível resgatar a promoção." },
      { status: 500 },
    );
  }
}
