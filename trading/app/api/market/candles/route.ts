import { NextResponse } from "next/server";
import {
  fetchResolvedMarketCandles,
  getMarketSource,
  MarketDataError,
} from "@/lib/server/market-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const symbol = url.searchParams.get("symbol")?.trim().toUpperCase();
  const timeframe = url.searchParams.get("timeframe")?.trim() || "1m";
  const limit = Number.parseInt(url.searchParams.get("limit") || "500", 10);

  if (!symbol) {
    return NextResponse.json(
      { error: "symbol is required" },
      { status: 400 },
    );
  }

  try {
    const { source, candles } = await fetchResolvedMarketCandles(
      symbol,
      timeframe,
      limit,
    );
    return NextResponse.json(
      {
        symbol,
        timeframe,
        limit,
        source,
        candles,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    const status = error instanceof MarketDataError ? error.status : 500;
    const message =
      error instanceof Error ? error.message : "Failed to fetch market candles";

    return NextResponse.json(
      {
        error: message,
        symbol,
        timeframe,
        source: getMarketSource(symbol),
      },
      { status },
    );
  }
}
