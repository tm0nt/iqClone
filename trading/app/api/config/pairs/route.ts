import { NextResponse } from "next/server";
import {
  normalizeTradingPair,
} from "@/lib/forex-data";
import {
  ensureDefaultTradingPairs,
  getActiveTradingPairs,
} from "@/lib/server/market-registry";

export async function GET() {
  try {
    await ensureDefaultTradingPairs();
    const pairs = await getActiveTradingPairs();

    return NextResponse.json(
      pairs.map((pair) =>
        normalizeTradingPair({
          id: pair.id,
          symbol: pair.symbol,
          name: pair.name,
          type: pair.type,
          provider: pair.marketProvider?.name || pair.provider,
          payoutRate: pair.payoutRate,
          favorite: pair.favorite,
          displayOrder: pair.displayOrder,
          image: pair.imageUrl || undefined,
          color: pair.color || undefined,
          logo: pair.logo || undefined,
          description: pair.description || undefined,
          isActive: pair.isActive,
        }),
      ),
    );
  } catch (error) {
    console.error("Erro ao carregar paridades:", error);
    return NextResponse.json(
      { error: "Falha ao carregar paridades" },
      { status: 500 },
    );
  }
}
