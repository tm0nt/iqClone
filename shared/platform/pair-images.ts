const FOREX_FLAG_MAP: Record<string, string> = {
  AUD: "au",
  BRL: "br",
  CAD: "ca",
  CHF: "ch",
  CNY: "cn",
  EUR: "eu",
  GBP: "gb",
  JPY: "jp",
  MXN: "mx",
  NZD: "nz",
  SGD: "sg",
  TRY: "tr",
  USD: "us",
  ZAR: "za",
};

const CRYPTO_ICON_MAP: Record<string, string> = {
  ADA: "ada",
  ARB: "arb",
  AVAX: "avax",
  BNB: "bnb",
  BTC: "btc",
  DOGE: "doge",
  DOT: "dot",
  ETH: "eth",
  LINK: "link",
  LTC: "ltc",
  SOL: "sol",
  TON: "ton",
  TRX: "trx",
  UNI: "uni",
  USDC: "usdc",
  USDT: "usdt",
  XRP: "xrp",
};

function buildFallbackDataUrl(symbol: string, color: string) {
  const safeSymbol = symbol.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="24" fill="${color}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="#ffffff">${safeSymbol}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getForexBaseCurrency(symbol: string) {
  return symbol.toUpperCase().slice(0, 3);
}

function getCryptoBaseAsset(symbol: string) {
  const upper = symbol.toUpperCase();
  const quotes = ["USDT", "USDC", "BUSD", "BTC", "ETH", "USD"];
  const quote = quotes.find((item) => upper.endsWith(item));
  if (!quote) {
    return upper.slice(0, 4);
  }
  return upper.slice(0, upper.length - quote.length);
}

export function resolveTradingPairImageUrl({
  symbol,
  type,
  imageUrl,
}: {
  symbol: string;
  type: "forex" | "crypto";
  imageUrl?: string | null;
}) {
  if (
    imageUrl &&
    !imageUrl.startsWith("/images/") &&
    imageUrl.trim().length > 0
  ) {
    return imageUrl;
  }

  if (type === "crypto") {
    const asset = getCryptoBaseAsset(symbol);
    const icon = CRYPTO_ICON_MAP[asset];
    if (icon) {
      return `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/${icon}.png`;
    }

    return buildFallbackDataUrl(asset, "#1f2937");
  }

  const baseCurrency = getForexBaseCurrency(symbol);
  const flag = FOREX_FLAG_MAP[baseCurrency];
  if (flag) {
    return `https://flagcdn.com/w80/${flag}.png`;
  }

  return buildFallbackDataUrl(baseCurrency, "#1d4ed8");
}
