import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, affiliates, deposits, affiliateCommissions } from '@/db/schema';
import { eq, and, sum, inArray, asc } from 'drizzle-orm';
import { sumAffiliateCommissionValues } from '@shared/affiliate/service';
import { requireAffiliateAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await requireAffiliateAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.userId;

  try {
    const [affiliate] = await db
      .select({ id: affiliates.id })
      .from(affiliates)
      .where(eq(affiliates.userId, userId))
      .limit(1);

    if (!affiliate) {
      return NextResponse.json([], { status: 200 });
    }

    // Buscar todos os usuários onde affiliateId é igual ao userId
    const affiliateUsers = await db
      .select({ id: users.id, nome: users.nome, email: users.email })
      .from(users)
      .where(eq(users.affiliateId, userId));

    // Inicializa um array para armazenar os dados de cada usuário
    let data = [];

    for (const user of affiliateUsers) {
      const { id: affUserId, nome, email } = user;

      // Buscar o primeiro depósito do usuário com status 'concluido'
      const [firstDeposit] = await db
        .select()
        .from(deposits)
        .where(and(eq(deposits.userId, affUserId), eq(deposits.status, 'concluido')))
        .orderBy(asc(deposits.dataCriacao))
        .limit(1);

      const [commissionAggregate] = await db
        .select({ total: sum(affiliateCommissions.valor) })
        .from(affiliateCommissions)
        .where(
          and(
            eq(affiliateCommissions.affiliateId, affiliate.id),
            eq(affiliateCommissions.userId, affUserId),
            inArray(affiliateCommissions.status, ["pendente", "paga"]),
          )
        );

      // Adiciona os dados do usuário ao array
      data.push({
        userId: affUserId,
        nome,
        email,
        firstDeposit: firstDeposit ? firstDeposit.valor : 0,
        revenue: sumAffiliateCommissionValues([Number(commissionAggregate?.total) || null])
      });
    }

    return NextResponse.json(data);

  } catch (err) {
    console.error('Erro ao gerar métricas dos usuários:', err);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
