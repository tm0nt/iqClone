import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyEligibleDepositBonus } from "@/lib/services/promotion-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const deposit = await prisma.deposit.findFirst({
      where: { transactionId: id },
      select: {
        userId: true,
        status: true,
        transactionId: true,
      },
    });

    if (deposit && deposit.status === "concluido") {
      const promotionBonus = await applyEligibleDepositBonus({
        userId: deposit.userId,
        transactionId: deposit.transactionId,
      });

      return NextResponse.json({
        status: true,
        bonusApplied: Boolean(promotionBonus),
        bonusAmount: promotionBonus?.bonusAmount ?? null,
        promotionTitle: promotionBonus?.promotionTitle ?? null,
      });
    } else {
      return NextResponse.json({ status: false });
    }
  } catch (error) {
    console.error("Erro ao verificar o status do depósito:", error);
    return NextResponse.json(
      { error: "Erro ao verificar o status do depósito" },
      { status: 500 },
    );
  }
}
