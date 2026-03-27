import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { clickEvents, users, deposits, affiliateCommissions } from '@/db/schema';
import { eq, and, gte, lte, sum, count, inArray } from 'drizzle-orm';
import { format } from "date-fns";
import { requireAffiliateAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await requireAffiliateAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.userId;

  // Pegando parâmetros de data
  const { searchParams } = request.nextUrl;
  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');

  const endDate = endDateParam ? new Date(endDateParam) : new Date();
  let startDate = startDateParam ? new Date(startDateParam) : new Date();

  if (!startDateParam) {
    startDate.setDate(startDate.getDate() - 30);
  }

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
    return NextResponse.json({ error: 'Intervalo de datas inválido' }, { status: 400 });
  }

  try {
    // Inicializa um array para armazenar os dados por dia
    let dataByDay = []

    // Iterar pelos dias do intervalo
    let currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const nextDate = new Date(currentDate)
      nextDate.setDate(nextDate.getDate() + 1)

      // Buscar IDs dos usuários afiliados para uso no filtro de depósitos
      const affiliateUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.affiliateId, userId));
      const affiliateUserIds = affiliateUsers.map(u => u.id);

      // Consultar os dados de cada dia
      const [visitantesUnicos, registros, primeiroDepositos, receita] = await Promise.all([
        // Contagem de visitantes únicos por dia
        db.select({ count: count() })
          .from(clickEvents)
          .where(and(
            eq(clickEvents.affiliateId, userId),
            gte(clickEvents.data, currentDate),
            lte(clickEvents.data, nextDate),
          ))
          .then(r => r[0]?.count ?? 0),

        // Contagem de registros de usuários por dia
        db.select({ count: count() })
          .from(users)
          .where(and(
            eq(users.affiliateId, userId),
            gte(users.createdAt, currentDate),
            lte(users.createdAt, nextDate),
          ))
          .then(r => r[0]?.count ?? 0),

        // Contagem de primeiro depósito por dia
        affiliateUserIds.length > 0
          ? db.select({ count: count() })
              .from(deposits)
              .where(and(
                inArray(deposits.userId, affiliateUserIds),
                eq(deposits.status, 'concluido'),
                gte(deposits.dataCriacao, currentDate),
                lte(deposits.dataCriacao, nextDate),
              ))
              .then(r => r[0]?.count ?? 0)
          : 0,

        // Soma das comissões por dia
        db.select({ total: sum(affiliateCommissions.valor) })
          .from(affiliateCommissions)
          .where(and(
            eq(affiliateCommissions.affiliateId, userId),
            gte(affiliateCommissions.data, currentDate),
            lte(affiliateCommissions.data, nextDate),
          ))
          .then(r => Number(r[0]?.total) || 0),
      ])

      // Adiciona os dados do dia no array
      dataByDay.push({
        date: format(currentDate, "yyyy-MM-dd"),
        uniqueVisitors: visitantesUnicos,
        registrations: registros,
        firstDeposits: primeiroDepositos,
        revenue: receita
      })

      // Avançar para o próximo dia
      currentDate = new Date(nextDate)
    }

    // Retorna os dados agrupados por dia
    return NextResponse.json(dataByDay);

  } catch (err) {
    console.error('Erro ao gerar métricas do afiliado:', err);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
