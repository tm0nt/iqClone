import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, deposits } from "@/db/schema";
import { eq, and, gte, lte, count, exists, not } from "drizzle-orm";
import { requireAffiliateAuth } from "@/lib/auth";

// Função para calcular o total de afiliados
const getTotalAffiliates = async (userId: string, startDate: Date, endDate: Date) => {
  const [result] = await db
    .select({ count: count() })
    .from(users)
    .where(and(
      eq(users.affiliateId, userId),
      gte(users.createdAt, startDate),
      lte(users.createdAt, endDate),
    ));
  return result?.count ?? 0;
};

// Função para calcular o total de novos afiliados
const getNewAffiliates = async (userId: string, date: Date) => {
  const [result] = await db
    .select({ count: count() })
    .from(users)
    .where(and(
      eq(users.affiliateId, userId),
      gte(users.createdAt, date),
    ));
  return result?.count ?? 0;
};

// Função para calcular o total de usuários ativos (que fizeram ao menos 1 depósito no período)
const getActiveUsers = async (userId: string, startDate: Date, endDate: Date) => {
  const [result] = await db
    .select({ count: count() })
    .from(users)
    .where(and(
      eq(users.affiliateId, userId),
      exists(
        db.select({ id: deposits.id })
          .from(deposits)
          .where(and(
            eq(deposits.userId, users.id),
            gte(deposits.dataCriacao, startDate),
            lte(deposits.dataCriacao, endDate),
          ))
      ),
    ));
  return result?.count ?? 0;
};

// Função para calcular o churn rate
const getChurnRate = async (userId: string, startDate: Date, endDate: Date) => {
  const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30));

  const [churnedResult] = await db
    .select({ count: count() })
    .from(users)
    .where(and(
      eq(users.affiliateId, userId),
      lte(users.createdAt, thirtyDaysAgo),
      not(exists(
        db.select({ id: deposits.id })
          .from(deposits)
          .where(and(
            eq(deposits.userId, users.id),
            gte(deposits.dataCriacao, startDate),
            lte(deposits.dataCriacao, endDate),
          ))
      )),
    ));

  const totalUsers = await getTotalAffiliates(userId, startDate, endDate);
  const churnedUsers = churnedResult?.count ?? 0;
  return totalUsers > 0 ? (churnedUsers / totalUsers) * 100 : 0;
};

export async function GET(request: Request) {
  try {
    const auth = await requireAffiliateAuth();
    if (auth.error) return auth.error;
    const userId = auth.session.userId;

    const today = new Date();

    // Calculando o mês atual e o mês anterior
    const currMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const prevMonthStart = new Date(currMonthStart.getFullYear(), currMonthStart.getMonth() - 1, 1);
    const prevMonthEnd = new Date(currMonthStart.getTime() - 1);

    // Cálculos para o mês atual
    const totalAffiliates = await getTotalAffiliates(userId, currMonthStart, today);
    const newAffiliates = await getNewAffiliates(userId, currMonthStart);
    const activeUsers = await getActiveUsers(userId, currMonthStart, today);
    const churnRate = await getChurnRate(userId, currMonthStart, today);

    // Cálculos para o mês anterior
    const totalAffiliatesLastMonth = await getTotalAffiliates(userId, prevMonthStart, prevMonthEnd);
    const percentageChangeTotalAffiliates = totalAffiliatesLastMonth > 0
      ? ((totalAffiliates - totalAffiliatesLastMonth) / totalAffiliatesLastMonth) * 100
      : 0;

    const newAffiliatesLastMonth = await getNewAffiliates(userId, prevMonthStart);
    const percentageChangeNewAffiliates = newAffiliatesLastMonth > 0
      ? ((newAffiliates - newAffiliatesLastMonth) / newAffiliatesLastMonth) * 100
      : 0;

    const churnRateLastMonth = await getChurnRate(userId, prevMonthStart, prevMonthEnd);
    const percentageChangeChurnRate = churnRateLastMonth > 0
      ? ((churnRate - churnRateLastMonth) / churnRateLastMonth) * 100
      : 0;

    // Retorno dos dados
    return NextResponse.json({
      totalAffiliates,
      newAffiliates,
      activeUsers,
      churnRate,
      percentageChangeTotalAffiliates,
      percentageChangeNewAffiliates,
      percentageChangeChurnRate,
    });
  } catch (err) {
    console.error("Erro ao calcular métricas:", err);
    return NextResponse.json({ error: "Erro ao calcular métricas" }, { status: 500 });
  }
}
