const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const { randomBytes } = require("crypto");

const prisma = new PrismaClient();

// =================== Helpers ===================

function generateSecret() {
  return randomBytes(32).toString("hex");
}

/**
 * Derives the admin email from SITE_DOMAIN env var.
 * Example: SITE_DOMAIN=bincebroker.com → admin@bincebroker.com
 * Fallback: admin@bincebroker.com
 */
function getAdminEmail() {
  const domain = process.env.SITE_DOMAIN;
  if (domain) {
    // Strip protocol/paths if someone passes a full URL
    const clean = domain
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/.*$/, "")
      .replace(/:\d+$/, "");
    return `admin@${clean}`;
  }
  return "admin@bincebroker.com";
}

function getSiteUrl() {
  const domain = process.env.SITE_DOMAIN;
  if (domain) {
    const clean = domain
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "");
    return `https://${clean}/`;
  }
  return "https://app.bincebroker.com/";
}

function getSiteName() {
  return process.env.SITE_NAME || "Bincebroker";
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

// =================== Seed Functions ===================

async function criarMarketProvidersPadrao() {
  for (const provider of marketProviders) {
    await prisma.marketDataProvider.upsert({
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
  }
  console.log("  [OK] Market providers");
}

async function limparGatewaysPadrao() {
  await prisma.config.updateMany({
    data: {
      gatewayPixDepositoId: null,
      gatewayPixSaqueId: null,
      creditCardDepositId: null,
      cryptoDepositId: null,
      cryptoSaqueId: null,
      lastPixDepositGatewayId: null,
      lastPixWithdrawalGatewayId: null,
      lastCreditDepositGatewayId: null,
      lastCryptoDepositGatewayId: null,
      lastCryptoWithdrawalGatewayId: null,
    },
  });

  await prisma.deposit.updateMany({
    data: { gatewayId: null },
  });

  await prisma.withdrawal.updateMany({
    data: { gatewayId: null },
  });

  await prisma.gateways.deleteMany();
  console.log("  [OK] Gateways limpos");
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

  // Ensure secrets exist (if row existed but secrets were null)
  const patch = {};
  if (!config.authSecret) patch.authSecret = generateSecret();
  if (!config.adminSessionSecret) patch.adminSessionSecret = generateSecret();
  if (!config.settleSecret) patch.settleSecret = generateSecret();

  if (Object.keys(patch).length > 0) {
    await prisma.config.update({ where: { id: config.id }, data: patch });
  }

  console.log("  [OK] Config (%s → %s)", getSiteName(), getSiteUrl());
}

async function criarAdminPadrao() {
  const email = getAdminEmail();
  const password = process.env.ADMIN_PASSWORD || "Qw3RtY77$";
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: {
      email,
      nome: "admin",
      telefone: "11911223344",
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

  await criarMarketProvidersPadrao();
  await limparGatewaysPadrao();
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
