import { NextResponse } from "next/server";
import { fetchMarketSnapshot } from "@/lib/server/market-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawSymbols = url.searchParams.get("symbols") || "";
  const symbols = rawSymbols
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean);

  if (symbols.length === 0) {
    return NextResponse.json(
      { error: "symbols is required" },
      { status: 400 },
    );
  }

  const results = await Promise.allSettled(
    symbols.map(async (symbol) => ({
      symbol,
      snapshot: await fetchMarketSnapshot(symbol),
    })),
  );

  return NextResponse.json(
    results.map((result, index) => {
      const symbol = symbols[index];
      if (result.status === "fulfilled") {
        return {
          ok: true,
          ...result.value.snapshot,
        };
      }

      return {
        symbol,
        ok: false,
        error:
          result.reason instanceof Error
            ? result.reason.message
            : "Failed to fetch market snapshot",
      };
    }),
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
