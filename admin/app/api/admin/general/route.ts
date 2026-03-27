import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getDashboardStats } from "@/db/queries";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin("SUPER_ADMIN", "ADMIN");
  if (auth.error) return auth.error;

  const { searchParams } = request.nextUrl;
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");

  const endDate = endDateParam ? new Date(endDateParam) : new Date();
  let startDate = startDateParam ? new Date(startDateParam) : new Date();

  if (!startDateParam) {
    startDate.setDate(startDate.getDate() - 30);
  }

  if (startDate.toDateString() === endDate.toDateString()) {
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
  } else {
    endDate.setHours(23, 59, 59, 999);
  }

  if (
    isNaN(startDate.getTime()) ||
    isNaN(endDate.getTime()) ||
    startDate > endDate
  ) {
    return NextResponse.json(
      { error: "Intervalo de datas inválido" },
      { status: 400 },
    );
  }

  try {
    const stats = await getDashboardStats(startDate, endDate);
    return NextResponse.json(stats);
  } catch (err) {
    console.error("Erro ao gerar métricas:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
