const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const { randomBytes } = require("crypto");

const prisma = new PrismaClient();

// =================== Helpers ===================

function generateSecret() {
  return randomBytes(32).toString("hex");
}

/**
 * Deriva o email do admin a partir da env SITE_DOMAIN.
 * Ex: SITE_DOMAIN=rubygames.me → admin@rubygames.me
 */
function getAdminEmail() {
  const domain = process.env.SITE_DOMAIN;
  if (domain) {
    const clean = domain
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/.*$/, "")
      .replace(/:\d+$/, "");
    return `admin@${clean}`;
  }
  return "admin@rubygames.me";
}

function getSiteUrl() {
  const domain = process.env.SITE_DOMAIN;
  if (domain) {
    const clean = domain
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "");
    return `https://${clean}/`;
  }
  return "https://app.rubygames.me/";
}

function getSiteName() {
  return process.env.SITE_NAME || "RubyGames";
}

// =================== Market Providers ===================

const marketProviders = [
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
    envKey: "ITICK_API_KEY",
    isActive: true,
    sortOrder: 3,
  },
  {
    slug: "tiingo",
    name: "TIINGO",
    type: "forex",
    restBaseUrl: "https://api.tiingo.com",
    wsBaseUrl: "wss://api.tiingo.com/fx",
    authType: "header",
    authHeaderName: "Authorization",
    authQueryParam: "token",
    envKey: "TIINGO_API_KEY",
    isActive: true,
    sortOrder: 2,
  },
];

// =================== Trading Pairs ===================
// Espelhando exatamente os dados do dump trading.sql
// provider = nome do provedor em maiúsculas (campo legado)
// priceSource = slug do provedor em minúsculas

const baseTradingPairs = [
  // ---- Forex (ITICK) ----
  {
    symbol: "EURUSD",
    name: "EUR/USD",
    type: "forex",
    providerSlug: "itick",
    payoutRate: 0.9,
    isActive: true,
    favorite: true,
    displayOrder: 0,
    imageUrl: "https://flagcdn.com/w80/eu.png",
    color: "#003399",
    logo: "€/$",
    description: "Euro vs US Dollar",
    minTradeValue: 1,
  },
  {
    symbol: "GBPUSD",
    name: "GBP/USD",
    type: "forex",
    providerSlug: "itick",
    payoutRate: 0.9,
    isActive: true,
    favorite: true,
    displayOrder: 1,
    imageUrl: "https://flagcdn.com/w80/gb.png",
    color: "#C8102E",
    logo: "£/$",
    description: "British Pound vs US Dollar",
    minTradeValue: 1,
  },
  {
    symbol: "USDJPY",
    name: "USD/JPY",
    type: "forex",
    providerSlug: "itick",
    payoutRate: 0.9,
    isActive: true,
    favorite: true,
    displayOrder: 2,
    imageUrl: "https://flagcdn.com/w80/us.png",
    color: "#BC002D",
    logo: "$/¥",
    description: "US Dollar vs Japanese Yen",
    minTradeValue: 1,
  },
  {
    symbol: "USDCHF",
    name: "USD/CHF",
    type: "forex",
    providerSlug: "itick",
    payoutRate: 0.9,
    isActive: true,
    favorite: false,
    displayOrder: 3,
    imageUrl: "https://flagcdn.com/w80/us.png",
    color: "#DC143C",
    logo: "$/CHF",
    description: "US Dollar vs Swiss Franc",
    minTradeValue: 1,
  },
  {
    symbol: "AUDUSD",
    name: "AUD/USD",
    type: "forex",
    providerSlug: "itick",
    payoutRate: 0.9,
    isActive: true,
    favorite: false,
    displayOrder: 4,
    imageUrl: "https://flagcdn.com/w80/au.png",
    color: "#00008B",
    logo: "A$/$",
    description: "Australian Dollar vs US Dollar",
    minTradeValue: 1,
  },
  {
    symbol: "USDCAD",
    name: "USD/CAD",
    type: "forex",
    providerSlug: "itick",
    payoutRate: 0.9,
    isActive: true,
    favorite: false,
    displayOrder: 5,
    imageUrl: "https://flagcdn.com/w80/us.png",
    color: "#FF0000",
    logo: "$/C$",
    description: "US Dollar vs Canadian Dollar",
    minTradeValue: 1,
  },
  {
    symbol: "NZDUSD",
    name: "NZD/USD",
    type: "forex",
    providerSlug: "itick",
    payoutRate: 0.9,
    isActive: true,
    favorite: false,
    displayOrder: 6,
    imageUrl: "https://flagcdn.com/w80/nz.png",
    color: "#000000",
    logo: "NZ$/$",
    description: "New Zealand Dollar vs US Dollar",
    minTradeValue: 1,
  },
  {
    symbol: "EURGBP",
    name: "EUR/GBP",
    type: "forex",
    providerSlug: "itick",
    payoutRate: 0.9,
    isActive: true,
    favorite: false,
    displayOrder: 7,
    imageUrl: "https://flagcdn.com/w80/eu.png",
    color: "#002395",
    logo: "€/£",
    description: "Euro vs British Pound",
    minTradeValue: 1,
  },
  {
    symbol: "EURJPY",
    name: "EUR/JPY",
    type: "forex",
    providerSlug: "itick",
    payoutRate: 0.9,
    isActive: true,
    favorite: false,
    displayOrder: 8,
    imageUrl: "https://flagcdn.com/w80/eu.png",
    color: "#003399",
    logo: "€/¥",
    description: "Euro vs Japanese Yen",
    minTradeValue: 1,
  },
  {
    symbol: "GBPJPY",
    name: "GBP/JPY",
    type: "forex",
    providerSlug: "itick",
    payoutRate: 0.9,
    isActive: true,
    favorite: false,
    displayOrder: 9,
    imageUrl: "https://flagcdn.com/w80/gb.png",
    color: "#C8102E",
    logo: "£/¥",
    description: "British Pound vs Japanese Yen",
    minTradeValue: 1,
  },
  // ---- Crypto (Binance) ----
  {
    symbol: "BTCUSDT",
    name: "BTC/USDT",
    type: "crypto",
    providerSlug: "binance",
    payoutRate: 0.9,
    isActive: true,
    favorite: true,
    displayOrder: 10,
    imageUrl:
      "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/btc.png",
    color: "#F7931A",
    logo: "₿",
    description: "Bitcoin vs Tether",
    minTradeValue: 1,
  },
  {
    symbol: "ETHUSDT",
    name: "ETH/USDT",
    type: "crypto",
    providerSlug: "binance",
    payoutRate: 0.9,
    isActive: true,
    favorite: true,
    displayOrder: 11,
    imageUrl:
      "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/eth.png",
    color: "#627EEA",
    logo: "Ξ",
    description: "Ethereum vs Tether",
    minTradeValue: 1,
  },
  {
    symbol: "BNBUSDT",
    name: "BNB/USDT",
    type: "crypto",
    providerSlug: "binance",
    payoutRate: 0.9,
    isActive: true,
    favorite: false,
    displayOrder: 12,
    imageUrl:
      "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/bnb.png",
    color: "#F3BA2F",
    logo: "BNB",
    description: "Binance Coin vs Tether",
    minTradeValue: 1,
  },
  {
    symbol: "SOLUSDT",
    name: "SOL/USDT",
    type: "crypto",
    providerSlug: "binance",
    payoutRate: 0.9,
    isActive: true,
    favorite: true,
    displayOrder: 13,
    imageUrl:
      "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/sol.png",
    color: "#9945FF",
    logo: "SOL",
    description: "Solana vs Tether",
    minTradeValue: 1,
  },
  {
    symbol: "XRPUSDT",
    name: "XRP/USDT",
    type: "crypto",
    providerSlug: "binance",
    payoutRate: 0.9,
    isActive: true,
    favorite: false,
    displayOrder: 14,
    imageUrl:
      "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/xrp.png",
    color: "#23292F",
    logo: "XRP",
    description: "Ripple vs Tether",
    minTradeValue: 1,
  },
  {
    symbol: "ADAUSDT",
    name: "ADA/USDT",
    type: "crypto",
    providerSlug: "binance",
    payoutRate: 0.9,
    isActive: true,
    favorite: false,
    displayOrder: 15,
    imageUrl:
      "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/ada.png",
    color: "#0033AD",
    logo: "ADA",
    description: "Cardano vs Tether",
    minTradeValue: 1,
  },
  {
    symbol: "DOGEUSDT",
    name: "DOGE/USDT",
    type: "crypto",
    providerSlug: "binance",
    payoutRate: 0.9,
    isActive: true,
    favorite: false,
    displayOrder: 16,
    imageUrl:
      "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/doge.png",
    color: "#C2A633",
    logo: "Ð",
    description: "Dogecoin vs Tether",
    minTradeValue: 1,
  },
  {
    symbol: "DOTUSDT",
    name: "DOT/USDT",
    type: "crypto",
    providerSlug: "binance",
    payoutRate: 0.9,
    isActive: true,
    favorite: false,
    displayOrder: 17,
    imageUrl:
      "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/dot.png",
    color: "#E6007A",
    logo: "DOT",
    description: "Polkadot vs Tether",
    minTradeValue: 1,
  },
  {
    symbol: "AVAXUSDT",
    name: "AVAX/USDT",
    type: "crypto",
    providerSlug: "binance",
    payoutRate: 0.9,
    isActive: true,
    favorite: false,
    displayOrder: 18,
    imageUrl:
      "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/avax.png",
    color: "#E84142",
    logo: "AVAX",
    description: "Avalanche vs Tether",
    minTradeValue: 1,
  },
  {
    symbol: "LINKUSDT",
    name: "LINK/USDT",
    type: "crypto",
    providerSlug: "binance",
    payoutRate: 0.9,
    isActive: true,
    favorite: false,
    displayOrder: 19,
    imageUrl:
      "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/link.png",
    color: "#2A5ADA",
    logo: "LINK",
    description: "Chainlink vs Tether",
    minTradeValue: 1,
  },
];

const mirroredTiingoForexPairs = baseTradingPairs
  .filter((pair) => pair.providerSlug === "itick" && pair.type === "forex")
  .map((pair) => ({
    ...pair,
    providerSlug: "tiingo",
  }));

const tradingPairs = [...baseTradingPairs, ...mirroredTiingoForexPairs];

// =================== Seed Functions ===================

async function criarMarketProviders() {
  const providerMap = {};
  for (const provider of marketProviders) {
    const record = await prisma.marketDataProvider.upsert({
      where: { slug: provider.slug },
      update: {
        name: provider.name,
        type: provider.type,
        restBaseUrl: provider.restBaseUrl,
        wsBaseUrl: provider.wsBaseUrl,
        authType: provider.authType,
        authHeaderName: provider.authHeaderName,
        authQueryParam: provider.authQueryParam,
        envKey: provider.envKey,
        isActive: provider.isActive,
        sortOrder: provider.sortOrder,
      },
      create: provider,
    });
    providerMap[provider.slug] = record.id;
  }
  console.log(
    "  [OK] Market providers:",
    Object.entries(providerMap)
      .map(([k, v]) => `${k}(id=${v})`)
      .join(", ")
  );
  return providerMap;
}

async function criarTradingPairs(providerMap) {
  let criados = 0;
  let atualizados = 0;

  for (const pair of tradingPairs) {
    const { providerSlug, ...rest } = pair;
    const providerId = providerMap[providerSlug];
    const providerName = providerSlug.toUpperCase();

    const exists = await prisma.tradingPair.findFirst({
      where: {
        symbol: rest.symbol,
        providerId,
      },
    });

    if (exists) {
      await prisma.tradingPair.update({
        where: { id: exists.id },
        data: {
          ...rest,
          provider: providerName,
          priceSource: providerSlug,
          providerId,
        },
      });
      atualizados++;
    } else {
      await prisma.tradingPair.create({
        data: {
          ...rest,
          provider: providerName,
          priceSource: providerSlug,
          providerId,
        },
      });
      criados++;
    }
  }

  console.log(
    `  [OK] Trading pairs: ${criados} criados, ${atualizados} atualizados (total=${tradingPairs.length})`
  );
}

async function criarConfigPadrao() {
  const config = await prisma.config.upsert({
    where: { id: 1 },
    update: {
      chartBackgroundUrl: "/world-map.png",
      nomeSite: getSiteName(),
      urlSite: getSiteUrl(),
    },
    create: {
      nomeSite: getSiteName(),
      urlSite: getSiteUrl(),
      logoUrlDark: "logo.png",
      logoUrlWhite: "logo-white.png",
      chartBackgroundUrl: "/world-map.png",
      supportUrl: null,
      supportAvailabilityText: "TODO DIA, A TODA HORA",
      platformTimezone: "America/Sao_Paulo",
      authSecret: generateSecret(),
      adminSessionSecret: generateSecret(),
      settleSecret: generateSecret(),
      googleClientId: null,
      googleClientSecret: null,
      googleAnalyticsId: null,
      googleTagManagerId: null,
      facebookPixelId: null,
      trackRegisterEvents: true,
      trackDepositEvents: true,
      trackWithdrawalEvents: true,
      cpaMin: 30,
      cpaValor: 15,
      revShareFalsoValue: 85,
      revShareValue: 35,
      taxa: 10,
      valorMinimoSaque: 100,
      valorMinimoDeposito: 60,
      postbackUrl: null,
      gatewayPixDepositoId: null,
      gatewayPixSaqueId: null,
      creditCardDepositId: null,
      cryptoDepositId: null,
      cryptoSaqueId: null,
    },
  });

  // Garante que os secrets existam (caso a linha já existisse sem eles)
  const patch = {};
  if (!config.authSecret) patch.authSecret = generateSecret();
  if (!config.adminSessionSecret) patch.adminSessionSecret = generateSecret();
  if (!config.settleSecret) patch.settleSecret = generateSecret();

  if (Object.keys(patch).length > 0) {
    await prisma.config.update({ where: { id: config.id }, data: patch });
  }

  console.log("  [OK] Config → %s (%s)", getSiteName(), getSiteUrl());
}

async function criarAdminPadrao() {
  const email = getAdminEmail();
  const password = process.env.ADMIN_PASSWORD || "Admin@Ruby2026!";
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.admin.upsert({
    where: { email },
    update: {}, // não sobrescreve senha se admin já existe
    create: {
      email,
      nome: "Admin",
      telefone: "11900000000",
      senha: hashedPassword,
      nivel: "SUPER_ADMIN",
    },
  });

  console.log("  [OK] Admin → %s", email);
}

// =================== Main ===================

async function main() {
  console.log("==> Seed: iniciando...");
  console.log("    SITE_DOMAIN=%s", process.env.SITE_DOMAIN || "(default)");
  console.log("    SITE_NAME=%s", getSiteName());

  const providerMap = await criarMarketProviders();
  await criarTradingPairs(providerMap);
  await criarConfigPadrao();
  await criarAdminPadrao();

  console.log("==> Seed: concluido!");
}

main()
  .catch((error) => {
    console.error("Seed ERRO:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
