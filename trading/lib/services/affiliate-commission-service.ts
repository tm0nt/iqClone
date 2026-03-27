import { CommissionStatus, TipoComissao } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  calculateCPACommission,
  calculateNegativeRevShareCommission,
  calculateRevShareCommission,
  normalizeCommissionType,
} from "@shared/affiliate/service";

async function getAffiliateContext(referredUserId: string) {
  const referredUser = await prisma.user.findUnique({
    where: { id: referredUserId },
    select: { affiliateId: true },
  });

  if (!referredUser?.affiliateId) {
    return null;
  }

  const affiliate = await prisma.affiliate.findUnique({
    where: { userId: referredUser.affiliateId },
    select: {
      id: true,
      userId: true,
      tipoComissao: true,
    },
  });

  if (!affiliate?.tipoComissao || !normalizeCommissionType(affiliate.tipoComissao)) {
    return null;
  }

  return affiliate;
}

export async function processAffiliateCPAOnDeposit(input: {
  referredUserId: string;
  depositId: string;
  amount: number;
}) {
  const affiliate = await getAffiliateContext(input.referredUserId);
  if (!affiliate || affiliate.tipoComissao !== TipoComissao.cpa) {
    return;
  }

  const config = await prisma.config.findFirst({
    select: { cpaMin: true, cpaValor: true },
  });

  if (!config) {
    return;
  }

  const commissionValue = calculateCPACommission(input.amount, config);
  if (commissionValue <= 0) {
    return;
  }

  const existingCommission = await prisma.affiliateCommission.findFirst({
    where: {
      affiliateId: affiliate.id,
      depositId: input.depositId,
      tipo: TipoComissao.cpa,
    },
    select: { id: true },
  });

  if (existingCommission) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.affiliateCommission.create({
      data: {
        affiliateId: affiliate.id,
        userId: input.referredUserId,
        depositId: input.depositId,
        tipo: TipoComissao.cpa,
        valor: commissionValue,
        descricao: "CPA do primeiro deposito aprovado",
        status: CommissionStatus.paga,
      },
    });

    await tx.balance.update({
      where: { userId: affiliate.userId },
      data: { saldoComissao: { increment: commissionValue } },
    });
  });
}

export async function processAffiliateRevShareOnLoss(input: {
  referredUserId: string;
  operationId: string;
  amount: number;
}) {
  const affiliate = await getAffiliateContext(input.referredUserId);
  if (!affiliate || affiliate.tipoComissao !== TipoComissao.revShare) {
    return;
  }

  const config = await prisma.config.findFirst({
    select: { revShareValue: true },
  });

  if (!config || config.revShareValue <= 0) {
    return;
  }

  const existingCommission = await prisma.affiliateCommission.findFirst({
    where: {
      affiliateId: affiliate.id,
      operationId: input.operationId,
      tipo: TipoComissao.revShare,
    },
    select: { id: true },
  });

  if (existingCommission) {
    return;
  }

  const commissionValue = calculateRevShareCommission(input.amount, config);
  if (commissionValue <= 0) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.affiliateCommission.create({
      data: {
        affiliateId: affiliate.id,
        userId: input.referredUserId,
        operationId: input.operationId,
        tipo: TipoComissao.revShare,
        valor: commissionValue,
        percentual: config.revShareValue,
        descricao: "Revenue share sobre operacao perdida",
        status: CommissionStatus.paga,
      },
    });

    await tx.balance.update({
      where: { userId: affiliate.userId },
      data: { saldoComissao: { increment: commissionValue } },
    });
  });
}

export async function processAffiliateRevShareOnWin(input: {
  referredUserId: string;
  operationId: string;
  amount: number;
}) {
  const affiliate = await getAffiliateContext(input.referredUserId);
  if (!affiliate || affiliate.tipoComissao !== TipoComissao.revShare) {
    return;
  }

  const config = await prisma.config.findFirst({
    select: { revShareValue: true, revShareNegativo: true },
  });

  if (!config || (config.revShareValue <= 0 && !config.revShareNegativo)) {
    return;
  }

  const existingCommission = await prisma.affiliateCommission.findFirst({
    where: {
      affiliateId: affiliate.id,
      operationId: input.operationId,
      tipo: TipoComissao.revShare,
    },
    select: { id: true },
  });

  if (existingCommission) {
    return;
  }

  const commissionValue = calculateNegativeRevShareCommission(
    input.amount,
    config,
  );
  if (commissionValue <= 0) {
    return;
  }

  const percentual =
    typeof config.revShareNegativo === "number"
      ? config.revShareNegativo
      : config.revShareValue;

  await prisma.$transaction(async (tx) => {
    await tx.affiliateCommission.create({
      data: {
        affiliateId: affiliate.id,
        userId: input.referredUserId,
        operationId: input.operationId,
        tipo: TipoComissao.revShare,
        valor: -commissionValue,
        percentual,
        descricao: "Revenue share negativo sobre operacao vencedora",
        status: CommissionStatus.paga,
      },
    });

    await tx.balance.update({
      where: { userId: affiliate.userId },
      data: { saldoComissao: { decrement: commissionValue } },
    });
  });
}
