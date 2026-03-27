import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { affiliates, configs, clickEvents } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import { headers } from 'next/headers';
import { buildAffiliateOfferResponse, normalizeCommissionType } from '@shared/affiliate/service';
import { requireAffiliateAuth } from '@/lib/auth';

// Tipos para a resposta de comissão
type ComissionResponse = {
  tipoComissao: 'cpa' | 'revShare' | null ;
  taxa: number;
  valorMinimoSaque: number;
  valorMinimoDeposito: number;
  cpaMin?: number;
  cpaValor?: number;
  revShareFalsoValue?: number;
  revShareValue?: number;
  cliques: number;
  offerLink: string;
};

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const hostname = headersList.get('x-forwarded-host');
    const auth = await requireAffiliateAuth();
    if (auth.error) return auth.error;
    const userId = auth.session.userId;

    // Primeiro, consultamos o tipo de comissão do afiliado
    const [affiliate] = await db
      .select({ id: affiliates.id, tipoComissao: affiliates.tipoComissao })
      .from(affiliates)
      .where(eq(affiliates.userId, userId))
      .limit(1);

    if (!affiliate) {
      return NextResponse.json({ error: 'Afiliado não encontrado' }, { status: 404 });
    }

    // Agora, consultamos os dados da tabela de configuração
    const [config] = await db
      .select({
        cpaMin: configs.cpaMin,
        cpaValor: configs.cpaValor,
        revShareFalsoValue: configs.revShareFalsoValue,
        revShareNegativo: configs.revShareNegativo,
        revShareValue: configs.revShareValue,
        taxa: configs.taxa,
        valorMinimoSaque: configs.valorMinimoSaque,
        valorMinimoDeposito: configs.valorMinimoDeposito,
        urlSite: configs.urlSite,
      })
      .from(configs)
      .limit(1);

    if (!config) {
      return NextResponse.json({ error: 'Configuração não encontrada' }, { status: 404 });
    }

    // Contando os cliques para o affiliate relacionado
    const [clickCount] = await db
      .select({ count: count() })
      .from(clickEvents)
      .where(eq(clickEvents.affiliateId, affiliate.id));

    const cliques = clickCount?.count ?? 0;

    const tipoComissao = normalizeCommissionType(affiliate.tipoComissao);

    const responseData: ComissionResponse = buildAffiliateOfferResponse({
      tipoComissao,
      config,
      clicks: cliques,
      affiliateUserId: userId,
    });

    // Retornando os dados de comissão
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Erro ao buscar informações de comissão:', error);
    return NextResponse.json({ error: 'Erro ao buscar informações de comissão' }, { status: 500 });
  }
}
