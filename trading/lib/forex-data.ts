// lib/forex-data.ts
import { resolveTradingPairImageUrl } from "@shared/platform/pair-images";

export interface ForexPair {
  id?: string;
  symbol: string;
  name: string;
  logo: string;
  image: string;
  color: string;
  type: "forex" | "crypto";
  basePrice: number;
  change: string;
  priceChangePercent: number;
  favorite?: boolean;
  exchange?: string;
  description?: string;
  payoutRate?: number;
  provider?: string;
  isActive?: boolean;
  displayOrder?: number;
}

// =================== FOREX (iTick) ===================
const majorForexPairs = [
  {
    symbol: "EURUSD",
    name: "EUR/USD",
    logo: "€/$",
    color: "#003399",
    favorite: true,
    description: "Euro vs US Dollar",
  },
  {
    symbol: "GBPUSD",
    name: "GBP/USD",
    logo: "£/$",
    color: "#C8102E",
    favorite: true,
    description: "British Pound vs US Dollar",
  },
  {
    symbol: "USDJPY",
    name: "USD/JPY",
    logo: "$/¥",
    color: "#BC002D",
    favorite: true,
    description: "US Dollar vs Japanese Yen",
  },
  {
    symbol: "USDCHF",
    name: "USD/CHF",
    logo: "$/CHF",
    color: "#DC143C",
    favorite: false,
    description: "US Dollar vs Swiss Franc",
  },
  {
    symbol: "AUDUSD",
    name: "AUD/USD",
    logo: "A$/$",
    color: "#00008B",
    favorite: false,
    description: "Australian Dollar vs US Dollar",
  },
  {
    symbol: "USDCAD",
    name: "USD/CAD",
    logo: "$/C$",
    color: "#FF0000",
    favorite: false,
    description: "US Dollar vs Canadian Dollar",
  },
  {
    symbol: "NZDUSD",
    name: "NZD/USD",
    logo: "NZ$/$",
    color: "#000000",
    favorite: false,
    description: "New Zealand Dollar vs US Dollar",
  },
  {
    symbol: "EURGBP",
    name: "EUR/GBP",
    logo: "€/£",
    color: "#002395",
    favorite: false,
    description: "Euro vs British Pound",
  },
  {
    symbol: "EURJPY",
    name: "EUR/JPY",
    logo: "€/¥",
    color: "#003399",
    favorite: false,
    description: "Euro vs Japanese Yen",
  },
  {
    symbol: "GBPJPY",
    name: "GBP/JPY",
    logo: "£/¥",
    color: "#C8102E",
    favorite: false,
    description: "British Pound vs Japanese Yen",
  },
];

// =================== CRYPTO (Binance) ===================
const majorCryptoPairs = [
  {
    symbol: "BTCUSDT",
    name: "BTC/USDT",
    logo: "₿",
    color: "#F7931A",
    favorite: true,
    description: "Bitcoin vs Tether",
  },
  {
    symbol: "ETHUSDT",
    name: "ETH/USDT",
    logo: "Ξ",
    color: "#627EEA",
    favorite: true,
    description: "Ethereum vs Tether",
  },
  {
    symbol: "BNBUSDT",
    name: "BNB/USDT",
    logo: "BNB",
    color: "#F3BA2F",
    favorite: false,
    description: "Binance Coin vs Tether",
  },
  {
    symbol: "SOLUSDT",
    name: "SOL/USDT",
    logo: "SOL",
    color: "#9945FF",
    favorite: true,
    description: "Solana vs Tether",
  },
  {
    symbol: "XRPUSDT",
    name: "XRP/USDT",
    logo: "XRP",
    color: "#23292F",
    favorite: false,
    description: "Ripple vs Tether",
  },
  {
    symbol: "ADAUSDT",
    name: "ADA/USDT",
    logo: "ADA",
    color: "#0033AD",
    favorite: false,
    description: "Cardano vs Tether",
  },
  {
    symbol: "DOGEUSDT",
    name: "DOGE/USDT",
    logo: "Ð",
    color: "#C2A633",
    favorite: false,
    description: "Dogecoin vs Tether",
  },
  {
    symbol: "DOTUSDT",
    name: "DOT/USDT",
    logo: "DOT",
    color: "#E6007A",
    favorite: false,
    description: "Polkadot vs Tether",
  },
  {
    symbol: "AVAXUSDT",
    name: "AVAX/USDT",
    logo: "AVAX",
    color: "#E84142",
    favorite: false,
    description: "Avalanche vs Tether",
  },
  {
    symbol: "LINKUSDT",
    name: "LINK/USDT",
    logo: "LINK",
    color: "#2A5ADA",
    favorite: false,
    description: "Chainlink vs Tether",
  },
];

// =================== Combined list ===================

export const defaultTradingPairs: ForexPair[] = [
  ...majorForexPairs.map((pair) => ({
    symbol: pair.symbol,
    name: pair.name,
    logo: pair.logo,
    type: "forex" as const,
    image: resolveTradingPairImageUrl({
      symbol: pair.symbol,
      type: "forex",
    }),
    color: pair.color,
    basePrice: 0,
    change: "0%",
    priceChangePercent: 0,
    favorite: pair.favorite,
    exchange: "ITICK",
    provider: "ITICK",
    payoutRate: 0.9,
    isActive: true,
    description: pair.description,
  })),
  ...majorCryptoPairs.map((pair) => ({
    symbol: pair.symbol,
    name: pair.name,
    logo: pair.logo,
    type: "crypto" as const,
    image: resolveTradingPairImageUrl({
      symbol: pair.symbol,
      type: "crypto",
    }),
    color: pair.color,
    basePrice: 0,
    change: "0%",
    priceChangePercent: 0,
    favorite: pair.favorite,
    exchange: "BINANCE",
    provider: "BINANCE",
    payoutRate: 0.9,
    isActive: true,
    description: pair.description,
  })),
];

export function normalizeTradingPair(
  pair: Partial<ForexPair> & {
    symbol: string;
    name: string;
    type: "forex" | "crypto";
  },
): ForexPair {
  const symbol = pair.symbol.toUpperCase();
  const provider =
    pair.provider || pair.exchange || (pair.type === "crypto" ? "BINANCE" : "ITICK");

  return {
    id: pair.id,
    symbol,
    name: pair.name,
    logo: pair.logo || symbol.slice(0, 3),
    image: resolveTradingPairImageUrl({
      symbol,
      type: pair.type,
      imageUrl: pair.image,
    }),
    color: pair.color || "#3B82F6",
    type: pair.type,
    basePrice: pair.basePrice ?? 0,
    change: pair.change || "0%",
    priceChangePercent: pair.priceChangePercent ?? 0,
    favorite: pair.favorite ?? false,
    exchange: provider,
    provider,
    description: pair.description,
    payoutRate: pair.payoutRate ?? 0.9,
    isActive: pair.isActive ?? true,
    displayOrder: pair.displayOrder ?? 0,
  };
}

export const initialForexPairs: ForexPair[] = defaultTradingPairs.map((pair) =>
  normalizeTradingPair(pair),
);

// =================== Helpers ===================

/** Known crypto symbols (Binance). */
const CRYPTO_SYMBOLS = new Set(defaultTradingPairs.filter((p) => p.type === "crypto").map((p) => p.symbol));

/** Check if a symbol is a crypto pair (Binance) or forex (iTick). */
export function isCryptoSymbol(symbol: string): boolean {
  const s = symbol.toUpperCase();
  if (CRYPTO_SYMBOLS.has(s)) return true;
  // Heuristic: if it ends in USDT/BUSD/BTC/ETH/BNB, it's crypto
  return /USDT$|BUSD$|BTC$|ETH$|BNB$/.test(s);
}

/** For iTick, symbols need no transformation. */
export const toITickSymbol = (symbol: string): string => {
  return symbol.replace(/\s/g, "").toUpperCase();
};

/** Convert a symbol to Binance stream format, e.g. BTCUSDT → btcusdt */
export const toBinanceSymbol = (symbol: string): string => {
  return symbol.replace(/\s/g, "").toLowerCase();
};

export type Crypto = ForexPair; // Backwards compatibility
export default initialForexPairs;
