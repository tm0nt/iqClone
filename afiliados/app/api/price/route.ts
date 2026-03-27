import { NextRequest, NextResponse } from "next/server";

function isCryptoSymbol(symbol: string): boolean {
  return /USDT$|BUSD$|BTC$|ETH$|BNB$/i.test(symbol);
}

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ error: "symbol required" }, { status: 400 });
  }

  const s = symbol.toUpperCase();

  try {
    if (isCryptoSymbol(s)) {
      const res = await fetch(
        `https://api.binance.com/api/v3/ticker/price?symbol=${s}`,
        { signal: AbortSignal.timeout(5000) },
      );
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ price: parseFloat(data.price), source: "binance" });
      }
    } else {
      const itickKey = process.env.NEXT_PUBLIC_ITICK_API_KEY;
      if (itickKey) {
        const res = await fetch(
          `https://api.itick.org/forex/quote?symbol=${s}$GB&token=${itickKey}`,
          { signal: AbortSignal.timeout(5000) },
        );
        if (res.ok) {
          const data = await res.json();
          const price = data?.data?.ld || data?.data?.c;
          if (price) return NextResponse.json({ price, source: "itick" });
        }
      }
    }

    return NextResponse.json({ error: "Price not available" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch price" }, { status: 500 });
  }
}
