/**
 * Client-side Price Provider for real-time pricing.
 * Crypto → Binance WebSocket | Forex → iTick WebSocket
 */

type PriceCallback = (price: number) => void;

function isCryptoSymbol(symbol: string): boolean {
  return /USDT$|BUSD$|BTC$|ETH$|BNB$/i.test(symbol.toUpperCase());
}

// ================== Binance WebSocket (Crypto) ==================

class BinanceWSManager {
  private sockets = new Map<string, WebSocket>();
  private callbacks = new Map<string, Set<PriceCallback>>();
  private reconnectTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private lastEmitTime = new Map<string, number>();

  subscribe(symbol: string, cb: PriceCallback) {
    const key = symbol.toUpperCase();
    if (!this.callbacks.has(key)) this.callbacks.set(key, new Set());
    this.callbacks.get(key)!.add(cb);
    if (!this.sockets.has(key)) this.connect(key);
  }

  unsubscribe(symbol: string, cb: PriceCallback) {
    const key = symbol.toUpperCase();
    const cbs = this.callbacks.get(key);
    if (!cbs) return;
    cbs.delete(cb);
    if (cbs.size === 0) {
      this.callbacks.delete(key);
      this.disconnect(key);
    }
  }

  private connect(symbol: string) {
    const stream = symbol.toLowerCase() + "@trade";
    const url = `wss://stream.binance.com:9443/ws/${stream}`;

    try {
      const ws = new WebSocket(url);
      this.sockets.set(symbol, ws);

      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          const price = parseFloat(data.p);
          if (!isNaN(price)) {
            const now = Date.now();
            const last = this.lastEmitTime.get(symbol) || 0;
            if (now - last >= 100) {
              this.lastEmitTime.set(symbol, now);
              this.callbacks.get(symbol)?.forEach((cb) => { try { cb(price); } catch {} });
            }
          }
        } catch {}
      };

      ws.onerror = () => { this.disconnect(symbol); this.scheduleReconnect(symbol); };
      ws.onclose = () => { this.sockets.delete(symbol); if (this.callbacks.has(symbol)) this.scheduleReconnect(symbol); };
    } catch {
      this.scheduleReconnect(symbol);
    }
  }

  private disconnect(symbol: string) {
    const ws = this.sockets.get(symbol);
    if (ws) { try { ws.close(); } catch {} this.sockets.delete(symbol); }
    const timer = this.reconnectTimers.get(symbol);
    if (timer) { clearTimeout(timer); this.reconnectTimers.delete(symbol); }
  }

  private scheduleReconnect(symbol: string) {
    if (this.reconnectTimers.has(symbol)) return;
    const timer = setTimeout(() => {
      this.reconnectTimers.delete(symbol);
      if (this.callbacks.has(symbol)) this.connect(symbol);
    }, 3000);
    this.reconnectTimers.set(symbol, timer);
  }
}

// ================== iTick WebSocket (Forex) ==================

class ITickWSManager {
  private ws: WebSocket | null = null;
  private callbacks = new Map<string, Set<PriceCallback>>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private subscribedSymbols = new Set<string>();
  private lastEmitTime = new Map<string, number>();

  subscribe(symbol: string, cb: PriceCallback) {
    const key = symbol.toUpperCase();
    if (!this.callbacks.has(key)) this.callbacks.set(key, new Set());
    this.callbacks.get(key)!.add(cb);
    this.subscribedSymbols.add(key);
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connect();
    } else {
      this.sendSubscribe(key);
    }
  }

  unsubscribe(symbol: string, cb: PriceCallback) {
    const key = symbol.toUpperCase();
    const cbs = this.callbacks.get(key);
    if (!cbs) return;
    cbs.delete(cb);
    if (cbs.size === 0) {
      this.callbacks.delete(key);
      this.subscribedSymbols.delete(key);
    }
  }

  private connect() {
    const apiKey = (typeof window !== "undefined" && (window as any).__ITICK_API_KEY__)
      || process.env.NEXT_PUBLIC_ITICK_API_KEY;
    if (!apiKey) return;

    try {
      this.ws = new WebSocket(`wss://api.itick.org/forex?token=${apiKey}`);

      this.ws.onopen = () => {
        this.subscribedSymbols.forEach((s) => this.sendSubscribe(s));
      };

      this.ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          if ((msg.type === "quote" || msg.type === "tick") && msg.data) {
            const symbol = (msg.symbol || msg.data?.s || "").replace("$GB", "").toUpperCase();
            const price = msg.data?.ld || msg.data?.c;
            if (symbol && price) {
              const now = Date.now();
              const last = this.lastEmitTime.get(symbol) || 0;
              if (now - last >= 100) {
                this.lastEmitTime.set(symbol, now);
                this.callbacks.get(symbol)?.forEach((cb) => { try { cb(price); } catch {} });
              }
            }
          }
        } catch {}
      };

      this.ws.onerror = () => { this.ws = null; this.scheduleReconnect(); };
      this.ws.onclose = () => { this.ws = null; if (this.subscribedSymbols.size > 0) this.scheduleReconnect(); };
    } catch {
      this.scheduleReconnect();
    }
  }

  private sendSubscribe(symbol: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: "subscribe",
        symbol: `${symbol}$GB`,
      }));
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.subscribedSymbols.size > 0) this.connect();
    }, 3000);
  }
}

// ================== Unified Singleton ==================

class PriceProviderSingleton {
  private binance = new BinanceWSManager();
  private itick = new ITickWSManager();

  subscribe(symbol: string, cb: PriceCallback) {
    if (isCryptoSymbol(symbol)) {
      this.binance.subscribe(symbol, cb);
    } else {
      this.itick.subscribe(symbol, cb);
    }
  }

  unsubscribe(symbol: string, cb: PriceCallback) {
    if (isCryptoSymbol(symbol)) {
      this.binance.unsubscribe(symbol, cb);
    } else {
      this.itick.unsubscribe(symbol, cb);
    }
  }
}

declare global {
  interface Window {
    __PRICE_PROVIDER__?: PriceProviderSingleton;
  }
}

function getSingleton(): PriceProviderSingleton {
  if (typeof window !== "undefined") {
    if (!window.__PRICE_PROVIDER__) window.__PRICE_PROVIDER__ = new PriceProviderSingleton();
    return window.__PRICE_PROVIDER__;
  }
  return new PriceProviderSingleton();
}

export const priceProvider = getSingleton();
export const subscribeToPriceUpdates = priceProvider.subscribe.bind(priceProvider);
export const unsubscribeFromPriceUpdates = priceProvider.unsubscribe.bind(priceProvider);

export async function fetchCurrentPrice(symbol: string): Promise<number> {
  const res = await fetch(`/api/price?symbol=${encodeURIComponent(symbol)}`);
  if (!res.ok) throw new Error("Failed to fetch price");
  const data = await res.json();
  return data.price;
}
