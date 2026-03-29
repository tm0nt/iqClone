import type { CandleData } from "@/types";
import {
  getMarketProvidersMap,
  resolveMarketSourceForSymbol,
} from "@/lib/server/market-registry";
import { isCryptoSymbol } from "@/lib/forex-data";

const ITICK_REGION = "GB";

const ITICK_TIMEFRAME_MAP: Record<string, number> = {
  "1m": 1,
  "5m": 2,
  "15m": 3,
  "30m": 4,
  "1h": 5,
  "2h": 6,
  "4h": 7,
  "1d": 8,
  "1w": 9,
};

const BINANCE_INTERVAL_MAP: Record<string, string> = {
  "1m": "1m",
  "5m": "5m",
  "15m": "15m",
  "30m": "30m",
  "1h": "1h",
  "2h": "2h",
  "4h": "4h",
  "1d": "1d",
  "1w": "1w",
};

const TIINGO_RESAMPLE_MAP: Record<string, string> = {
  "1m": "1min",
  "5m": "5min",
  "15m": "15min",
  "30m": "30min",
  "1h": "1hour",
  "2h": "2hour",
  "4h": "4hour",
  "1d": "1day",
  "1w": "1week",
};
const TIINGO_BAR_MS: Record<string, number> = {
  "1min": 60_000,
  "5min": 300_000,
  "15min": 900_000,
  "30min": 1_800_000,
  "1hour": 3_600_000,
  "2hour": 7_200_000,
  "4hour": 14_400_000,
  "1day": 86_400_000,
  "1week": 604_800_000,
};
const TIINGO_MAX_RETRIES = 3;

const INVALID_TOKENS = new Set([
  "",
  "your-api-key-here",
  "sua-chave-itick-aqui",
]);

type ProviderRecord = Awaited<
  ReturnType<typeof getMarketProvidersMap>
> extends Map<any, infer T>
  ? T
  : never;
type ResolvedProviderContext = Awaited<
  ReturnType<typeof resolveMarketSourceForSymbol>
> & {
  provider: ProviderRecord;
};
type MarketDataCacheEntry<T> = {
  value: T;
  expiresAt: number;
};
type MarketDataCacheState = {
  values: Map<string, MarketDataCacheEntry<unknown>>;
  inflight: Map<string, Promise<unknown>>;
};

declare global {
  // eslint-disable-next-line no-var
  var __MARKET_DATA_CACHE_STATE__: MarketDataCacheState | undefined;
}

export class MarketDataError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "MarketDataError";
    this.status = status;
  }
}

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

const marketDataCacheState: MarketDataCacheState =
  globalThis.__MARKET_DATA_CACHE_STATE__ ?? {
    values: new Map(),
    inflight: new Map(),
  };

if (!globalThis.__MARKET_DATA_CACHE_STATE__) {
  globalThis.__MARKET_DATA_CACHE_STATE__ = marketDataCacheState;
}

export function invalidateMarketDataCaches() {
  marketDataCacheState.values.clear();
  marketDataCacheState.inflight.clear();
}

function getCachedValue<T>(key: string): T | null {
  const entry = marketDataCacheState.values.get(key);
  if (!entry) return null;

  if (entry.expiresAt <= Date.now()) {
    marketDataCacheState.values.delete(key);
    return null;
  }

  return entry.value as T;
}

function setCachedValue<T>(key: string, value: T, ttlMs: number) {
  marketDataCacheState.values.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

async function withMarketDataCache<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>,
): Promise<T> {
  const cached = getCachedValue<T>(key);
  if (cached !== null) {
    return cached;
  }

  const inflight = marketDataCacheState.inflight.get(key);
  if (inflight) {
    return inflight as Promise<T>;
  }

  const promise = loader()
    .then((value) => {
      if (ttlMs > 0) {
        setCachedValue(key, value, ttlMs);
      }
      return value;
    })
    .finally(() => {
      marketDataCacheState.inflight.delete(key);
    });

  marketDataCacheState.inflight.set(key, promise);
  return promise;
}

function getPriceCacheTtlMs(source: string) {
  switch (source) {
    case "binance":
      return 1_000;
    case "itick":
      return 2_000;
    case "tiingo":
      return 1_500;
    default:
      return 1_000;
  }
}

function getCandlesCacheTtlMs(source: string, timeframe: string) {
  if (timeframe === "1d" || timeframe === "1w") {
    return source === "binance" ? 15_000 : 10_000;
  }

  switch (source) {
    case "binance":
      return 2_000;
    case "itick":
      return 3_000;
    case "tiingo":
      return 2_000;
    default:
      return 2_000;
  }
}

function getSnapshotCacheTtlMs(source: string) {
  switch (source) {
    case "binance":
      return 2_000;
    case "itick":
      return 3_000;
    case "tiingo":
      return 2_000;
    default:
      return 2_000;
  }
}

function sanitizeToken(token?: string | null) {
  const normalized = token?.trim() ?? "";
  if (!normalized || INVALID_TOKENS.has(normalized)) {
    return null;
  }
  return normalized;
}

function getProviderToken(provider: ProviderRecord) {
  const persistedToken = sanitizeToken(provider.authToken);
  if (persistedToken) {
    return persistedToken;
  }

  if (provider.envKey) {
    const token = sanitizeToken(process.env[provider.envKey]);
    if (token) return token;
  }

  return null;
}

function getProviderHeaders(
  provider: ProviderRecord,
  token: string | null,
  extraHeaders?: Record<string, string>,
) {
  const headers: Record<string, string> = {
    ...extraHeaders,
  };

  if (
    provider.authType === "header" &&
    token &&
    provider.authHeaderName
  ) {
    headers[provider.authHeaderName] = token;
  }

  return headers;
}

function buildProviderUrl(
  provider: ProviderRecord,
  path: string,
  params: Record<string, string | number | null | undefined>,
  token: string | null,
) {
  const url = new URL(path, provider.restBaseUrl);

  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  if (
    provider.authType === "query" &&
    token &&
    provider.authQueryParam
  ) {
    url.searchParams.set(provider.authQueryParam, token);
  }

  return url.toString();
}

async function fetchJson(url: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (!headers.has("accept")) {
    headers.set("accept", "application/json");
  }
  if (!headers.has("user-agent")) {
    headers.set("user-agent", "Mozilla/5.0 Codex Market Proxy");
  }

  return fetch(url, {
    ...init,
    cache: "no-store",
    headers,
    signal: init?.signal ?? AbortSignal.timeout(8000),
  });
}

async function resolveProviderContext(
  symbol: string,
): Promise<ResolvedProviderContext> {
  const resolved = await resolveMarketSourceForSymbol(symbol);

  if (resolved.pair && !resolved.pair.isActive) {
    throw new MarketDataError(
      `Trading pair ${resolved.symbol} is disabled`,
      503,
    );
  }

  if (!resolved.provider) {
    throw new MarketDataError(
      `No market provider configured for ${resolved.symbol}`,
      503,
    );
  }

  if (!resolved.provider.isActive) {
    throw new MarketDataError(
      `Market provider ${resolved.provider.name} is disabled`,
      503,
    );
  }

  return {
    ...resolved,
    provider: resolved.provider,
  };
}

async function getProviderBySlug(slug: string) {
  const providers = await getMarketProvidersMap();
  const provider = providers.get(slug.toLowerCase());

  if (!provider) {
    throw new MarketDataError(
      `Market provider ${slug} is not configured`,
      503,
    );
  }

  if (!provider.isActive) {
    throw new MarketDataError(
      `Market provider ${provider.name} is disabled`,
      503,
    );
  }

  return provider;
}

export function getMarketSource(symbol: string): "binance" | "itick" | "tiingo" {
  return isCryptoSymbol(symbol) ? "binance" : "tiingo";
}

export async function fetchMarketPrice(symbol: string) {
  const context = await resolveProviderContext(symbol);
  const primarySlug = context.provider.slug;

  try {
    return await fetchMarketPriceBySource(primarySlug, context.marketSymbol);
  } catch (primaryError) {
    if (!isRetriableError(primaryError)) throw primaryError;

    const fallbackSlug = isCryptoSymbol(symbol) ? "tiingo" : null;
    if (!fallbackSlug || fallbackSlug === primarySlug) throw primaryError;

    const providers = await getMarketProvidersMap();
    const fallbackProvider = providers.get(fallbackSlug);
    if (!fallbackProvider || fallbackProvider.isActive === false) throw primaryError;

    console.warn(
      `[market-data] Provider ${primarySlug} price failed for ${symbol} (${
        primaryError instanceof Error ? primaryError.message : String(primaryError)
      }), fallback → ${fallbackSlug}`,
    );

    return fetchMarketPriceBySource(fallbackSlug, context.marketSymbol);
  }
}

export async function fetchMarketPriceBySource(source: string, symbol: string) {
  const provider = await getProviderBySlug(source);
  const normalized = normalizeSymbol(symbol);
  const cacheKey = `price:${provider.slug}:${normalized}`;

  return withMarketDataCache(
    cacheKey,
    getPriceCacheTtlMs(provider.slug),
    async () => {
      switch (provider.slug) {
        case "binance":
          return fetchBinancePrice(provider, normalized);
        case "itick":
          return fetchItickPrice(provider, normalized);
        case "tiingo":
          return fetchTiingoPrice(provider, normalized);
        default:
          throw new MarketDataError(
            `Provider ${provider.slug} is not implemented`,
            501,
          );
      }
    },
  );
}

export async function fetchMarketCandles(
  symbol: string,
  timeframe: string,
  limit = 500,
): Promise<CandleData[]> {
  const { candles } = await fetchResolvedMarketCandles(symbol, timeframe, limit);
  return candles;
}

function isRetriableError(error: unknown): boolean {
  if (error instanceof MarketDataError) {
    // These are intentional — never retry:
    // 400 = bad request (wrong symbol/params), 401 = unauthorized, 503 = provider disabled
    if (error.status === 400 || error.status === 401 || error.status === 503) return false;
    // Everything else is retriable: 403/418/429/451 (geo-block, rate-limit, legal),
    // 5xx (server errors), 0 (network-level failure)
    return true;
  }
  // Native fetch failures: network error (TypeError), timeout (AbortError / TimeoutError / DOMException)
  if (error instanceof TypeError) return true;
  if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) return true;
  if (typeof DOMException !== "undefined" && error instanceof DOMException) return true;
  return false;
}

export async function fetchResolvedMarketCandles(
  symbol: string,
  timeframe: string,
  limit = 500,
): Promise<{
  source: "binance" | "itick" | "tiingo";
  candles: CandleData[];
}> {
  const context = await resolveProviderContext(symbol);
  const primarySlug = context.provider.slug;

  try {
    const candles = await fetchMarketCandlesBySource(
      primarySlug,
      context.marketSymbol,
      timeframe,
      limit,
    );
    return {
      source: primarySlug as "binance" | "itick" | "tiingo",
      candles,
    };
  } catch (primaryError) {
    if (!isRetriableError(primaryError)) throw primaryError;

    // For crypto: fallback to Tiingo if primary (Binance) fails
    const fallbackSlug = isCryptoSymbol(symbol) ? "tiingo" : null;
    if (!fallbackSlug || fallbackSlug === primarySlug) throw primaryError;

    const providers = await getMarketProvidersMap();
    const fallbackProvider = providers.get(fallbackSlug);
    if (!fallbackProvider || fallbackProvider.isActive === false) throw primaryError;

    console.warn(
      `[market-data] Provider ${primarySlug} failed for ${symbol} (${
        primaryError instanceof Error ? primaryError.message : String(primaryError)
      }), fallback → ${fallbackSlug}`,
    );

    const candles = await fetchMarketCandlesBySource(
      fallbackSlug,
      context.marketSymbol,
      timeframe,
      limit,
    );
    return {
      source: fallbackSlug as "binance" | "itick" | "tiingo",
      candles,
    };
  }
}

export async function fetchMarketCandlesBySource(
  source: string,
  symbol: string,
  timeframe: string,
  limit = 500,
): Promise<CandleData[]> {
  const provider = await getProviderBySlug(source);
  const normalized = normalizeSymbol(symbol);
  const clampedLimit = Math.min(Math.max(limit, 1), 1000);
  const cacheKey = `candles:${provider.slug}:${normalized}:${timeframe}:${clampedLimit}`;

  return withMarketDataCache(
    cacheKey,
    getCandlesCacheTtlMs(provider.slug, timeframe),
    async () => {
      switch (provider.slug) {
        case "binance":
          return fetchBinanceCandles(provider, normalized, timeframe, clampedLimit);
        case "itick":
          return fetchItickCandles(provider, normalized, timeframe, clampedLimit);
        case "tiingo":
          return fetchTiingoCandles(provider, normalized, timeframe, clampedLimit);
        default:
          throw new MarketDataError(
            `Provider ${provider.slug} is not implemented`,
            501,
          );
      }
    },
  );
}

export async function fetchMarketSnapshot(symbol: string) {
  const context = await resolveProviderContext(symbol);
  return fetchMarketSnapshotBySource(context.provider.slug, context.marketSymbol);
}

export async function fetchMarketSnapshotBySource(
  source: string,
  symbol: string,
) {
  const provider = await getProviderBySlug(source);
  const normalized = normalizeSymbol(symbol);
  const cacheKey = `snapshot:${provider.slug}:${normalized}`;

  return withMarketDataCache(
    cacheKey,
    getSnapshotCacheTtlMs(provider.slug),
    async () => {
      switch (provider.slug) {
        case "binance":
          return fetchBinanceSnapshot(provider, normalized);
        case "itick":
          return fetchItickSnapshot(provider, normalized);
        case "tiingo":
          return fetchTiingoSnapshot(provider, normalized);
        default:
          throw new MarketDataError(
            `Provider ${provider.slug} is not implemented`,
            501,
          );
      }
    },
  );
}

async function fetchBinancePrice(provider: ProviderRecord, symbol: string) {
  const response = await fetchJson(
    buildProviderUrl(
      provider,
      "/api/v3/ticker/price",
      { symbol },
      null,
    ),
  );

  if (!response.ok) {
    throw new MarketDataError(
      `Binance price request failed for ${symbol} (HTTP ${response.status})`,
      response.status,
    );
  }

  const data = await response.json();
  const price = Number.parseFloat(data?.price);

  if (!Number.isFinite(price)) {
    throw new MarketDataError(`Invalid Binance price for ${symbol}`, 502);
  }

  return {
    symbol,
    source: provider.slug as "binance",
    price,
  };
}

async function fetchBinanceCandles(
  provider: ProviderRecord,
  symbol: string,
  timeframe: string,
  limit: number,
) {
  const interval = BINANCE_INTERVAL_MAP[timeframe] ?? "1m";
  const clampedLimit = Math.min(Math.max(limit, 1), 1000);
  const response = await fetchJson(
    buildProviderUrl(
      provider,
      "/api/v3/klines",
      {
        symbol,
        interval,
        limit: clampedLimit,
      },
      null,
    ),
  );

  if (!response.ok) {
    throw new MarketDataError(
      `Binance candles request failed for ${symbol} (HTTP ${response.status})`,
      response.status,
    );
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new MarketDataError("Invalid Binance candles payload", 502);
  }

  return data.map((item: any[]) => ({
    Date: Number(item[0]),
    Open: Number(item[1]),
    High: Number(item[2]),
    Low: Number(item[3]),
    Close: Number(item[4]),
    Volume: Number(item[5]) || 0,
  }));
}

async function fetchBinanceSnapshot(provider: ProviderRecord, symbol: string) {
  const [priceData, candles] = await Promise.all([
    fetchBinancePrice(provider, symbol),
    fetchBinanceCandles(provider, symbol, "1d", 2),
  ]);

  const previousClose =
    candles.length >= 2
      ? candles[candles.length - 2]?.Close
      : candles[0]?.Close;
  const priceChangePercent = previousClose
    ? ((priceData.price - previousClose) / previousClose) * 100
    : 0;

  return {
    symbol,
    source: provider.slug as "binance",
    price: priceData.price,
    previousClose: previousClose ?? priceData.price,
    priceChangePercent,
    change: `${priceChangePercent.toFixed(2)}%`,
  };
}

async function fetchItickPrice(provider: ProviderRecord, symbol: string) {
  const token = getProviderToken(provider);

  if (!token) {
    throw new MarketDataError(
      `${provider.name} API key not configured on server`,
      503,
    );
  }

  const response = await fetchJson(
    buildProviderUrl(
      provider,
      "/forex/tick",
      {
        region: ITICK_REGION,
        code: symbol,
      },
      token,
    ),
    {
      headers: getProviderHeaders(provider, token, {
        accept: "application/json",
      }),
    },
  );

  if (response.status === 401) {
    throw new MarketDataError(`${provider.name} API key rejected`, 502);
  }

  if (!response.ok) {
    throw new MarketDataError(
      `${provider.name} price request failed for ${symbol}`,
      response.status,
    );
  }

  const data = await response.json();
  const price = Number(data?.data?.ld ?? data?.data?.c);

  if (!Number.isFinite(price)) {
    throw new MarketDataError(`Invalid ${provider.name} price for ${symbol}`, 502);
  }

  return {
    symbol,
    source: provider.slug as "itick",
    price,
  };
}

async function fetchItickCandles(
  provider: ProviderRecord,
  symbol: string,
  timeframe: string,
  limit: number,
) {
  const token = getProviderToken(provider);

  if (!token) {
    throw new MarketDataError(
      `${provider.name} API key not configured on server`,
      503,
    );
  }

  const kType = ITICK_TIMEFRAME_MAP[timeframe] ?? 1;
  const clampedLimit = Math.min(Math.max(limit, 1), 1000);
  const response = await fetchJson(
    buildProviderUrl(
      provider,
      "/forex/kline",
      {
        region: ITICK_REGION,
        code: symbol,
        kType,
        limit: clampedLimit,
      },
      token,
    ),
    {
      headers: getProviderHeaders(provider, token, {
        accept: "application/json",
      }),
    },
  );

  if (response.status === 401) {
    throw new MarketDataError(`${provider.name} API key rejected`, 502);
  }

  if (!response.ok) {
    throw new MarketDataError(
      `${provider.name} candles request failed for ${symbol}`,
      response.status,
    );
  }

  const data = await response.json();

  if (!(data?.code === 0 && Array.isArray(data?.data))) {
    throw new MarketDataError(
      data?.msg || `Invalid ${provider.name} candles payload`,
      502,
    );
  }

  return data.data.map((candle: any) => {
    let date = typeof candle?.t === "number" ? candle.t : Date.now();
    if (date > 0 && date < 1e11) date *= 1000;

    return {
      Date: date,
      Open: Number(candle?.o),
      High: Number(candle?.h),
      Low: Number(candle?.l),
      Close: Number(candle?.c),
      Volume: Number(candle?.v) || 0,
    };
  });
}

async function fetchItickSnapshot(provider: ProviderRecord, symbol: string) {
  const [priceData, candles] = await Promise.all([
    fetchItickPrice(provider, symbol),
    fetchItickCandles(provider, symbol, "1d", 2),
  ]);

  const sortedCandles = [...candles].sort((a, b) => a.Date - b.Date);
  const previousClose =
    sortedCandles.length >= 2
      ? sortedCandles[sortedCandles.length - 2]?.Close
      : sortedCandles[0]?.Close;
  const priceChangePercent = previousClose
    ? ((priceData.price - previousClose) / previousClose) * 100
    : 0;

  return {
    symbol,
    source: provider.slug as "itick",
    price: priceData.price,
    previousClose: previousClose ?? priceData.price,
    priceChangePercent,
    change: `${priceChangePercent.toFixed(2)}%`,
  };
}

// =================== Tiingo ===================

function getTiingoAuthHeaders(_provider: ProviderRecord, token: string) {
  return { Authorization: `Token ${token}` };
}

function buildTiingoTimeWindow(
  resampleFreq: string,
  limit: number,
  market: "crypto" | "forex",
  attempt: number,
) {
  const clampedLimit = Math.min(Math.max(limit, 1), 1000);
  const barMs = TIINGO_BAR_MS[resampleFreq] ?? 300_000;
  const baseLookbackMs = barMs * clampedLimit;
  const expansionMultiplier = market === "forex" ? 4 : 2;
  const minimumLookbackMs =
    market === "forex"
      ? resampleFreq === "1day" || resampleFreq === "1week"
        ? 45 * 24 * 60 * 60 * 1000
        : 72 * 60 * 60 * 1000
      : resampleFreq === "1day" || resampleFreq === "1week"
        ? 14 * 24 * 60 * 60 * 1000
        : 6 * 60 * 60 * 1000;
  const retryMultiplier = attempt === 0 ? 1 : attempt === 1 ? 3 : 7;
  const lookbackMs = Math.max(
    baseLookbackMs * expansionMultiplier * retryMultiplier,
    minimumLookbackMs,
  );
  const endDateMs = Date.now() + barMs;

  return {
    startDate: new Date(endDateMs - lookbackMs).toISOString(),
    endDate: new Date(endDateMs).toISOString(),
  };
}

function normalizeTiingoCandles(
  candles: CandleData[],
  limit: number,
): CandleData[] {
  const deduplicated = new Map<number, CandleData>();

  for (const candle of candles) {
    const date = Number(candle.Date);
    const open = Number(candle.Open);
    const high = Number(candle.High);
    const low = Number(candle.Low);
    const close = Number(candle.Close);
    const volume = Number(candle.Volume) || 0;

    if (
      !Number.isFinite(date) ||
      !Number.isFinite(open) ||
      !Number.isFinite(high) ||
      !Number.isFinite(low) ||
      !Number.isFinite(close)
    ) {
      continue;
    }

    deduplicated.set(date, {
      Date: date,
      Open: open,
      High: high,
      Low: low,
      Close: close,
      Volume: volume,
    });
  }

  return [...deduplicated.values()]
    .sort((left, right) => left.Date - right.Date)
    .slice(-Math.min(Math.max(limit, 1), 1000));
}

function toTiingoCryptoTicker(symbol: string) {
  // Tiingo crypto uses e.g. "btcusd" not "btcusdt". Strip trailing "T" from USDT pairs.
  const s = symbol.toLowerCase();
  if (s.endsWith("usdt")) return s.slice(0, -1);
  return s;
}

function toTiingoForexTicker(symbol: string) {
  // Tiingo forex uses lowercase pair e.g. "eurusd"
  return symbol.toLowerCase();
}

/**
 * Detect whether a symbol should use Tiingo's forex or crypto endpoints.
 * Forex pairs are 6 alpha chars without crypto suffixes (EURUSD, GBPJPY, etc.).
 */
function isTiingoForexSymbol(symbol: string): boolean {
  return !isCryptoSymbol(symbol);
}

function requireTiingoToken(provider: ProviderRecord) {
  const token = getProviderToken(provider);
  if (!token) {
    throw new MarketDataError(
      `${provider.name} API key not configured on server`,
      503,
    );
  }
  return token;
}

function handleTiingoAuthError(provider: ProviderRecord, response: Response) {
  if (response.status === 401 || response.status === 403) {
    throw new MarketDataError(`${provider.name} API key rejected`, 502);
  }
}

// ---------- Tiingo Crypto ----------

async function fetchTiingoCryptoPrice(provider: ProviderRecord, symbol: string, token: string) {
  const ticker = toTiingoCryptoTicker(symbol);
  const url = `${provider.restBaseUrl}/tiingo/crypto/top?tickers=${ticker}`;
  const response = await fetchJson(url, {
    headers: getTiingoAuthHeaders(provider, token),
  });

  handleTiingoAuthError(provider, response);
  if (!response.ok) {
    throw new MarketDataError(
      `${provider.name} crypto price request failed for ${symbol}`,
      response.status,
    );
  }

  const data = await response.json();
  const entry = Array.isArray(data) ? data[0] : null;
  const topData = entry?.topOfBookData?.[0];
  const price = Number(topData?.lastPrice ?? topData?.askPrice);

  if (!Number.isFinite(price)) {
    throw new MarketDataError(`Invalid ${provider.name} crypto price for ${symbol}`, 502);
  }

  return price;
}

async function fetchTiingoCryptoCandles(
  provider: ProviderRecord,
  symbol: string,
  timeframe: string,
  limit: number,
  token: string,
): Promise<CandleData[]> {
  const ticker = toTiingoCryptoTicker(symbol);
  const resampleFreq = TIINGO_RESAMPLE_MAP[timeframe] ?? "5min";
  const headers = getTiingoAuthHeaders(provider, token);

  for (let attempt = 0; attempt < TIINGO_MAX_RETRIES; attempt += 1) {
    const { startDate, endDate } = buildTiingoTimeWindow(
      resampleFreq,
      limit,
      "crypto",
      attempt,
    );
    const url = buildProviderUrl(
      provider,
      "/tiingo/crypto/prices",
      {
        tickers: ticker,
        startDate,
        endDate,
        resampleFreq,
      },
      null,
    );
    const response = await fetchJson(url, { headers });

    handleTiingoAuthError(provider, response);
    if (!response.ok) {
      throw new MarketDataError(
        `${provider.name} crypto candles request failed for ${symbol}`,
        response.status,
      );
    }

    const data = await response.json();
    const entry = Array.isArray(data) ? data[0] : null;
    const priceData = entry?.priceData;

    if (!Array.isArray(priceData)) {
      throw new MarketDataError(
        `Invalid ${provider.name} crypto candles payload`,
        502,
      );
    }

    const candles = normalizeTiingoCandles(
      priceData.map((candle: any) => ({
        Date: new Date(candle.date).getTime(),
        Open: Number(candle.open),
        High: Number(candle.high),
        Low: Number(candle.low),
        Close: Number(candle.close),
        Volume: Number(candle.volume) || 0,
      })),
      limit,
    );

    if (candles.length > 0 || attempt === TIINGO_MAX_RETRIES - 1) {
      return candles;
    }
  }

  return [];
}

// ---------- Tiingo Forex ----------

async function fetchTiingoForexPrice(provider: ProviderRecord, symbol: string, token: string) {
  const ticker = toTiingoForexTicker(symbol);
  const url = `${provider.restBaseUrl}/tiingo/fx/${ticker}/top`;
  const response = await fetchJson(url, {
    headers: getTiingoAuthHeaders(provider, token),
  });

  handleTiingoAuthError(provider, response);
  if (!response.ok) {
    throw new MarketDataError(
      `${provider.name} forex price request failed for ${symbol}`,
      response.status,
    );
  }

  const data = await response.json();
  const entry = Array.isArray(data) ? data[0] : data;

  // Prefer midPrice, fallback to average of bid/ask
  let price = Number(entry?.midPrice);
  if (!Number.isFinite(price)) {
    const bid = Number(entry?.bidPrice);
    const ask = Number(entry?.askPrice);
    if (Number.isFinite(bid) && Number.isFinite(ask)) {
      price = (bid + ask) / 2;
    }
  }

  if (!Number.isFinite(price)) {
    throw new MarketDataError(`Invalid ${provider.name} forex price for ${symbol}`, 502);
  }

  return price;
}

async function fetchTiingoForexCandles(
  provider: ProviderRecord,
  symbol: string,
  timeframe: string,
  limit: number,
  token: string,
): Promise<CandleData[]> {
  const ticker = toTiingoForexTicker(symbol);
  const resampleFreq = TIINGO_RESAMPLE_MAP[timeframe] ?? "5min";
  const headers = getTiingoAuthHeaders(provider, token);

  for (let attempt = 0; attempt < TIINGO_MAX_RETRIES; attempt += 1) {
    const { startDate, endDate } = buildTiingoTimeWindow(
      resampleFreq,
      limit,
      "forex",
      attempt,
    );
    const url = buildProviderUrl(
      provider,
      `/tiingo/fx/${ticker}/prices`,
      {
        startDate,
        endDate,
        resampleFreq,
      },
      null,
    );
    const response = await fetchJson(url, { headers });

    handleTiingoAuthError(provider, response);
    if (!response.ok) {
      throw new MarketDataError(
        `${provider.name} forex candles request failed for ${symbol}`,
        response.status,
      );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new MarketDataError(
        `Invalid ${provider.name} forex candles payload`,
        502,
      );
    }

    const candles = normalizeTiingoCandles(
      data.map((candle: any) => ({
        Date: new Date(candle.date).getTime(),
        Open: Number(candle.open),
        High: Number(candle.high),
        Low: Number(candle.low),
        Close: Number(candle.close),
        Volume: 0,
      })),
      limit,
    );

    if (candles.length > 0 || attempt === TIINGO_MAX_RETRIES - 1) {
      return candles;
    }
  }

  return [];
}

// ---------- Tiingo Unified (routes to crypto or forex) ----------

async function fetchTiingoPrice(provider: ProviderRecord, symbol: string) {
  const token = requireTiingoToken(provider);
  const forex = isTiingoForexSymbol(symbol);
  const price = forex
    ? await fetchTiingoForexPrice(provider, symbol, token)
    : await fetchTiingoCryptoPrice(provider, symbol, token);

  return { symbol, source: "tiingo" as const, price };
}

async function fetchTiingoCandles(
  provider: ProviderRecord,
  symbol: string,
  timeframe: string,
  limit: number,
): Promise<CandleData[]> {
  const token = requireTiingoToken(provider);
  return isTiingoForexSymbol(symbol)
    ? fetchTiingoForexCandles(provider, symbol, timeframe, limit, token)
    : fetchTiingoCryptoCandles(provider, symbol, timeframe, limit, token);
}

async function fetchTiingoSnapshot(provider: ProviderRecord, symbol: string) {
  const [priceData, candles] = await Promise.all([
    fetchTiingoPrice(provider, symbol),
    fetchTiingoCandles(provider, symbol, "1d", 2),
  ]);

  const sortedCandles = [...candles].sort((a, b) => a.Date - b.Date);
  const previousClose =
    sortedCandles.length >= 2
      ? sortedCandles[sortedCandles.length - 2]?.Close
      : sortedCandles[0]?.Close;
  const priceChangePercent = previousClose
    ? ((priceData.price - previousClose) / previousClose) * 100
    : 0;

  return {
    symbol,
    source: "tiingo" as const,
    price: priceData.price,
    previousClose: previousClose ?? priceData.price,
    priceChangePercent,
    change: `${priceChangePercent.toFixed(2)}%`,
  };
}
