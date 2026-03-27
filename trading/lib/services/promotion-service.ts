import {
  Prisma,
  PromotionRedemptionStatus,
  PromotionType,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/errors";

type PromotionWithUserRedemption = Prisma.PromotionGetPayload<{
  include: {
    redemptions: true;
    _count: {
      select: { redemptions: true };
    };
  };
}>;

type PromotionRedemptionWithPromotion = Prisma.PromotionRedemptionGetPayload<{
  include: { promotion: true };
}>;

function getActivePromotionWindow(now = new Date()) {
  return {
    isActive: true,
    AND: [
      {
        OR: [{ validFrom: null }, { validFrom: { lte: now } }],
      },
      {
        OR: [{ validUntil: null }, { validUntil: { gte: now } }],
      },
    ],
  } satisfies Prisma.PromotionWhereInput;
}

function calculateDepositBonusAmount(input: {
  amount: number;
  bonusPercent: number | null;
  bonusFixedAmount: number | null;
  maxBonusAmount: number | null;
}) {
  const percentAmount =
    input.bonusPercent && input.bonusPercent > 0
      ? input.amount * (input.bonusPercent / 100)
      : 0;
  const fixedAmount =
    input.bonusFixedAmount && input.bonusFixedAmount > 0
      ? input.bonusFixedAmount
      : 0;

  const rawBonus = percentAmount + fixedAmount;
  if (rawBonus <= 0) {
    return 0;
  }

  if (input.maxBonusAmount && input.maxBonusAmount > 0) {
    return Math.min(rawBonus, input.maxBonusAmount);
  }

  return rawBonus;
}

export async function listPromotionsForUser(userId: string) {
  const now = new Date();
  const promotions = await prisma.promotion.findMany({
    where: getActivePromotionWindow(now),
    include: {
      redemptions: {
        where: { userId },
        take: 1,
        orderBy: { redeemedAt: "desc" },
      },
      _count: {
        select: { redemptions: true },
      },
    },
    orderBy: [{ validUntil: "asc" }, { createdAt: "desc" }],
  });

  return promotions.map((promotion: PromotionWithUserRedemption) => {
    const redemption = promotion.redemptions[0] ?? null;
    const redemptionStatus =
      redemption?.status === PromotionRedemptionStatus.active &&
      redemption.expiresAt &&
      redemption.expiresAt.getTime() < now.getTime()
        ? PromotionRedemptionStatus.expired
        : redemption?.status ?? null;

    const claimsLeft =
      promotion.maxClaimsTotal != null
        ? Math.max(promotion.maxClaimsTotal - promotion._count.redemptions, 0)
        : null;

    return {
      id: promotion.id,
      slug: promotion.slug,
      title: promotion.title,
      description: promotion.description,
      rulesText: promotion.rulesText,
      type: promotion.type,
      bonusPercent: promotion.bonusPercent,
      bonusFixedAmount: promotion.bonusFixedAmount,
      maxBonusAmount: promotion.maxBonusAmount,
      revenueMultiplier: promotion.revenueMultiplier,
      minDepositAmount: promotion.minDepositAmount,
      maxClaimsTotal: promotion.maxClaimsTotal,
      validFrom: promotion.validFrom,
      validUntil: promotion.validUntil,
      isActive: promotion.isActive,
      redeemed: Boolean(redemption),
      redemptionStatus,
      redeemedAt: redemption?.redeemedAt ?? null,
      rewardValue: redemption?.rewardValue ?? null,
      claimsLeft,
    };
  });
}

export async function redeemPromotion(userId: string, promotionId: string) {
  const now = new Date();
  const promotion = await prisma.promotion.findFirst({
    where: {
      id: promotionId,
      ...getActivePromotionWindow(now),
    },
    include: {
      _count: {
        select: { redemptions: true },
      },
    },
  });

  if (!promotion) {
    throw ApiError.notFound("Promoção não encontrada ou indisponível.");
  }

  if (
    promotion.maxClaimsTotal != null &&
    promotion._count.redemptions >= promotion.maxClaimsTotal
  ) {
    throw ApiError.badRequest("Essa promoção atingiu o limite de resgates.");
  }

  const existing = await prisma.promotionRedemption.findUnique({
    where: {
      promotionId_userId: {
        promotionId,
        userId,
      },
    },
  });

  if (existing) {
    throw ApiError.badRequest("Essa promoção já foi resgatada por você.");
  }

  return prisma.promotionRedemption.create({
    data: {
      userId,
      promotionId,
      status: PromotionRedemptionStatus.active,
      expiresAt: promotion.validUntil ?? null,
    },
    include: {
      promotion: true,
    },
  });
}

export async function getActiveRevenueMultiplierForUser(userId: string) {
  const now = new Date();
  const redemptions = await prisma.promotionRedemption.findMany({
    where: {
      userId,
      status: PromotionRedemptionStatus.active,
      promotion: {
        type: PromotionType.revenue_multiplier,
        ...getActivePromotionWindow(now),
      },
      OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
    },
    include: {
      promotion: true,
    },
    orderBy: { redeemedAt: "asc" },
  });

  if (redemptions.length === 0) {
    return null;
  }

  const best = redemptions.reduce(
    (
      currentBest: PromotionRedemptionWithPromotion,
      redemption: PromotionRedemptionWithPromotion,
    ) => {
      const currentMultiplier = currentBest.promotion.revenueMultiplier ?? 1;
      const nextMultiplier = redemption.promotion.revenueMultiplier ?? 1;
      return nextMultiplier > currentMultiplier ? redemption : currentBest;
    },
    redemptions[0] as PromotionRedemptionWithPromotion,
  );

  return best;
}

export async function applyEligibleDepositBonus(params: {
  userId: string;
  transactionId: string;
}) {
  const now = new Date();
  const deposit = await prisma.deposit.findFirst({
    where: {
      userId: params.userId,
      transactionId: params.transactionId,
      status: "concluido",
    },
    select: {
      userId: true,
      transactionId: true,
      valor: true,
    },
  });

  if (!deposit) {
    return null;
  }

  const candidate = await prisma.promotionRedemption.findFirst({
    where: {
      userId: params.userId,
      status: PromotionRedemptionStatus.active,
      appliedReference: null,
      OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
      promotion: {
        type: PromotionType.deposit_bonus,
        ...getActivePromotionWindow(now),
        OR: [
          { minDepositAmount: null },
          { minDepositAmount: { lte: deposit.valor } },
        ],
      },
    },
    include: {
      promotion: true,
    },
    orderBy: { redeemedAt: "asc" },
  });

  if (!candidate) {
    return null;
  }

  const bonusAmount = calculateDepositBonusAmount({
    amount: deposit.valor,
    bonusPercent: candidate.promotion.bonusPercent,
    bonusFixedAmount: candidate.promotion.bonusFixedAmount,
    maxBonusAmount: candidate.promotion.maxBonusAmount,
  });

  if (bonusAmount <= 0) {
    return null;
  }

  return prisma.$transaction(async (tx) => {
    const freshRedemption = await tx.promotionRedemption.findUnique({
      where: { id: candidate.id },
      include: { promotion: true },
    });

    if (
      !freshRedemption ||
      freshRedemption.status !== PromotionRedemptionStatus.active ||
      freshRedemption.appliedReference
    ) {
      return null;
    }

    await tx.balance.update({
      where: { userId: params.userId },
      data: {
        saldoReal: {
          increment: bonusAmount,
        },
      },
    });

    const updated = await tx.promotionRedemption.update({
      where: { id: freshRedemption.id },
      data: {
        status: PromotionRedemptionStatus.consumed,
        consumedAt: now,
        appliedReference: deposit.transactionId,
        rewardValue: bonusAmount,
      },
    });

    return {
      bonusAmount,
      redemptionId: updated.id,
      promotionTitle: freshRedemption.promotion.title,
    };
  });
}
