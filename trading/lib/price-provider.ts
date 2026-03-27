import { isCryptoSymbol } from "@/lib/forex-data";

type PriceCallback = (price: number, raw?: any) => void;
type MessageCallback = (data: any) => void;
type PriceTick = {
  price: number;
  raw: {
    source: "binance" | "tiingo";
    symbol: string;
    price: number;
    t: number;
  };
};

const SUCCESS_POLL_MS = {
  binance: 1_000,
  tiingo: 10_000,
} as const;

const MAX_POLL_MS = {
  binance: 15_000,
  tiingo: 60_000,
} as const;

const RATE_LIMIT_BACKOFF_MS = 5 * 60_000;

class PollingPriceManager {
  private callbacks = new Map<string, Set<PriceCallback>>();
  private messageHandlers = new Set<MessageCallback>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();
  private pollDelayBySymbol = new Map<string, number>();
  private inflight = new Set<string>();
  private latestTicks = new Map<string, PriceTick>();

  private sourceFor(symbol: string): "binance" | "tiingo" {
    return isCryptoSymbol(symbol) ? "binance" : "tiingo";
  }

  private getSuccessPollMs(symbol: string) {
    return SUCCESS_POLL_MS[this.sourceFor(symbol)];
  }

  private getMaxPollMs(symbol: string) {
    return MAX_POLL_MS[this.sourceFor(symbol)];
  }

  private getFreshTick(symbol: string) {
    const tick = this.latestTicks.get(symbol);
    if (!tick) return null;

    if (Date.now() - tick.raw.t > this.getSuccessPollMs(symbol)) {
      return null;
    }

    return tick;
  }

  subscribe(symbol: string, cb: PriceCallback) {
    const key = symbol.toUpperCase();
    if (!this.callbacks.has(key)) {
      this.callbacks.set(key, new Set());
    }

    this.callbacks.get(key)?.add(cb);

    const cachedTick = this.getFreshTick(key);
    if (cachedTick) {
      try {
        cb(cachedTick.price, cachedTick.raw);
      } catch {}
      this.start(key);
      return;
    }

    this.start(key, true);
  }

  unsubscribe(symbol: string, cb: PriceCallback) {
    const key = symbol.toUpperCase();
    const handlers = this.callbacks.get(key);
    if (!handlers) return;

    handlers.delete(cb);
    if (handlers.size === 0) {
      this.callbacks.delete(key);
      this.stop(key);
    }
  }

  clearSubscriptions() {
    this.callbacks.clear();
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.pollDelayBySymbol.clear();
    this.inflight.clear();
  }

  registerMessageHandler(cb: MessageCallback) {
    this.messageHandlers.add(cb);
  }

  unregisterMessageHandler(cb: MessageCallback) {
    this.messageHandlers.delete(cb);
  }

  close() {
    this.clearSubscriptions();
    this.messageHandlers.clear();
  }

  private start(symbol: string, immediate = false) {
    if (!this.callbacks.has(symbol)) return;

    if (immediate) {
      this.poll(symbol);
      return;
    }

    if (this.timers.has(symbol)) return;

    const delay = this.pollDelayBySymbol.get(symbol) ?? this.getSuccessPollMs(symbol);
    const timer = setTimeout(() => {
      this.timers.delete(symbol);
      this.poll(symbol);
    }, delay);

    this.timers.set(symbol, timer);
  }

  private stop(symbol: string) {
    const timer = this.timers.get(symbol);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(symbol);
    }
    this.pollDelayBySymbol.delete(symbol);
    this.inflight.delete(symbol);
  }

  private async poll(symbol: string) {
    if (!this.callbacks.has(symbol) || this.inflight.has(symbol)) {
      this.start(symbol);
      return;
    }

    this.inflight.add(symbol);

    try {
      const response = await fetch(
        `/api/market/price?symbol=${encodeURIComponent(symbol)}`,
        {
          cache: "no-store",
        },
      );
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const retryAfterHeader = response.headers.get("retry-after");
        const retryAfterMs = retryAfterHeader
          ? Number.parseInt(retryAfterHeader, 10) * 1000
          : Number(payload?.retryAfterMs) || undefined;
        const error = new Error(
          payload?.error || `Failed to fetch price for ${symbol}`,
        ) as Error & { status?: number; retryAfterMs?: number };
        error.status = response.status;
        error.retryAfterMs = retryAfterMs;
        throw error;
      }

      const price = Number(payload?.price);
      if (!Number.isFinite(price)) {
        throw new Error(`Invalid price payload for ${symbol}`);
      }

      const source = payload?.source ?? this.sourceFor(symbol);
      const raw = {
        source,
        symbol,
        price,
        t: Date.now(),
      } satisfies PriceTick["raw"];

      this.latestTicks.set(symbol, { price, raw });
      this.pollDelayBySymbol.set(symbol, this.getSuccessPollMs(symbol));
      this.callbacks.get(symbol)?.forEach((cb) => {
        try {
          cb(price, raw);
        } catch {}
      });
      this.messageHandlers.forEach((cb) => {
        try {
          cb(raw);
        } catch {}
      });
    } catch (error) {
      const typedError = error as Error & { status?: number; retryAfterMs?: number };
      const currentDelay =
        this.pollDelayBySymbol.get(symbol) ?? this.getSuccessPollMs(symbol);
      const nextDelay =
        typedError.status === 429
          ? Math.max(typedError.retryAfterMs ?? RATE_LIMIT_BACKOFF_MS, currentDelay)
          : Math.min(currentDelay * 2, this.getMaxPollMs(symbol));

      this.pollDelayBySymbol.set(symbol, nextDelay);
    } finally {
      this.inflight.delete(symbol);
      this.start(symbol);
    }
  }

  getCachedPrice(symbol: string): number | null {
    const tick = this.getFreshTick(symbol.toUpperCase());
    return tick?.price ?? null;
  }
}

class PriceProvider {
  private polling = new PollingPriceManager();

  subscribe(symbol: string, cb: PriceCallback) {
    this.polling.subscribe(symbol, cb);
  }

  unsubscribe(symbol: string, cb: PriceCallback) {
    this.polling.unsubscribe(symbol, cb);
  }

  clearSubscriptions() {
    this.polling.clearSubscriptions();
  }

  registerMessageHandler(cb: MessageCallback) {
    this.polling.registerMessageHandler(cb);
  }

  unregisterMessageHandler(cb: MessageCallback) {
    this.polling.unregisterMessageHandler(cb);
  }

  sourceFor(symbol: string): "binance" | "tiingo" {
    return isCryptoSymbol(symbol) ? "binance" : "tiingo";
  }

  getCachedPrice(symbol: string) {
    return this.polling.getCachedPrice(symbol);
  }

  close() {
    this.polling.close();
  }
}

declare global {
  interface Window {
    __PRICE_PROVIDER__?: PriceProvider;
  }
}

function getSingleton(): PriceProvider {
  if (typeof window !== "undefined") {
    if (!window.__PRICE_PROVIDER__) {
      window.__PRICE_PROVIDER__ = new PriceProvider();
    }
    return window.__PRICE_PROVIDER__;
  }

  return new PriceProvider();
}

export const priceProvider = getSingleton();

export const subscribeToPriceUpdates = priceProvider.subscribe.bind(priceProvider);
export const unsubscribeFromPriceUpdates = priceProvider.unsubscribe.bind(priceProvider);
export const clearSubscriptions = priceProvider.clearSubscriptions.bind(priceProvider);
export const registerMessageHandler = priceProvider.registerMessageHandler.bind(priceProvider);
export const unregisterMessageHandler = priceProvider.unregisterMessageHandler.bind(priceProvider);

export async function fetchCurrentPrice(symbol: string): Promise<number> {
  const normalized = symbol.toUpperCase();
  const cachedPrice = priceProvider.getCachedPrice(normalized);
  if (cachedPrice !== null) {
    return cachedPrice;
  }

  const response = await fetch(`/api/market/price?symbol=${encodeURIComponent(normalized)}`, {
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || `Failed to fetch price for ${symbol}`);
  }

  const price = Number(payload?.price);
  if (!Number.isFinite(price)) {
    throw new Error(`Invalid price payload for ${symbol}`);
  }

  return price;
}
