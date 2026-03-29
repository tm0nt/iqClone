import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/auth";
import {
  getConfig,
  upsertConfig,
  getGatewayById,
  getMarketProviders,
  updateMarketProviders,
} from "@/db/queries";
import { invalidateAdminRuntimeConfigCache } from "@/lib/runtime-config";
import { invalidateAdminSiteConfigCache } from "@/lib/site-config";
import { extractAffiliateConfigUpdate } from "@shared/affiliate/service";
import {
  extractBrandingUpdate,
  normalizeGatewayMode,
} from "@shared/platform/branding";

interface ConfigInput {
  nomeSite?: string;
  urlSite?: string;
  logoUrlWhite?: string;
  logoUrlDark?: string;
  supportUrl?: string | null;
  supportAvailabilityText?: string;
  platformTimezone?: string;
  chartBackgroundUrl?: string | null;
  faviconUrl?: string | null;
  primaryColor?: string;
  primaryHoverColor?: string;
  accentColor?: string;
  warningColor?: string;
  demoColor?: string;
  demoHoverColor?: string;
  primaryGradientFrom?: string;
  primaryGradientVia?: string;
  primaryGradientTo?: string;
  buttonTextColor?: string;
  backgroundColor?: string;
  surfaceColor?: string;
  surfaceAltColor?: string;
  cardColor?: string;
  borderColor?: string;
  overlayBackdropColor?: string;
  overlaySurfaceColor?: string;
  overlayBorderColor?: string;
  overlayCardColor?: string;
  overlayHoverColor?: string;
  overlayMutedTextColor?: string;
  headerGradientFrom?: string;
  headerGradientTo?: string;
  headerTextColor?: string;
  mutedTextColor?: string;
  authBackgroundColor?: string;
  inputBackgroundColor?: string;
  inputBorderColor?: string;
  inputLabelColor?: string;
  inputSubtleTextColor?: string;
  loadingBackgroundColor?: string;
  loadingTrackColor?: string;
  loadingGradientFrom?: string;
  loadingGradientVia?: string;
  loadingGradientTo?: string;
  successColor?: string;
  dangerColor?: string;
  textColor?: string;
  iconColor?: string;
  iconBgColor?: string;
  positiveColor?: string;
  negativeColor?: string;
  candleUpColor?: string;
  candleDownColor?: string;
  chartGridColor?: string;
  chartPriceTagColor?: string;
  authSecret?: string | null;
  adminSessionSecret?: string | null;
  settleSecret?: string | null;
  googleClientId?: string | null;
  googleClientSecret?: string | null;
  tradingMinPriceVariation?: number;
  tradingSettlementTolerance?: number;
  tradingDefaultExpiryMinutes?: number;
  tradingExpiryOptions?: string;
  tradingSettlementGraceSeconds?: number;
  cpaMin?: number;
  cpaValor?: number;
  revShareFalsoValue?: number;
  revShareNegativo?: number | null;
  revShareValue?: number;
  taxa?: number;
  valorMinimoSaque?: number;
  valorMinimoDeposito?: number;
  postbackUrl?: string | null;
  googleAnalyticsId?: string | null;
  googleTagManagerId?: string | null;
  facebookPixelId?: string | null;
  trackRegisterEvents?: boolean;
  trackDepositEvents?: boolean;
  trackWithdrawalEvents?: boolean;
  gatewayPixDepositoId?: number | null;
  gatewayPixSaqueId?: number | null;
  creditCardDepositId?: number | null;
  cryptoDepositId?: number | null;
  cryptoSaqueId?: number | null;
  depositGatewayMode?: string;
  withdrawGatewayMode?: string;
  marketProviders?: Array<{
    id: number;
    authToken?: string | null;
    isActive?: boolean;
  }>;
}

export async function GET(_request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin("SUPER_ADMIN", "ADMIN");
  if (auth.error) return auth.error;

  try {
    let config = await getConfig();
    if (!config) {
      config = await upsertConfig({});
    }
    const marketProviders = await getMarketProviders();
    return NextResponse.json({
      ...config,
      marketProviders,
    });
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

function getAdminBaseUrl(request: NextRequest): string {
  const proto =
    request.headers.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "production" ? "https" : "http");
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "localhost";
  return `${proto}://${host}`;
}

function deriveFallbackCacheSecret(): string | null {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) return null;
  // Must match the derivation in trading/lib/config/runtime-config.ts: deriveStableSecret("admin-session")
  const { createHash } = require("crypto") as typeof import("crypto");
  return createHash("sha256").update(`${databaseUrl}:admin-session`).digest("hex");
}

async function revalidateTradingCaches(secret?: string | null) {
  const normalizedSecret = (secret ?? deriveFallbackCacheSecret())?.trim();

  if (!normalizedSecret) {
    return;
  }

  const urls = [
    process.env.TRADING_CACHE_REVALIDATE_URL,
    "http://trading:3000/api/internal/cache",
  ]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "x-platform-cache-secret": normalizedSecret,
        },
        cache: "no-store",
      });

      if (response.ok) {
        return;
      }
    } catch (error) {
      console.warn("Falha ao revalidar caches do trading:", error);
    }
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin("SUPER_ADMIN");
  if (auth.error) return auth.error;

  try {
    const data = await request.json();

    // Absolute base URL so images are accessible from any app (trading, afiliados, etc.)
    const baseUrl = getAdminBaseUrl(request);

    const handleImage = async (
      image: File | string | null,
      currentUrl: string | null,
    ): Promise<string> => {
      if (!image) {
        return currentUrl || "";
      }

      let buffer: Buffer | null = null;
      let extension = ".png";

      if (typeof image === "string") {
        // Already an absolute URL — keep as-is
        if (image.startsWith("http://") || image.startsWith("https://")) {
          return image;
        }
        const match = image.match(
          /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/,
        );
        if (!match) {
          return currentUrl || image;
        }
        const mimeType = match[1];
        const base64Data = match[2];
        extension = mimeType.includes("jpeg")
          ? ".jpg"
          : `.${mimeType.split("/")[1] || "png"}`;
        buffer = Buffer.from(base64Data, "base64");
      } else if (image.size > 0) {
        const bytes = await image.arrayBuffer();
        buffer = Buffer.from(bytes);
        extension = path.extname(image.name) || extension;
      }

      if (buffer) {
        const imageName = `${Date.now()}${extension}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, imageName), buffer);
        // Return absolute URL — works from admin, trading, afiliados, anywhere
        return `${baseUrl}/api/images/${imageName}`;
      }

      return currentUrl || "";
    };

    const existingConfig = await getConfig();

    const config: ConfigInput = {};
    if (data.nomeSite && data.nomeSite !== existingConfig?.nomeSite)
      config.nomeSite = data.nomeSite;
    if (data.urlSite && data.urlSite !== existingConfig?.urlSite)
      config.urlSite = data.urlSite;
    if (
      data.supportUrl !== undefined &&
      data.supportUrl !== existingConfig?.supportUrl
    ) {
      config.supportUrl = data.supportUrl || null;
    }
    if (
      typeof data.supportAvailabilityText === "string" &&
      data.supportAvailabilityText !== existingConfig?.supportAvailabilityText
    ) {
      config.supportAvailabilityText = data.supportAvailabilityText;
    }
    if (
      typeof data.platformTimezone === "string" &&
      data.platformTimezone !== existingConfig?.platformTimezone
    ) {
      config.platformTimezone = data.platformTimezone;
    }
    const brandingConfigInput = extractBrandingUpdate(data);
    for (const [field, value] of Object.entries(brandingConfigInput)) {
      if (value !== (existingConfig as any)?.[field]) {
        (config as any)[field] = value;
      }
    }
    const affiliateConfigInput = extractAffiliateConfigUpdate(data);
    if (
      affiliateConfigInput.cpaMin !== undefined &&
      affiliateConfigInput.cpaMin !== existingConfig?.cpaMin
    )
      config.cpaMin = affiliateConfigInput.cpaMin;
    if (
      affiliateConfigInput.cpaValor !== undefined &&
      affiliateConfigInput.cpaValor !== existingConfig?.cpaValor
    )
      config.cpaValor = affiliateConfigInput.cpaValor;
    if (
      affiliateConfigInput.revShareFalsoValue !== undefined &&
      affiliateConfigInput.revShareFalsoValue !==
        existingConfig?.revShareFalsoValue
    )
      config.revShareFalsoValue = affiliateConfigInput.revShareFalsoValue;
    if (
      affiliateConfigInput.revShareNegativo !== undefined &&
      affiliateConfigInput.revShareNegativo !== existingConfig?.revShareNegativo
    )
      config.revShareNegativo = affiliateConfigInput.revShareNegativo;
    if (
      affiliateConfigInput.revShareValue !== undefined &&
      affiliateConfigInput.revShareValue !== existingConfig?.revShareValue
    )
      config.revShareValue = affiliateConfigInput.revShareValue;
    if (data.taxa !== undefined && Number(data.taxa) !== existingConfig?.taxa)
      config.taxa = Number(data.taxa);
    if (
      data.valorMinimoSaque !== undefined &&
      Number(data.valorMinimoSaque) !== existingConfig?.valorMinimoSaque
    )
      config.valorMinimoSaque = Number(data.valorMinimoSaque);
    if (
      data.valorMinimoDeposito !== undefined &&
      Number(data.valorMinimoDeposito) !== existingConfig?.valorMinimoDeposito
    )
      config.valorMinimoDeposito = Number(data.valorMinimoDeposito);
    if (
      data.postbackUrl !== undefined &&
      data.postbackUrl !== existingConfig?.postbackUrl
    )
      config.postbackUrl = data.postbackUrl || null;
    if (
      data.googleAnalyticsId !== undefined &&
      data.googleAnalyticsId !== existingConfig?.googleAnalyticsId
    ) {
      config.googleAnalyticsId = data.googleAnalyticsId || null;
    }
    if (
      data.googleTagManagerId !== undefined &&
      data.googleTagManagerId !== existingConfig?.googleTagManagerId
    ) {
      config.googleTagManagerId = data.googleTagManagerId || null;
    }
    if (
      data.facebookPixelId !== undefined &&
      data.facebookPixelId !== existingConfig?.facebookPixelId
    ) {
      config.facebookPixelId = data.facebookPixelId || null;
    }
    if (
      data.trackRegisterEvents !== undefined &&
      data.trackRegisterEvents !== existingConfig?.trackRegisterEvents
    ) {
      config.trackRegisterEvents = Boolean(data.trackRegisterEvents);
    }
    if (
      data.trackDepositEvents !== undefined &&
      data.trackDepositEvents !== existingConfig?.trackDepositEvents
    ) {
      config.trackDepositEvents = Boolean(data.trackDepositEvents);
    }
    if (
      data.trackWithdrawalEvents !== undefined &&
      data.trackWithdrawalEvents !== existingConfig?.trackWithdrawalEvents
    ) {
      config.trackWithdrawalEvents = Boolean(data.trackWithdrawalEvents);
    }
    if (data.authSecret !== undefined) {
      config.authSecret = data.authSecret || null;
    }
    if (data.adminSessionSecret !== undefined) {
      config.adminSessionSecret = data.adminSessionSecret || null;
    }
    if (data.settleSecret !== undefined) {
      config.settleSecret = data.settleSecret || null;
    }
    if (data.googleClientId !== undefined) {
      config.googleClientId = data.googleClientId || null;
    }
    if (data.googleClientSecret !== undefined) {
      config.googleClientSecret = data.googleClientSecret || null;
    }
    if (
      data.tradingMinPriceVariation !== undefined &&
      Number(data.tradingMinPriceVariation) !==
        existingConfig?.tradingMinPriceVariation
    ) {
      config.tradingMinPriceVariation = Number(data.tradingMinPriceVariation);
    }
    if (
      data.tradingSettlementTolerance !== undefined &&
      Number(data.tradingSettlementTolerance) !==
        existingConfig?.tradingSettlementTolerance
    ) {
      config.tradingSettlementTolerance = Number(
        data.tradingSettlementTolerance,
      );
    }
    if (
      data.tradingDefaultExpiryMinutes !== undefined &&
      Number(data.tradingDefaultExpiryMinutes) !==
        existingConfig?.tradingDefaultExpiryMinutes
    ) {
      config.tradingDefaultExpiryMinutes = Number(
        data.tradingDefaultExpiryMinutes,
      );
    }
    if (
      typeof data.tradingExpiryOptions === "string" &&
      data.tradingExpiryOptions !== existingConfig?.tradingExpiryOptions
    ) {
      config.tradingExpiryOptions = data.tradingExpiryOptions;
    }
    if (
      data.tradingSettlementGraceSeconds !== undefined &&
      Number(data.tradingSettlementGraceSeconds) !==
        existingConfig?.tradingSettlementGraceSeconds
    ) {
      config.tradingSettlementGraceSeconds = Number(
        data.tradingSettlementGraceSeconds,
      );
    }

    // Gateway fields
    const gatewayFields = [
      "gatewayPixDepositoId",
      "gatewayPixSaqueId",
      "creditCardDepositId",
      "cryptoDepositId",
      "cryptoSaqueId",
    ] as const;

    for (const field of gatewayFields) {
      if (data[field] !== undefined) {
        const newId = data[field] ? Number(data[field]) : null;
        if (newId !== existingConfig?.[field]) {
          (config as any)[field] = newId;
        }
      }
    }

    if (data.depositGatewayMode !== undefined) {
      const mode = normalizeGatewayMode(data.depositGatewayMode);
      if (mode !== existingConfig?.depositGatewayMode) {
        config.depositGatewayMode = mode;
      }
    }

    if (data.withdrawGatewayMode !== undefined) {
      const mode = normalizeGatewayMode(data.withdrawGatewayMode);
      if (mode !== existingConfig?.withdrawGatewayMode) {
        config.withdrawGatewayMode = mode;
      }
    }

    // Image uploads
    let logoUrlWhite =
      data.logoUrlWhite || existingConfig?.logoUrlWhite || "default-logo.png";
    let logoUrlDark =
      data.logoUrlDark || existingConfig?.logoUrlDark || "default-logo.png";
    if (
      data.logoUrlWhite !== undefined &&
      data.logoUrlWhite !== existingConfig?.logoUrlWhite
    ) {
      config.logoUrlWhite = logoUrlWhite;
    }
    if (
      data.logoUrlDark !== undefined &&
      data.logoUrlDark !== existingConfig?.logoUrlDark
    ) {
      config.logoUrlDark = logoUrlDark;
    }
    if (data.logoWhite) {
      logoUrlWhite = await handleImage(data.logoWhite, logoUrlWhite);
      if (logoUrlWhite !== existingConfig?.logoUrlWhite)
        config.logoUrlWhite = logoUrlWhite;
    }
    if (data.logoDark) {
      logoUrlDark = await handleImage(data.logoDark, logoUrlDark);
      if (logoUrlDark !== existingConfig?.logoUrlDark)
        config.logoUrlDark = logoUrlDark;
    }

    // Chart background image
    if (data.chartBackground) {
      const chartBgUrl = await handleImage(
        data.chartBackground,
        existingConfig?.chartBackgroundUrl ?? null,
      );
      if (chartBgUrl !== existingConfig?.chartBackgroundUrl)
        config.chartBackgroundUrl = chartBgUrl || null;
    } else if (
      data.chartBackgroundUrl !== undefined &&
      data.chartBackgroundUrl !== existingConfig?.chartBackgroundUrl
    ) {
      config.chartBackgroundUrl = data.chartBackgroundUrl || null;
    }

    // Favicon image
    if (data.favicon) {
      const faviconUrl = await handleImage(
        data.favicon,
        existingConfig?.faviconUrl ?? null,
      );
      if (faviconUrl !== existingConfig?.faviconUrl)
        config.faviconUrl = faviconUrl || null;
    } else if (
      data.faviconUrl !== undefined &&
      data.faviconUrl !== existingConfig?.faviconUrl
    ) {
      config.faviconUrl = data.faviconUrl || null;
    }

    // Validate gateway references
    for (const field of gatewayFields) {
      const id = (config as any)[field];
      if (id != null) {
        const gw = await getGatewayById(id);
        if (!gw) {
          return NextResponse.json(
            { error: `Gateway não encontrado para ${field}` },
            { status: 404 },
          );
        }
      }
    }

    const hasProviderUpdates =
      Array.isArray(data.marketProviders) && data.marketProviders.length > 0;

    let updatedConfig = existingConfig;

    if (Object.keys(config).length > 0) {
      updatedConfig = await upsertConfig(config);
    }

    let marketProviders = await getMarketProviders();

    if (hasProviderUpdates) {
      marketProviders = await updateMarketProviders(
        data.marketProviders.map((provider: NonNullable<ConfigInput["marketProviders"]>[number]) => ({
          id: Number(provider.id),
          authToken: provider.authToken ?? null,
          isActive: provider.isActive,
        })),
      );
    }

    invalidateAdminRuntimeConfigCache();
    invalidateAdminSiteConfigCache();

    if (Object.keys(config).length > 0 || hasProviderUpdates) {
      await revalidateTradingCaches(
        existingConfig?.adminSessionSecret ||
          existingConfig?.authSecret ||
          updatedConfig?.adminSessionSecret ||
          updatedConfig?.authSecret ||
          null,
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...(updatedConfig || {}),
        marketProviders,
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar configurações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor ao atualizar configurações" },
      { status: 500 },
    );
  }
}
