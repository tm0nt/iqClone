import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { marketDataProviders, tradingPairs } from "@/db/schema";

async function getProviderById(providerId: number) {
  const provider = await db.query.marketDataProviders.findFirst({
    where: eq(marketDataProviders.id, providerId),
  });

  return provider ?? null;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin("SUPER_ADMIN", "ADMIN");
  if (auth.error) return auth.error;

  try {
    const providerIdParam = request.nextUrl.searchParams.get("providerId");
    const providerId = providerIdParam ? Number(providerIdParam) : null;

    const rows = await db
      .select({
        id: tradingPairs.id,
        symbol: tradingPairs.symbol,
        name: tradingPairs.name,
        type: tradingPairs.type,
        provider: tradingPairs.provider,
        providerId: tradingPairs.providerId,
        priceSource: tradingPairs.priceSource,
        priceSymbol: tradingPairs.priceSymbol,
        payoutRate: tradingPairs.payoutRate,
        isActive: tradingPairs.isActive,
        favorite: tradingPairs.favorite,
        displayOrder: tradingPairs.displayOrder,
        imageUrl: tradingPairs.imageUrl,
        color: tradingPairs.color,
        logo: tradingPairs.logo,
        description: tradingPairs.description,
        createdAt: tradingPairs.createdAt,
        updatedAt: tradingPairs.updatedAt,
        providerSlug: marketDataProviders.slug,
        providerName: marketDataProviders.name,
      })
      .from(tradingPairs)
      .leftJoin(
        marketDataProviders,
        eq(tradingPairs.providerId, marketDataProviders.id),
      )
      .where(
        providerId ? eq(tradingPairs.providerId, providerId) : undefined,
      )
      .orderBy(asc(tradingPairs.displayOrder), asc(tradingPairs.symbol));

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Erro ao listar paridades:", error);
    return NextResponse.json(
      { error: "Erro ao listar paridades" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin("SUPER_ADMIN");
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const symbol = String(body.symbol || "").trim().toUpperCase();
    const providerId = Number(body.providerId);

    if (!symbol || !body.name || !providerId) {
      return NextResponse.json(
        { error: "Campos obrigatórios: symbol, name e providerId" },
        { status: 400 },
      );
    }

    const provider = await getProviderById(providerId);
    if (!provider) {
      return NextResponse.json(
        { error: "Provedor não encontrado" },
        { status: 404 },
      );
    }

    const [pair] = await db
      .insert(tradingPairs)
      .values({
        symbol,
        name: String(body.name).trim(),
        type: provider.type,
        provider: provider.name,
        providerId: provider.id,
        priceSource: provider.slug,
        priceSymbol: body.priceSymbol
          ? String(body.priceSymbol).trim().toUpperCase()
          : null,
        payoutRate:
          typeof body.payoutRate === "number"
            ? body.payoutRate
            : Number(body.payoutRate ?? 0.9),
        isActive: body.isActive ?? true,
        favorite: body.favorite ?? false,
        displayOrder: Number(body.displayOrder ?? 0),
        imageUrl: body.imageUrl ? String(body.imageUrl) : null,
        color: body.color ? String(body.color) : null,
        logo: body.logo ? String(body.logo) : null,
        description: body.description ? String(body.description) : null,
      })
      .returning();

    return NextResponse.json(pair, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar paridade:", error);
    return NextResponse.json(
      { error: "Erro ao criar paridade" },
      { status: 500 },
    );
  }
}
