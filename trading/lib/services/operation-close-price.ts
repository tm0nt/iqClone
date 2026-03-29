import {
  fetchMarketCandlesBySource,
  fetchMarketPriceBySource,
  fetchMarketSnapshotBySource,
} from "@/lib/server/market-data";
import { getMarketProvidersMap } from "@/lib/server/market-registry";
import { isCryptoSymbol } from "@/lib/forex-data";

async function fetchClosePriceFromSource(source: string, symbol: string) {
  const errors: string[] = [];

  try {
    const priceData = await fetchMarketPriceBySource(source, symbol);
    if (Number.isFinite(priceData.price)) {
      return {
        price: priceData.price,
        source,
      };
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "price fetch failed");
  }

  try {
    const snapshot = await fetchMarketSnapshotBySource(source, symbol);
    if (Number.isFinite(snapshot.price)) {
      return {
        price: snapshot.price,
        source: `${source}:snapshot`,
      };
    }
  } catch (error) {
    errors.push(
      error instanceof Error ? error.message : "snapshot fetch failed",
    );
  }

  try {
    const candles = await fetchMarketCandlesBySource(source, symbol, "1m", 2);
    const lastCandle = candles[candles.length - 1];
    if (lastCandle && Number.isFinite(lastCandle.Close)) {
      return {
        price: lastCandle.Close,
        source: `${source}:candle`,
      };
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "candle fetch failed");
  }

  throw new Error(
    errors.length > 0
      ? errors.join(" | ")
      : `Failed to fetch settlement price for ${symbol}`,
  );
}

export async function fetchOperationClosePrice(source: string, symbol: string) {
  try {
    return await fetchClosePriceFromSource(source, symbol);
  } catch (primaryError) {
    if (!isCryptoSymbol(symbol)) throw primaryError;

    const fallbackSlug = source === "tiingo" ? "binance" : "tiingo";
    const providers = await getMarketProvidersMap();
    const fallbackProvider = providers.get(fallbackSlug);
    if (!fallbackProvider || fallbackProvider.isActive === false) {
      throw primaryError;
    }

    console.warn(
      `[close-price] ${source} failed for ${symbol}, fallback → ${fallbackSlug}`,
    );
    return await fetchClosePriceFromSource(fallbackSlug, symbol);
  }
}
