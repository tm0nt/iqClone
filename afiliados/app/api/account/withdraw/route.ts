"use server"

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { withdrawals, configs, balances, auditLogs } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { requireAffiliateAuth } from "@/lib/auth";
import { formatUsd } from "@shared/platform/branding";

// Função GET: Buscar saques do tipo "afiliado"
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
      startDate.setDate(startDate.getDate() - 30); // Default: 30 dias atrás
    }

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
      return NextResponse.json({ error: 'Intervalo de datas inválido' }, { status: 400 });
    }

    try {
      // Consultando os saques no intervalo de datas
      const result = await db
        .select()
        .from(withdrawals)
        .where(
          and(
            eq(withdrawals.userId, userId),
            eq(withdrawals.tipo, 'afiliado'),
            gte(withdrawals.dataPedido, startDate),
            lte(withdrawals.dataPedido, endDate),
          )
        );

      // Retorna os saques encontrados
      return NextResponse.json({ withdrawals: result });

    } catch (err) {
      console.error('Erro ao buscar saques:', err);
      return NextResponse.json({ error: 'Erro ao buscar saques' }, { status: 500 });
    }
  }

// Função POST: Registrar um saque
export async function POST(request: NextRequest) {
  const auth = await requireAffiliateAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.userId;

  try {
    const body = await request.json();
    const { valor, tipoChave, chave, tipo } = body;

    if (!valor || !tipoChave || !chave || !tipo) {
      return NextResponse.json({ error: 'Dados incompletos para o saque' }, { status: 400 });
    }

    // Consultar a taxa de saque e valor mínimo de saque da tabela "config"
    const [config] = await db.select().from(configs).limit(1);
    if (!config) {
      return NextResponse.json({ error: 'Configuração de taxa não encontrada' }, { status: 500 });
    }

    const taxaSaque = config.taxa;
    const valorMinimoSaque = config.valorMinimoSaque;

    // Verificar se o valor do saque é maior ou igual ao valor mínimo
    if (valor < valorMinimoSaque) {
      return NextResponse.json(
        { error: `O valor mínimo para saque é ${formatUsd(valorMinimoSaque)}` },
        { status: 400 },
      );
    }

    // Calcular o valor total (valor do saque + taxa fixa)
    const valorTotal = valor + taxaSaque;

    // Verificar saldo disponível
    const [userBalance] = await db
      .select()
      .from(balances)
      .where(eq(balances.userId, userId))
      .limit(1);

    if (!userBalance || userBalance.saldoComissao < valorTotal) {
      return NextResponse.json({ error: 'Saldo insuficiente para o saque' }, { status: 400 });
    }

    // Subtrair o valor do saque + taxa do saldoComissao
    await db
      .update(balances)
      .set({ saldoComissao: userBalance.saldoComissao - valorTotal })
      .where(eq(balances.userId, userId));

    // Registrar o saque
    const [withdrawal] = await db.insert(withdrawals).values({
      userId,
      valor,
      tipoChave,
      chave,
      tipo,
      status: 'pendente',
      taxa: taxaSaque,
    }).returning();

    // Registrar no audit log
    await db.insert(auditLogs).values({
      userId,
      entidade: 'Withdrawal',
      entidadeId: withdrawal.id,
      acao: 'create',
      valoresNovos: JSON.stringify(withdrawal),
    });

    return NextResponse.json({ withdrawal });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar saque' }, { status: 500 });
  }
}
