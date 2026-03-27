import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { deposits, withdrawals, configs } from "@/db/schema";
import { eq, and, gte, lte, sum } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin("SUPER_ADMIN", "ADMIN");
  if (auth.error) return auth.error;

  const { searchParams } = request.nextUrl;
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");
  const intervalParam = searchParams.get("interval") || "monthly";

  const endDate = endDateParam ? new Date(endDateParam) : new Date();
  let startDate = startDateParam ? new Date(startDateParam) : new Date();

  if (intervalParam === "monthly") {
    startDate.setMonth(endDate.getMonth() - 1);
  } else if (intervalParam === "quarterly") {
    startDate.setMonth(endDate.getMonth() - 3);
  } else if (intervalParam === "yearly") {
    startDate.setFullYear(endDate.getFullYear() - 1);
  }

  if (startDate.toDateString() === endDate.toDateString()) {
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
  } else {
    endDate.setHours(23, 59, 59, 999);
  }

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
    return NextResponse.json({ error: "Intervalo de datas inválido" }, { status: 400 });
  }

  try {
    const [config] = await db.select().from(configs).limit(1);
    const taxaSaque = config?.taxa ?? 10;

    const [totalDepositos] = await db
      .select({ total: sum(deposits.valor) })
      .from(deposits)
      .where(
        and(
          eq(deposits.status, "concluido"),
          gte(deposits.dataPagamento, startDate),
          lte(deposits.dataPagamento, endDate)
        )
      );

    const saquesConcluidos = await db
      .select({ valor: withdrawals.valor })
      .from(withdrawals)
      .where(
        and(
          eq(withdrawals.status, "concluido"),
          gte(withdrawals.dataPagamento, startDate),
          lte(withdrawals.dataPagamento, endDate)
        )
      );

    const totalSaquesComTaxa = saquesConcluidos.reduce(
      (total, saque) => total + (saque.valor - taxaSaque),
      0
    );

    return NextResponse.json({
      totalDepositoValor: Number(totalDepositos?.total) || 0,
      totalSaquesComTaxa,
    });
  } catch (err) {
    console.error("Erro ao gerar métricas:", err);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
