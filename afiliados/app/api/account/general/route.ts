import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, deposits, balances } from '@/db/schema';
import { eq, and, gte, lte, count, exists } from 'drizzle-orm';
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
    // Total de usuários afiliados no período
    const [totalUsuariosResult] = await db
      .select({ count: count() })
      .from(users)
      .where(and(
        eq(users.affiliateId, userId),
        gte(users.createdAt, startDate),
        lte(users.createdAt, endDate),
      ));
    const totalUsuarios = totalUsuariosResult?.count ?? 0;

    // Quantos afiliados fizeram depósito concluído
    const [afiliadosComDepositoResult] = await db
      .select({ count: count() })
      .from(users)
      .where(and(
        eq(users.affiliateId, userId),
        gte(users.createdAt, startDate),
        lte(users.createdAt, endDate),
        exists(
          db.select({ id: deposits.id })
            .from(deposits)
            .where(and(
              eq(deposits.userId, users.id),
              eq(deposits.status, 'concluido'),
              gte(deposits.dataPagamento!, startDate),
              lte(deposits.dataPagamento!, endDate),
            ))
        ),
      ));
    const afiliadosComDeposito = afiliadosComDepositoResult?.count ?? 0;

    const conversaoPercent = totalUsuarios > 0
      ? Number(((afiliadosComDeposito / totalUsuarios) * 100).toFixed(2))
      : 0;

    // Saldo de comissão do afiliado
    const [balance] = await db
      .select({ saldoComissao: balances.saldoComissao })
      .from(balances)
      .where(eq(balances.userId, userId))
      .limit(1);

    const saldoComissao = balance?.saldoComissao ?? 0;

    // Cálculo de crescimento em relação ao mês anterior
    let crescimento = 0;
    const currMonthStart = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    const prevMonthStart = new Date(currMonthStart.getFullYear(), currMonthStart.getMonth() - 1, 1);
    const prevMonthEnd = new Date(currMonthStart.getTime() - 1);

    const efetivoPrevIni = prevMonthStart < startDate ? startDate : prevMonthStart;
    const efetivoCurrIni = currMonthStart < startDate ? startDate : currMonthStart;

    if (prevMonthEnd >= efetivoPrevIni) {
      const [[countAtualResult], [countAnteriorResult]] = await Promise.all([
        db.select({ count: count() })
          .from(users)
          .where(and(
            eq(users.affiliateId, userId),
            gte(users.createdAt, efetivoCurrIni),
            lte(users.createdAt, endDate),
          )),
        db.select({ count: count() })
          .from(users)
          .where(and(
            eq(users.affiliateId, userId),
            gte(users.createdAt, efetivoPrevIni),
            lte(users.createdAt, prevMonthEnd),
          )),
      ]);

      const countAtual = countAtualResult?.count ?? 0;
      const countAnterior = countAnteriorResult?.count ?? 0;

      if (countAnterior === 0) {
        crescimento = countAtual > 0 ? 100 : 0;
      } else {
        crescimento = ((countAtual - countAnterior) / countAnterior) * 100;
      }

      crescimento = Number(crescimento.toFixed(2));
    }

    // Retorna o JSON formatado
    const resposta = {
      receitaTotal: saldoComissao,
      usuariosAtivos: {
        totalUsuarios: totalUsuarios,
        crescimento: crescimento,
      },
      conversoes: conversaoPercent,
      saldoDisponivel: saldoComissao,
    };

    return NextResponse.json(resposta);

  } catch (err) {
    console.error('Erro ao gerar métricas do afiliado:', err);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
