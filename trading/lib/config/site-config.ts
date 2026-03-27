import { prisma } from "@/lib/prisma";
import { BRANDING_DEFAULTS } from "@shared/platform/branding";
import {
  normalizeTradingRuntimeRules,
  type TradingRuntimeRules,
} from "@/lib/services/trading-runtime";

const DEFAULT_CHART_BACKGROUND_URL = "/world-map.png";
const PLATFORM_CONFIG_TTL_MS = 30_000;

export const platformConfigSelect = {
  nomeSite: true,
  urlSite: true,
  logoUrlDark: true,
  logoUrlWhite: true,
  supportUrl: true,
  supportAvailabilityText: true,
  platformTimezone: true,
  postbackUrl: true,
  chartBackgroundUrl: true,
  faviconUrl: true,
  candleUpColor: true,
  candleDownColor: true,
  chartGridColor: true,
  primaryColor: true,
  primaryHoverColor: true,
  accentColor: true,
  warningColor: true,
  demoColor: true,
  demoHoverColor: true,
  primaryGradientFrom: true,
  primaryGradientVia: true,
  primaryGradientTo: true,
  buttonTextColor: true,
  backgroundColor: true,
  surfaceColor: true,
  surfaceAltColor: true,
  cardColor: true,
  borderColor: true,
  overlayBackdropColor: true,
  overlaySurfaceColor: true,
  overlayBorderColor: true,
  overlayCardColor: true,
  overlayHoverColor: true,
  overlayMutedTextColor: true,
  headerGradientFrom: true,
  headerGradientTo: true,
  headerTextColor: true,
  mutedTextColor: true,
  authBackgroundColor: true,
  inputBackgroundColor: true,
  inputBorderColor: true,
  inputLabelColor: true,
  inputSubtleTextColor: true,
  loadingBackgroundColor: true,
  loadingTrackColor: true,
  loadingGradientFrom: true,
  loadingGradientVia: true,
  loadingGradientTo: true,
  successColor: true,
  dangerColor: true,
  textColor: true,
  iconColor: true,
  iconBgColor: true,
  positiveColor: true,
  negativeColor: true,
  chartPriceTagColor: true,
  valorMinimoDeposito: true,
  valorMinimoSaque: true,
  googleAnalyticsId: true,
  googleTagManagerId: true,
  facebookPixelId: true,
  trackRegisterEvents: true,
  trackDepositEvents: true,
  trackWithdrawalEvents: true,
  depositGatewayMode: true,
  withdrawGatewayMode: true,
  tradingMinPriceVariation: true,
  tradingSettlementTolerance: true,
  tradingDefaultExpiryMinutes: true,
  tradingExpiryOptions: true,
  tradingSettlementGraceSeconds: true,
} as const;

type BrandingConfigShape = {
  [K in keyof typeof BRANDING_DEFAULTS]: string | null | undefined;
};

export type PlatformConfigValue = BrandingConfigShape &
  TradingRuntimeRules & {
    nomeSite: string;
    urlSite: string;
    logoUrlDark: string;
    logoUrlWhite: string;
    supportUrl: string | null;
    supportAvailabilityText: string;
    platformTimezone: string;
    postbackUrl: string | null;
    chartBackgroundUrl: string;
    faviconUrl: string | null;
    valorMinimoDeposito: number;
    valorMinimoSaque: number;
    googleAnalyticsId: string | null;
    googleTagManagerId: string | null;
    facebookPixelId: string | null;
    trackRegisterEvents: boolean;
    trackDepositEvents: boolean;
    trackWithdrawalEvents: boolean;
    depositGatewayMode: string;
    withdrawGatewayMode: string;
    tradingMinPriceVariation?: number | null;
    tradingSettlementTolerance?: number | null;
    tradingDefaultExpiryMinutes?: number | null;
    tradingExpiryOptions?: string | null;
    tradingSettlementGraceSeconds?: number | null;
  } & Record<string, unknown>;

type PlatformConfigState = {
  cache: { value: PlatformConfigValue; expiresAt: number } | null;
  promise: Promise<PlatformConfigValue> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var __PLATFORM_CONFIG_STATE__: PlatformConfigState | undefined;
}

const platformConfigState: PlatformConfigState =
  globalThis.__PLATFORM_CONFIG_STATE__ ?? {
    cache: null,
    promise: null,
  };

if (!globalThis.__PLATFORM_CONFIG_STATE__) {
  globalThis.__PLATFORM_CONFIG_STATE__ = platformConfigState;
}

async function buildPlatformConfig(): Promise<PlatformConfigValue> {
  let config = null;

  try {
    config = await prisma.config.findUnique({
      where: { id: 1 },
      select: platformConfigSelect,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (!message.includes("Unknown field")) {
      throw error;
    }

    const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT * FROM "Config" WHERE "id" = 1 LIMIT 1
    `;
    config = (rows[0] ?? null) as typeof config;
  }

  return {
    ...BRANDING_DEFAULTS,
    ...config,
    ...normalizeTradingRuntimeRules(config),
    nomeSite: config?.nomeSite || BRANDING_DEFAULTS.nomeSite,
    urlSite: typeof config?.urlSite === "string" ? config.urlSite : "",
    logoUrlDark: config?.logoUrlDark || BRANDING_DEFAULTS.logoUrlDark,
    logoUrlWhite: config?.logoUrlWhite || BRANDING_DEFAULTS.logoUrlWhite,
    supportUrl: typeof config?.supportUrl === "string" ? config.supportUrl : null,
    supportAvailabilityText:
      typeof config?.supportAvailabilityText === "string" &&
      config.supportAvailabilityText.trim().length > 0
        ? config.supportAvailabilityText
        : "TODO DIA, A TODA HORA",
    platformTimezone:
      typeof config?.platformTimezone === "string" &&
      config.platformTimezone.trim().length > 0
        ? config.platformTimezone
        : "America/Sao_Paulo",
    postbackUrl:
      typeof config?.postbackUrl === "string" ? config.postbackUrl : null,
    chartBackgroundUrl:
      config?.chartBackgroundUrl || DEFAULT_CHART_BACKGROUND_URL,
    faviconUrl: typeof config?.faviconUrl === "string" ? config.faviconUrl : null,
    valorMinimoDeposito: Number(config?.valorMinimoDeposito),
    valorMinimoSaque: Number(config?.valorMinimoSaque),
    googleAnalyticsId:
      typeof config?.googleAnalyticsId === "string"
        ? config.googleAnalyticsId
        : null,
    googleTagManagerId:
      typeof config?.googleTagManagerId === "string"
        ? config.googleTagManagerId
        : null,
    facebookPixelId:
      typeof config?.facebookPixelId === "string"
        ? config.facebookPixelId
        : null,
    trackRegisterEvents:
      typeof config?.trackRegisterEvents === "boolean"
        ? config.trackRegisterEvents
        : true,
    trackDepositEvents:
      typeof config?.trackDepositEvents === "boolean"
        ? config.trackDepositEvents
        : true,
    trackWithdrawalEvents:
      typeof config?.trackWithdrawalEvents === "boolean"
        ? config.trackWithdrawalEvents
        : true,
  };
}

export async function getPlatformConfig() {
  if (
    platformConfigState.cache &&
    platformConfigState.cache.expiresAt > Date.now()
  ) {
    return platformConfigState.cache.value;
  }

  if (!platformConfigState.promise) {
    platformConfigState.promise = buildPlatformConfig()
      .then((value) => {
        platformConfigState.cache = {
          value,
          expiresAt: Date.now() + PLATFORM_CONFIG_TTL_MS,
        };
        return value;
      })
      .finally(() => {
        platformConfigState.promise = null;
      });
  }

  try {
    return await platformConfigState.promise;
  } catch (error) {
    platformConfigState.cache = null;
    console.error("Erro ao carregar configuracoes da plataforma:", error);
    return {
      ...BRANDING_DEFAULTS,
      ...normalizeTradingRuntimeRules(),
      nomeSite: BRANDING_DEFAULTS.nomeSite,
      urlSite: "",
      logoUrlDark: BRANDING_DEFAULTS.logoUrlDark,
      logoUrlWhite: BRANDING_DEFAULTS.logoUrlWhite,
      supportUrl: null,
      supportAvailabilityText: "TODO DIA, A TODA HORA",
      platformTimezone: "America/Sao_Paulo",
      postbackUrl: null,
      chartBackgroundUrl: DEFAULT_CHART_BACKGROUND_URL,
      faviconUrl: null,
      valorMinimoDeposito: 0,
      valorMinimoSaque: 0,
      googleAnalyticsId: null,
      googleTagManagerId: null,
      facebookPixelId: null,
      trackRegisterEvents: true,
      trackDepositEvents: true,
      trackWithdrawalEvents: true,
    };
  }
}
