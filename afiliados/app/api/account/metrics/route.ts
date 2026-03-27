import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, affiliateCommissions } from '@/db/schema';
import { eq, and, gte, lte, sum } from 'drizzle-orm';
import { requireAffiliateAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await requireAffiliateAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.userId;

  try {
    // 1. Encontrar todos os usuários afiliados e agrupar por mês
    const afiliados = await db
      .select({ createdAt: users.createdAt, id: users.id })
      .from(users)
      .where(eq(users.affiliateId, userId));

    const monthlyData: Record<string, { totalUsuarios: number; receitaTotal: number }> = {};

    for (const user of afiliados) {
      const monthYear = `${user.createdAt.getMonth() + 1}-${user.createdAt.getFullYear()}`;
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { totalUsuarios: 0, receitaTotal: 0 };
      }
      monthlyData[monthYear].totalUsuarios += 1;
    }

    // 2. Para cada mês, calcular a receita total das comissões de afiliados
    for (const monthYear in monthlyData) {
      const [month, year] = monthYear.split('-').map(Number);

      const [totalComissao] = await db
        .select({ total: sum(affiliateCommissions.valor) })
        .from(affiliateCommissions)
        .where(
          and(
            eq(affiliateCommissions.affiliateId, userId),
            gte(affiliateCommissions.data, new Date(year, month - 1, 1)),
            lte(affiliateCommissions.data, new Date(year, month, 0)),
          )
        );

      monthlyData[monthYear].receitaTotal = Number(totalComissao?.total) || 0;
    }

    // Formatando os dados para o gráfico
    const data = Object.keys(monthlyData).map((monthYear) => {
      const [month, year] = monthYear.split('-');
      return {
        name: `${month}/${year}`,
        usuarios: monthlyData[monthYear].totalUsuarios,
        receita: monthlyData[monthYear].receitaTotal,
      };
    });

    return NextResponse.json({ data });

  } catch (err) {
    console.error('Erro ao gerar dados para gráfico Receita x Usuários:', err);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
