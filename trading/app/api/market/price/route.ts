import { NextResponse } from "next/server";
import {
  fetchMarketPrice,
  getMarketSource,
  MarketDataError,
} from "@/lib/server/market-data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const symbol = url.searchParams.get("symbol")?.trim().toUpperCase();

  if (!symbol) {
    return NextResponse.json(
      { error: "symbol is required" },
      { status: 400 },
    );
  }

  try {
    const result = await fetchMarketPrice(symbol);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    const status = error instanceof MarketDataError ? error.status : 500;
    const message =
      error instanceof Error ? error.message : "Failed to fetch market price";
    const retryAfterMs = status === 429 ? 5 * 60_000 : undefined;

    return NextResponse.json(
      {
        error: message,
        symbol,
        source: getMarketSource(symbol),
        retryAfterMs,
      },
      {
        status,
        headers: retryAfterMs
          ? {
              "Retry-After": String(Math.ceil(retryAfterMs / 1000)),
            }
          : undefined,
      },
    );
  }
}
