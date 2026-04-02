/**
 * seed.js — gerado a partir do backup trading.sql em 2026-04-02
 *
 * Dados de referência extraídos diretamente do banco de produção.
 * Idempotente: pode ser rodado múltiplas vezes sem duplicar registros.
 *
 * Uso:
 *   pnpm seed
 *   npx prisma db seed
 *   node prisma/seed.js
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const { randomBytes } = require("crypto");

const prisma = new PrismaClient();

// =================== Helpers ===================

function generateSecret() {
  return randomBytes(32).toString("hex");
}

/** admin@<SITE_DOMAIN> ou admin@localhost como fallback */
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
  return "admin@localhost";
}

function getSiteUrl() {
  const domain = process.env.SITE_DOMAIN;
  if (domain) {
    const clean = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    return `https://${clean}/`;
  }
  return "https://localhost/";
}

function getSiteName() {
  return process.env.SITE_NAME || "Nextbroker";
}

// =================== Market Providers ===================
// Extraído do backup: binance(id=1) e tiingo(id=1303) ativos, itick(id=2) inativo

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
    authToken: null,
    envKey: null,
    isActive: true,
    sortOrder: 1,
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
    authToken: null, // lido de TIINGO_API_KEY no env ou configurado via painel admin
    envKey: "TIINGO_API_KEY",
    isActive: true,
    sortOrder: 2,
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
    authToken: null,
    envKey: "ITICK_API_KEY",
    isActive: false, // inativo — ativar via painel admin se tiver chave
    sortOrder: 3,
  },
];

// =================== Trading Pairs ===================
// Extraído do backup — pares ativos com displayOrder real

const forexTiingo = [
  { symbol: "EURUSD",  name: "EUR/USD",  color: "#003399", logo: "€/$",   description: "Euro vs US Dollar",               displayOrder: 20, favorite: true,  imageUrl: "https://flagcdn.com/w80/eu.png" },
  { symbol: "GBPUSD",  name: "GBP/USD",  color: "#C8102E", logo: "£/$",   description: "British Pound vs US Dollar",      displayOrder: 21, favorite: true,  imageUrl: "https://flagcdn.com/w80/gb.png" },
  { symbol: "USDJPY",  name: "USD/JPY",  color: "#BC002D", logo: "$/¥",   description: "US Dollar vs Japanese Yen",       displayOrder: 22, favorite: true,  imageUrl: "https://flagcdn.com/w80/us.png" },
  { symbol: "USDCHF",  name: "USD/CHF",  color: "#DC143C", logo: "$/CHF", description: "US Dollar vs Swiss Franc",        displayOrder: 23, favorite: false, imageUrl: "https://flagcdn.com/w80/us.png" },
  { symbol: "AUDUSD",  name: "AUD/USD",  color: "#00008B", logo: "A$/$",  description: "Australian Dollar vs US Dollar",  displayOrder: 24, favorite: false, imageUrl: "https://flagcdn.com/w80/au.png" },
  { symbol: "USDCAD",  name: "USD/CAD",  color: "#FF0000", logo: "$/C$",  description: "US Dollar vs Canadian Dollar",    displayOrder: 25, favorite: false, imageUrl: "https://flagcdn.com/w80/us.png" },
  { symbol: "NZDUSD",  name: "NZD/USD",  color: "#000000", logo: "NZ$/$", description: "New Zealand Dollar vs US Dollar", displayOrder: 26, favorite: false, imageUrl: "https://flagcdn.com/w80/nz.png" },
  { symbol: "EURGBP",  name: "EUR/GBP",  color: "#002395", logo: "€/£",   description: "Euro vs British Pound",           displayOrder: 27, favorite: false, imageUrl: "https://flagcdn.com/w80/eu.png" },
  { symbol: "EURJPY",  name: "EUR/JPY",  color: "#003399", logo: "€/¥",   description: "Euro vs Japanese Yen",            displayOrder: 28, favorite: false, imageUrl: "https://flagcdn.com/w80/eu.png" },
  { symbol: "GBPJPY",  name: "GBP/JPY",  color: "#C8102E", logo: "£/¥",   description: "British Pound vs Japanese Yen",   displayOrder: 29, favorite: false, imageUrl: "https://flagcdn.com/w80/gb.png" },
];

const cryptoBinance = [
  { symbol: "BTCUSDT",  name: "BTC/USDT",  color: "#F7931A", logo: "₿",    description: "Bitcoin vs Tether",      displayOrder: 10, favorite: true,  imageUrl: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/btc.png"  },
  { symbol: "ETHUSDT",  name: "ETH/USDT",  color: "#627EEA", logo: "Ξ",    description: "Ethereum vs Tether",     displayOrder: 11, favorite: true,  imageUrl: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/eth.png"  },
  { symbol: "BNBUSDT",  name: "BNB/USDT",  color: "#F3BA2F", logo: "BNB",  description: "Binance Coin vs Tether", displayOrder: 12, favorite: false, imageUrl: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/bnb.png"  },
  { symbol: "SOLUSDT",  name: "SOL/USDT",  color: "#9945FF", logo: "SOL",  description: "Solana vs Tether",       displayOrder: 13, favorite: true,  imageUrl: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/sol.png"  },
  { symbol: "XRPUSDT",  name: "XRP/USDT",  color: "#23292F", logo: "XRP",  description: "Ripple vs Tether",       displayOrder: 14, favorite: false, imageUrl: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/xrp.png"  },
  { symbol: "ADAUSDT",  name: "ADA/USDT",  color: "#0033AD", logo: "ADA",  description: "Cardano vs Tether",      displayOrder: 15, favorite: false, imageUrl: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/ada.png"  },
  { symbol: "DOGEUSDT", name: "DOGE/USDT", color: "#C2A633", logo: "Ð",    description: "Dogecoin vs Tether",     displayOrder: 16, favorite: false, imageUrl: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/doge.png" },
  { symbol: "DOTUSDT",  name: "DOT/USDT",  color: "#E6007A", logo: "DOT",  description: "Polkadot vs Tether",     displayOrder: 17, favorite: false, imageUrl: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/dot.png"  },
  { symbol: "AVAXUSDT", name: "AVAX/USDT", color: "#E84142", logo: "AVAX", description: "Avalanche vs Tether",    displayOrder: 18, favorite: false, imageUrl: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/avax.png" },
  { symbol: "LINKUSDT", name: "LINK/USDT", color: "#2A5ADA", logo: "LINK", description: "Chainlink vs Tether",    displayOrder: 19, favorite: false, imageUrl: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/link.png" },
];

// =================== Seed Functions ===================

async function criarMarketProviders() {
  const providerMap = {};
  let criados = 0;
  let preservados = 0;

  for (const provider of marketProviders) {
    const existing = await prisma.marketDataProvider.findUnique({
      where: { slug: provider.slug },
      select: { id: true },
    });

    if (existing) {
      providerMap[provider.slug] = existing.id;
      preservados++;
      continue;
    }

    const record = await prisma.marketDataProvider.create({ data: provider });
    providerMap[provider.slug] = record.id;
    criados++;
  }

  console.log(`  [OK] Market providers: ${criados} criados, ${preservados} preservados`);
  return providerMap;
}

async function criarTradingPairs(providerMap) {
  let criados = 0;
  let preservados = 0;

  const pares = [
    // Forex via Tiingo (provedor principal ativo)
    ...forexTiingo.map((p) => ({
      ...p, type: "forex", payoutRate: 0.9, isActive: true,
      minTradeValue: 1, maxTradeValue: null, priceSymbol: null,
      providerSlug: "tiingo",
    })),
    // Crypto via Binance
    ...cryptoBinance.map((p) => ({
      ...p, type: "crypto", payoutRate: 0.9, isActive: true,
      minTradeValue: 1, maxTradeValue: null, priceSymbol: null,
      providerSlug: "binance",
    })),
    // Crypto mirror via Tiingo
    ...cryptoBinance.map((p) => ({
      ...p, type: "crypto", payoutRate: 0.9, isActive: true,
      minTradeValue: 1, maxTradeValue: null, priceSymbol: null,
      providerSlug: "tiingo",
    })),
  ];

  for (const pair of pares) {
    const { providerSlug, ...rest } = pair;
    const providerId = providerMap[providerSlug];

    const exists = await prisma.tradingPair.findFirst({
      where: { symbol: rest.symbol, providerId },
      select: { id: true },
    });

    if (exists) {
      preservados++;
    } else {
      await prisma.tradingPair.create({
        data: {
          ...rest,
          provider: providerSlug.toUpperCase(),
          priceSource: providerSlug,
          providerId,
        },
      });
      criados++;
    }
  }

  console.log(`  [OK] Trading pairs: ${criados} criados, ${preservados} preservados (total=${pares.length})`);
}

async function criarConfig() {
  const config = await prisma.config.upsert({
    where: { id: 1 },
    update: {}, // nunca sobrescreve config existente
    create: {
      // Branding (dinâmico por deploy)
      nomeSite:  getSiteName(),
      urlSite:   getSiteUrl(),
      logoUrlDark:  "/nextbrokers.png",
      logoUrlWhite: "/nextbrokers.png",
      faviconUrl:   null,

      // Financeiro (extraído do backup)
      valorMinimoSaque:    100,
      valorMinimoDeposito: 60,
      taxa:               10,
      cpaMin:             30,
      cpaValor:           15,
      revShareFalsoValue: 85,
      revShareValue:      35,
      depositGatewayMode:  "manual",
      withdrawGatewayMode: "manual",

      // Gateways (configurar via painel admin)
      postbackUrl:          null,
      gatewayPixDepositoId: null,
      gatewayPixSaqueId:    null,
      creditCardDepositId:  null,
      cryptoDepositId:      null,
      cryptoSaqueId:        null,

      // Regras de trading (extraído do backup)
      tradingMinPriceVariation:    0,
      tradingSettlementTolerance:  0,
      tradingDefaultExpiryMinutes: 5,
      tradingExpiryOptions:        "1,5,10,15,30,60,1440",
      tradingSettlementGraceSeconds: 2,

      // Plataforma
      supportUrl:               null,
      supportAvailabilityText:  "TODO DIA, A TODA HORA",
      platformTimezone:         "America/Sao_Paulo",

      // Integrações externas
      googleClientId:     null,
      googleClientSecret: null,
      googleAnalyticsId:  null,
      googleTagManagerId: null,
      facebookPixelId:    null,
      trackRegisterEvents: true,
      trackDepositEvents:  true,
      trackWithdrawalEvents: true,

      // Secrets — gerados na criação, nunca sobrescritos
      authSecret:          generateSecret(),
      adminSessionSecret:  generateSecret(),
      settleSecret:        generateSecret(),

      // Tema escuro (extraído do backup de produção)
      primaryColor:           "#000000",
      primaryHoverColor:      "#000000",
      primaryGradientFrom:    "#3d3846",
      primaryGradientVia:     "#241f31",
      primaryGradientTo:      "#000000",
      buttonTextColor:        "#000000",
      backgroundColor:        "#000000",
      surfaceColor:           "#111111",
      surfaceAltColor:        "#0a0a0a",
      cardColor:              "#111111",
      borderColor:            "#222222",
      headerGradientFrom:     "#000000",
      headerGradientTo:       "#0a0a0a",
      headerTextColor:        "#ffffff",
      mutedTextColor:         "#ffffff",
      authBackgroundColor:    "#ffffff",
      loadingBackgroundColor: "#ffffff",
      loadingTrackColor:      "#222222",
      loadingGradientFrom:    "#3d3846",
      loadingGradientVia:     "#cccccc",
      loadingGradientTo:      "#888888",
      successColor:           "#16a34a",
      dangerColor:            "#dc2626",
      negativeColor:          "#ef4444",
      positiveColor:          "#22c55e",
      textColor:              "#ffffff",
      accentColor:            "#3b82f6",
      warningColor:           "#f59e0b",
      demoColor:              "#f97316",
      demoHoverColor:         "#ea580c",
      overlayBackdropColor:   "#000000",
      overlaySurfaceColor:    "#000000",
      overlayBorderColor:     "#000000",
      overlayCardColor:       "#000000",
      overlayHoverColor:      "#000000",
      overlayMutedTextColor:  "#ffffff",
      inputBackgroundColor:   "#1a1a1a",
      inputBorderColor:       "#2a2a2a",
      inputLabelColor:        "#ffffff",
      inputSubtleTextColor:   "#ffffff",
      candleUpColor:          "#00ab34",
      candleDownColor:        "#d21a2a",
      chartBackgroundUrl:     "/world-map.png",
      chartGridColor:         "#666666",
      chartPriceTagColor:     "#d88a31",
      iconBgColor:            "#ffffff",
      iconColor:              "#000000",
    },
  });

  // Garante secrets mesmo se o registro já existia sem eles
  const patch = {};
  if (!config.authSecret)         patch.authSecret = generateSecret();
  if (!config.adminSessionSecret) patch.adminSessionSecret = generateSecret();
  if (!config.settleSecret)       patch.settleSecret = generateSecret();
  if (Object.keys(patch).length > 0) {
    await prisma.config.update({ where: { id: 1 }, data: patch });
  }

  console.log("  [OK] Config → %s (%s)", config.nomeSite, config.urlSite);
}

async function criarAdmin() {
  const email    = getAdminEmail();
  const password = process.env.ADMIN_PASSWORD || "Admin@123456";
  const hash     = await bcrypt.hash(password, 10);

  await prisma.admin.upsert({
    where:  { email },
    update: {}, // nunca sobrescreve senha de admin existente
    create: {
      email,
      nome:     "Admin",
      telefone: "11900000000",
      senha:    hash,
      nivel:    "SUPER_ADMIN",
    },
  });

  console.log("  [OK] Admin → %s", email);
}

async function criarWorkerConfig() {
  // Extraído do backup: settlement worker com intervalMs=5000, batchSize=50
  const existing = await prisma.workerConfig.findFirst({
    where: { workerName: "settlement" },
    select: { id: true },
  });

  if (existing) {
    console.log("  [OK] WorkerConfig → preservado");
    return;
  }

  await prisma.workerConfig.create({
    data: {
      workerName:   "settlement",
      isEnabled:    true,
      batchSize:    50,
      maxAttempts:  3,
      timeoutMs:    60000,
      retryDelayMs: 5000,
    },
  });

  console.log("  [OK] WorkerConfig → criado");
}

// =================== Main ===================

async function main() {
  console.log("==> Seed: iniciando...");
  console.log("    SITE_DOMAIN=%s", process.env.SITE_DOMAIN || "(default: localhost)");
  console.log("    SITE_NAME=%s",   getSiteName());

  const providerMap = await criarMarketProviders();
  await criarTradingPairs(providerMap);
  await criarConfig();
  await criarAdmin();
  await criarWorkerConfig();

  console.log("==> Seed: concluido!");
}

main()
  .catch((err) => {
    console.error("Seed ERRO:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
