import { isCryptoSymbol } from "@/lib/forex-data";

type PriceCallback = (price: number, raw?: any) => void;
type MessageCallback = (data: any) => void;

const DEFAULT_POLL_MS = 1000;
const MAX_POLL_MS = 15000;

class PollingPriceManager {
  private callbacks = new Map<string, Set<PriceCallback>>();
  private messageHandlers = new Set<MessageCallback>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();
  private pollDelayBySymbol = new Map<string, number>();
  private inflight = new Set<string>();

  subscribe(symbol: string, cb: PriceCallback) {
    const key = symbol.toUpperCase();
    if (!this.callbacks.has(key)) {
      this.callbacks.set(key, new Set());
    }

    this.callbacks.get(key)?.add(cb);
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

    const delay = this.pollDelayBySymbol.get(symbol) ?? DEFAULT_POLL_MS;
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
        throw new Error(payload?.error || `Failed to fetch price for ${symbol}`);
      }

      const price = Number(payload?.price);
      if (!Number.isFinite(price)) {
        throw new Error(`Invalid price payload for ${symbol}`);
      }

      const raw = {
        source: payload?.source ?? (isCryptoSymbol(symbol) ? "binance" : "itick"),
        symbol,
        price,
        t: Date.now(),
      };

      this.pollDelayBySymbol.set(symbol, DEFAULT_POLL_MS);
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
    } catch {
      const nextDelay = Math.min(
        (this.pollDelayBySymbol.get(symbol) ?? DEFAULT_POLL_MS) * 2,
        MAX_POLL_MS,
      );
      this.pollDelayBySymbol.set(symbol, nextDelay);
    } finally {
      this.inflight.delete(symbol);
      this.start(symbol);
    }
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

  sourceFor(symbol: string): "binance" | "itick" {
    return isCryptoSymbol(symbol) ? "binance" : "itick";
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
  const response = await fetch(`/api/market/price?symbol=${encodeURIComponent(symbol.toUpperCase())}`, {
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
