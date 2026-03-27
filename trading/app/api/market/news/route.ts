import { NextResponse } from "next/server";
import {
  fetchTiingoNews,
  getTiingoNewsAvailability,
} from "@/lib/server/market-news";

const FALLBACK_URL =
  "https://br.investing.com/currencies/single-currency-crosses";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const isMeta = url.searchParams.get("meta") === "true";
  const symbol = url.searchParams.get("symbol");
  const limit = Number(url.searchParams.get("limit") || "12");

  try {
    const availability = await getTiingoNewsAvailability();

    if (isMeta) {
      return NextResponse.json({
        enabled: availability.enabled,
        fallbackUrl: FALLBACK_URL,
      });
    }

    if (!availability.enabled) {
      return NextResponse.json(
        {
          enabled: false,
          fallbackUrl: FALLBACK_URL,
          items: [],
        },
        { status: 503 },
      );
    }

    const items = await fetchTiingoNews({ symbol, limit });
    return NextResponse.json({
      enabled: true,
      fallbackUrl: FALLBACK_URL,
      items,
    });
  } catch (error) {
    console.error("Erro ao carregar notícias de mercado:", error);
    return NextResponse.json(
      {
        enabled: false,
        fallbackUrl: FALLBACK_URL,
        items: [],
      },
      { status: 500 },
    );
  }
}
