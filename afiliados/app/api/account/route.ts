import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { balances, withdrawals, users, configs, affiliates } from "@/db/schema";
import { eq, and, sum } from "drizzle-orm";
import { requireAffiliateAuth } from "@/lib/auth";

// Função GET: Buscar dados do usuário, saques, taxa e tipoComissao
export async function GET(request: NextRequest) {
  const auth = await requireAffiliateAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.userId;

  try {
    // Consultando saldoComissao da tabela Balance
    const [balance] = await db
      .select({ saldoComissao: balances.saldoComissao })
      .from(balances)
      .where(eq(balances.userId, userId))
      .limit(1);

    if (!balance) {
      return NextResponse.json({ error: 'Saldo não encontrado' }, { status: 404 });
    }

    // Consultando os saques concluídos (totalRecebido)
    const [totalRecebido] = await db
      .select({ total: sum(withdrawals.valor) })
      .from(withdrawals)
      .where(and(eq(withdrawals.userId, userId), eq(withdrawals.status, 'concluido')));

    // Consultando os saques pendentes (pagamentosPendentes)
    const [pagamentosPendentes] = await db
      .select({ total: sum(withdrawals.valor) })
      .from(withdrawals)
      .where(and(eq(withdrawals.userId, userId), eq(withdrawals.status, 'pendente')));

    // Consultando informações do usuário
    const [user] = await db
      .select({ nome: users.nome, email: users.email, cpf: users.cpf })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Consultando a taxa de saque da tabela Config
    const [config] = await db
      .select({ taxa: configs.taxa })
      .from(configs)
      .limit(1);

    if (!config) {
      return NextResponse.json({ error: 'Configuração não encontrada' }, { status: 404 });
    }

    // Consultando o tipo de comissão na tabela Affiliate
    const [affiliate] = await db
      .select({ tipoComissao: affiliates.tipoComissao })
      .from(affiliates)
      .where(eq(affiliates.userId, userId))
      .limit(1);

    if (!affiliate) {
      return NextResponse.json({ error: 'Afiliado não encontrado' }, { status: 404 });
    }

    // Retorna os dados coletados, incluindo tipoComissao
    return NextResponse.json({
      saldoComissao: balance.saldoComissao,
      totalRecebido: Number(totalRecebido?.total) || 0,
      pagamentosPendentes: Number(pagamentosPendentes?.total) || 0,
      user: {
        name: user.nome,
        email: user.email,
        cpf: user.cpf,
      },
      tipoComissao: affiliate.tipoComissao,
      taxa: config.taxa,
    });

  } catch (err) {
    console.error("Erro ao buscar dados do usuário:", err);
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
  }
}
