import { getMarketProvidersMap } from "@/lib/server/market-registry";

export type MarketNewsItem = {
  id: string;
  title: string;
  description: string | null;
  source: string | null;
  url: string | null;
  publishedDate: string | null;
  tickers: string[];
  tags: string[];
};

const INVALID_TOKENS = new Set([
  "",
  "your-api-key-here",
  "sua-chave-itick-aqui",
]);

function sanitizeToken(token?: string | null) {
  const normalized = token?.trim() ?? "";
  if (!normalized || INVALID_TOKENS.has(normalized)) {
    return null;
  }
  return normalized;
}

function deriveSymbolQuery(symbol?: string | null) {
  if (!symbol) return null;

  const normalized = symbol.trim().toUpperCase();
  if (!normalized) return null;

  if (normalized.endsWith("USDT")) {
    return normalized.slice(0, -4).toLowerCase();
  }

  return normalized.toLowerCase();
}

async function getTiingoProvider() {
  const providers = await getMarketProvidersMap();
  return providers.get("tiingo") ?? null;
}

async function getTiingoToken() {
  const provider = await getTiingoProvider();
  if (!provider || !provider.isActive) {
    return null;
  }

  const persistedToken = sanitizeToken(provider.authToken);
  if (persistedToken) {
    return { provider, token: persistedToken };
  }

  if (provider.envKey) {
    const envToken = sanitizeToken(process.env[provider.envKey]);
    if (envToken) {
      return { provider, token: envToken };
    }
  }

  return null;
}

export async function getTiingoNewsAvailability() {
  const resolved = await getTiingoToken();
  return {
    enabled: Boolean(resolved),
    providerName: resolved?.provider.name ?? null,
  };
}

async function fetchNewsFromUrl(url: URL, token: string) {
  const response = await fetch(url.toString(), {
    cache: "no-store",
    headers: {
      accept: "application/json",
      Authorization: `Token ${token}`,
      "user-agent": "Mozilla/5.0 Codex Trading News Proxy",
    },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new Error(`Tiingo news request failed with ${response.status}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.map((item) => ({
    id: String(item.id ?? crypto.randomUUID?.() ?? Math.random()),
    title: String(item.title ?? "Untitled"),
    description:
      typeof item.description === "string" ? item.description : null,
    source: typeof item.source === "string" ? item.source : null,
    url: typeof item.url === "string" ? item.url : null,
    publishedDate:
      typeof item.publishedDate === "string" ? item.publishedDate : null,
    tickers: Array.isArray(item.tickers)
      ? item.tickers.map((ticker: unknown) => String(ticker))
      : [],
    tags: Array.isArray(item.tags)
      ? item.tags.map((tag: unknown) => String(tag))
      : [],
  })) satisfies MarketNewsItem[];
}

export async function fetchTiingoNews(input?: {
  symbol?: string | null;
  limit?: number;
}) {
  const resolved = await getTiingoToken();
  if (!resolved) {
    throw new Error("Tiingo news provider is not active.");
  }

  const limit = Math.min(Math.max(input?.limit ?? 12, 1), 20);
  const primaryUrl = new URL("/tiingo/news", resolved.provider.restBaseUrl);
  primaryUrl.searchParams.set("limit", String(limit));

  const symbolQuery = deriveSymbolQuery(input?.symbol);
  if (symbolQuery) {
    primaryUrl.searchParams.set("tickers", symbolQuery);
  }

  try {
    const primaryItems = await fetchNewsFromUrl(primaryUrl, resolved.token);
    if (primaryItems.length > 0 || !symbolQuery) {
      return primaryItems;
    }
  } catch (error) {
    if (!symbolQuery) {
      throw error;
    }
  }

  const fallbackUrl = new URL("/tiingo/news", resolved.provider.restBaseUrl);
  fallbackUrl.searchParams.set("limit", String(limit));
  return fetchNewsFromUrl(fallbackUrl, resolved.token);
}
