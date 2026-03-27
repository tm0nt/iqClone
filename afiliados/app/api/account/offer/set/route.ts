import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { affiliates } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { normalizeCommissionType } from '@shared/affiliate/service';
import { requireAffiliateAuth } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAffiliateAuth();
    if (auth.error) return auth.error;
    const userId = auth.session.userId;

    const body = await request.json();
    const requestedType = normalizeCommissionType(body.tipoComissao);

    if (!requestedType) {
      return NextResponse.json({ error: 'Tipo de comissão inválido' }, { status: 400 });
    }

    const [affiliate] = await db
      .select({ tipoComissao: affiliates.tipoComissao })
      .from(affiliates)
      .where(eq(affiliates.userId, userId))
      .limit(1);

    if (!affiliate) {
      return NextResponse.json({ error: 'Afiliado não encontrado' }, { status: 404 });
    }

    // Atualizando o tipo de comissão do afiliado
    await db
      .update(affiliates)
      .set({ tipoComissao: requestedType })
      .where(eq(affiliates.userId, userId));

    return NextResponse.json({ success: true, tipoComissao: requestedType });
  } catch (error) {
    console.error('Erro ao alterar tipo de comissão:', error);
    return NextResponse.json({ error: 'Erro ao alterar tipo de comissão' }, { status: 500 });
  }
}
