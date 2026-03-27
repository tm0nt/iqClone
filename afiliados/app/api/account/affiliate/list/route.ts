import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAffiliateAuth } from '@/lib/auth';

// Função para calcular a condição de inatividade
const isInactive = (createdAt: Date, lastDepositDate: Date | null): boolean => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return createdAt <= thirtyDaysAgo && (!lastDepositDate || lastDepositDate <= thirtyDaysAgo);
};

// Função para determinar se o usuário está pendente
const isPending = (createdAt: Date): boolean => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return createdAt > thirtyDaysAgo;
};

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAffiliateAuth();
    if (auth.error) return auth.error;
    const userId = auth.session.userId;

    // Consultando os usuários afiliados com relações
    const usersWithRelations = await db.query.users.findMany({
      where: eq(users.affiliateId, userId),
      with: {
        deposits: true,
        activities: {
          orderBy: (activities, { desc }) => [desc(activities.createdAt)],
          limit: 1,
        },
      },
    });

    const usersWithStatus = usersWithRelations.map(user => {
      // Obtendo o último depósito (se houver)
      const sortedDeposits = [...user.deposits].sort((a, b) =>
        (b.dataPagamento || b.dataCriacao).getTime() - (a.dataPagamento || a.dataCriacao).getTime()
      );
      const lastDeposit = sortedDeposits[0];

      // Determinando o status do usuário
      const status = isInactive(user.createdAt, lastDeposit?.dataPagamento ?? null)
        ? "inactive"
        : isPending(user.createdAt)
        ? "pending"
        : "active";

      // Atualizando o último registro de atividade
      const lastActivity = user.activities[0] ? user.activities[0].createdAt : "Nunca";

      return {
        ...user,
        status,
        lastActive: lastActivity,
      };
    });

    return NextResponse.json({ users: usersWithStatus });
  } catch (err) {
    console.error("Erro ao listar usuários:", err);
    return NextResponse.json({ error: 'Erro ao listar usuários' }, { status: 500 });
  }
}
