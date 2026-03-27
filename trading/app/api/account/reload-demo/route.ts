import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function POST() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const updated = await prisma.balance.update({
    where: { userId: session.userId },
    data: {
      saldoDemo: 10000,
    },
  });

  return NextResponse.json({
    success: true,
    demoBalance: Number(updated.saldoDemo),
  });
}
