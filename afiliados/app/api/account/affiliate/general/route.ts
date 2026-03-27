import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, deposits } from '@/db/schema';
import { eq, and, gte, lte, count, exists, not } from 'drizzle-orm';
import { requireAffiliateAuth } from '@/lib/auth';

// Função para calcular o total de novos usuários no período
const getNewUsers = async (userId: string, startDate: Date, endDate: Date) => {
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

// Função para calcular o total de usuários ativos no período
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

  const [totalResult] = await db
    .select({ count: count() })
    .from(users)
    .where(and(
      eq(users.affiliateId, userId),
      gte(users.createdAt, startDate),
      lte(users.createdAt, endDate),
    ));

  const totalUsers = totalResult?.count ?? 0;
  const churnedUsers = churnedResult?.count ?? 0;
  return totalUsers > 0 ? (churnedUsers / totalUsers) * 100 : 0;
};

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAffiliateAuth();
    if (auth.error) return auth.error;
    const userId = auth.session.userId;

    // Pegando parâmetros de data da query string
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const startDate = startDateParam ? new Date(startDateParam) : new Date();
    const endDate = endDateParam ? new Date(endDateParam) : new Date();

    // Validação das datas
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
      return NextResponse.json({ error: 'Intervalo de datas inválido' }, { status: 400 });
    }

    // Consultando as métricas para o usuário logado
    const newUsers = await getNewUsers(userId, startDate, endDate);
    const activeUsers = await getActiveUsers(userId, startDate, endDate);
    const churnRate = await getChurnRate(userId, startDate, endDate);

    // Preparando os dados para o gráfico
    const data = [
      { date: startDate.toISOString().split('T')[0], "Novos Usuários": newUsers, "Usuários Ativos": activeUsers, Churn: churnRate },
    ];

    return NextResponse.json(data);

  } catch (err) {
    console.error('Erro ao buscar métricas:', err);
    return NextResponse.json({ error: 'Erro ao calcular métricas' }, { status: 500 });
  }
}
