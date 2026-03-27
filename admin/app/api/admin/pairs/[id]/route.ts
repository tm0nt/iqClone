import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { marketDataProviders, tradingPairs } from "@/db/schema";

async function getProviderById(providerId: number) {
  const provider = await db.query.marketDataProviders.findFirst({
    where: eq(marketDataProviders.id, providerId),
  });

  return provider ?? null;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin("SUPER_ADMIN", "ADMIN");
  if (auth.error) return auth.error;

  try {
    const { id } = await context.params;
    const body = await request.json();

    let providerPatch = {};
    if (body.providerId !== undefined) {
      const provider = await getProviderById(Number(body.providerId));

      if (!provider) {
        return NextResponse.json(
          { error: "Provedor não encontrado" },
          { status: 404 },
        );
      }

      providerPatch = {
        type: provider.type,
        provider: provider.name,
        providerId: provider.id,
        priceSource: provider.slug,
      };
    }

    const [updated] = await db
      .update(tradingPairs)
      .set({
        symbol: body.symbol
          ? String(body.symbol).trim().toUpperCase()
          : undefined,
        name: body.name ? String(body.name).trim() : undefined,
        priceSymbol:
          body.priceSymbol !== undefined
            ? body.priceSymbol
              ? String(body.priceSymbol).trim().toUpperCase()
              : null
            : undefined,
        payoutRate:
          body.payoutRate !== undefined
            ? Number(body.payoutRate)
            : undefined,
        isActive: body.isActive,
        favorite: body.favorite,
        displayOrder:
          body.displayOrder !== undefined
            ? Number(body.displayOrder)
            : undefined,
        imageUrl:
          body.imageUrl !== undefined ? body.imageUrl || null : undefined,
        color: body.color !== undefined ? body.color || null : undefined,
        logo: body.logo !== undefined ? body.logo || null : undefined,
        description:
          body.description !== undefined ? body.description || null : undefined,
        ...providerPatch,
      })
      .where(eq(tradingPairs.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar paridade:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar paridade" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin("SUPER_ADMIN");
  if (auth.error) return auth.error;

  try {
    const { id } = await context.params;

    await db.delete(tradingPairs).where(eq(tradingPairs.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao remover paridade:", error);
    return NextResponse.json(
      { error: "Erro ao remover paridade" },
      { status: 500 },
    );
  }
}
