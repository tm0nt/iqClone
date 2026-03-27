import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { defaultTradingPairs, isCryptoSymbol } from "@/lib/forex-data";

const CACHE_TTL_MS = 15_000;

type MarketProviderSeed = {
  slug: string;
  name: string;
  type: "forex" | "crypto";
  restBaseUrl: string;
  wsBaseUrl?: string | null;
  authType: "none" | "header" | "query";
  authHeaderName?: string | null;
  authQueryParam?: string | null;
  envKey?: string | null;
  isActive: boolean;
  sortOrder: number;
};

type TradingPairRecord = Awaited<ReturnType<typeof loadTradingPairs>>[number];
type MarketProviderRecord = Awaited<
  ReturnType<typeof loadMarketProviders>
>[number];

type CachedValue<T> = {
  value: T;
  expiresAt: number;
};

type RegistryState = {
  marketProvidersCache: CachedValue<Map<string, MarketProviderRecord>> | null;
  tradingPairsCache: CachedValue<Map<string, TradingPairRecord>> | null;
  bootstrapPromise: Promise<void> | null;
  marketProvidersPromise: Promise<Map<string, MarketProviderRecord>> | null;
  tradingPairsPromise: Promise<Map<string, TradingPairRecord>> | null;
};

const defaultMarketProviders: MarketProviderSeed[] = [
  {
    slug: "binance",
    name: "BINANCE",
    type: "crypto",
    restBaseUrl: "https://api.binance.com",
    wsBaseUrl: "wss://stream.binance.com:9443/ws",
    authType: "none",
    authHeaderName: null,
    authQueryParam: null,
    envKey: null,
    isActive: true,
    sortOrder: 1,
  },
  {
    slug: "itick",
    name: "ITICK",
    type: "forex",
    restBaseUrl: "https://api.itick.org",
    wsBaseUrl: "wss://api.itick.org/forex",
    authType: "header",
    authHeaderName: "token",
    authQueryParam: "token",
    envKey: null,
    isActive: true,
    sortOrder: 2,
  },
  {
    slug: "tiingo",
    name: "TIINGO",
    type: "crypto",
    restBaseUrl: "https://api.tiingo.com",
    wsBaseUrl: "wss://api.tiingo.com/crypto",
    authType: "header",
    authHeaderName: "Authorization",
    authQueryParam: "token",
    envKey: "TIINGO_API_KEY",
    isActive: true,
    sortOrder: 3,
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __MARKET_REGISTRY_STATE__: RegistryState | undefined;
}

const registryState: RegistryState =
  globalThis.__MARKET_REGISTRY_STATE__ ?? {
    marketProvidersCache: null,
    tradingPairsCache: null,
    bootstrapPromise: null,
    marketProvidersPromise: null,
    tradingPairsPromise: null,
  };

if (!globalThis.__MARKET_REGISTRY_STATE__) {
  globalThis.__MARKET_REGISTRY_STATE__ = registryState;
}

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function providerSlugForPair(pair: {
  provider?: string | null;
  type: "forex" | "crypto";
}) {
  const raw = pair.provider?.trim().toLowerCase();
  if (raw) return raw;
  return pair.type === "crypto" ? "binance" : "itick";
}

async function loadMarketProviders() {
  return prisma.marketDataProvider.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

async function loadTradingPairs() {
  return prisma.tradingPair.findMany({
    include: {
      marketProvider: true,
    },
  });
}

export function invalidateMarketRegistryCaches() {
  registryState.marketProvidersCache = null;
  registryState.tradingPairsCache = null;
}

async function bootstrapMarketRegistry() {
  // Always ensure all default providers exist (creates missing ones)
  await prisma.marketDataProvider.createMany({
    data: defaultMarketProviders,
    skipDuplicates: true,
  });

  const pairsCount = await prisma.tradingPair.count();
  if (pairsCount === 0) {
    const providers = await loadMarketProviders();
    const providersBySlug = new Map(
      providers.map((provider) => [provider.slug.toLowerCase(), provider]),
    );
    const pairsToCreate: Prisma.TradingPairCreateManyInput[] = [];

    for (const [index, pair] of defaultTradingPairs.entries()) {
      const providerSlug = providerSlugForPair({
        provider: pair.provider,
        type: pair.type,
      });
      const provider = providersBySlug.get(providerSlug);
      if (!provider) continue;

      pairsToCreate.push({
        symbol: pair.symbol.toUpperCase(),
        name: pair.name,
        type: pair.type,
        provider: provider.name,
        providerId: provider.id,
        priceSource: provider.slug,
        payoutRate: pair.payoutRate ?? 0.9,
        isActive: pair.isActive ?? true,
        favorite: pair.favorite ?? false,
        displayOrder: pair.displayOrder ?? index,
        imageUrl: pair.image,
        color: pair.color,
        logo: pair.logo,
        description: pair.description ?? null,
      });
    }

    await prisma.tradingPair.createMany({
      data: pairsToCreate,
      skipDuplicates: true,
    });
  }

  invalidateMarketRegistryCaches();
}

export async function ensureDefaultMarketProviders() {
  if (!registryState.bootstrapPromise) {
    registryState.bootstrapPromise = bootstrapMarketRegistry().finally(() => {
      registryState.bootstrapPromise = null;
    });
  }

  await registryState.bootstrapPromise;
}

export async function getMarketProvidersMap() {
  if (
    registryState.marketProvidersCache &&
    registryState.marketProvidersCache.expiresAt > Date.now()
  ) {
    return registryState.marketProvidersCache.value;
  }

  if (!registryState.marketProvidersPromise) {
    registryState.marketProvidersPromise = (async () => {
      await ensureDefaultMarketProviders();
      const providers = await loadMarketProviders();
      const map = new Map(
        providers.map((provider) => [provider.slug.toLowerCase(), provider]),
      );

      registryState.marketProvidersCache = {
        value: map,
        expiresAt: Date.now() + CACHE_TTL_MS,
      };

      return map;
    })().finally(() => {
      registryState.marketProvidersPromise = null;
    });
  }

  return registryState.marketProvidersPromise;
}

export async function ensureDefaultTradingPairs() {
  await ensureDefaultMarketProviders();
}

export async function getTradingPairsMap() {
  if (
    registryState.tradingPairsCache &&
    registryState.tradingPairsCache.expiresAt > Date.now()
  ) {
    return registryState.tradingPairsCache.value;
  }

  if (!registryState.tradingPairsPromise) {
    registryState.tradingPairsPromise = (async () => {
      await ensureDefaultTradingPairs();
      const pairs = await loadTradingPairs();
      const map = new Map(
        pairs.map((pair) => [pair.symbol.toUpperCase(), pair]),
      );

      registryState.tradingPairsCache = {
        value: map,
        expiresAt: Date.now() + CACHE_TTL_MS,
      };

      return map;
    })().finally(() => {
      registryState.tradingPairsPromise = null;
    });
  }

  return registryState.tradingPairsPromise;
}

export async function getActiveTradingPairs() {
  const pairs = await getTradingPairsMap();
  return [...pairs.values()].filter((pair) => {
    if (!pair.isActive) return false;
    if (pair.marketProvider && !pair.marketProvider.isActive) return false;
    return true;
  });
}

export async function resolveMarketSourceForSymbol(symbol: string) {
  const normalized = normalizeSymbol(symbol);
  const [providers, pairs] = await Promise.all([
    getMarketProvidersMap(),
    getTradingPairsMap(),
  ]);

  const pair = pairs.get(normalized);
  if (pair) {
    const providerSlug = (
      pair.marketProvider?.slug ||
      pair.priceSource ||
      pair.provider ||
      ""
    ).toLowerCase();
    const provider = providers.get(providerSlug);

    return {
      symbol: normalized,
      pair,
      provider,
      marketSymbol: pair.priceSymbol || normalized,
    };
  }

  const fallbackProvider = providers.get(
    isCryptoSymbol(normalized) ? "binance" : "itick",
  );

  return {
    symbol: normalized,
    pair: null,
    provider: fallbackProvider,
    marketSymbol: normalized,
  };
}
