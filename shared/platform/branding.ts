export { formatUsd } from "./currency";

export const BRANDING_DEFAULTS = {
  nomeSite: "Bincebroker",
  logoUrlDark: "default-logo.png",
  logoUrlWhite: "default-logo.png",
  primaryColor: "#1ca06d",
  primaryHoverColor: "#0b7250",
  primaryGradientFrom: "#0b7250",
  primaryGradientVia: "#1ca06d",
  primaryGradientTo: "#3cd385",
  buttonTextColor: "#ffffff",
  backgroundColor: "#252b3b",
  surfaceColor: "#364152",
  surfaceAltColor: "#2a3441",
  cardColor: "#1e293b",
  borderColor: "#2a3441",
  headerGradientFrom: "#1a1d29",
  headerGradientTo: "#252b3b",
  headerTextColor: "#ffffff",
  mutedTextColor: "#a1a8b3",
  authBackgroundColor: "#ffffff",
  loadingBackgroundColor: "#ffffff",
  loadingTrackColor: "#d1d5db",
  loadingGradientFrom: "#0b7250",
  loadingGradientVia: "#1ca06d",
  loadingGradientTo: "#3cd385",
  successColor: "#16a34a",
  dangerColor: "#dc2626",
  textColor: "#ffffff",
  iconColor: "#a1a8b3",
  iconBgColor: "#364152",
  positiveColor: "#22c55e",
  negativeColor: "#ef4444",
  candleUpColor: "#00ab34",
  candleDownColor: "#d21a2a",
  chartGridColor: "#666666",

  // Semantic colors
  warningColor: "#f59e0b",
  infoColor: "#3b82f6",
  accentColor: "#3b82f6",
  demoColor: "#f97316",
  demoHoverColor: "#ea580c",

  // Overlay colors
  overlayBackdropColor: "#0f172a",
  overlaySurfaceColor: "#1e293b",
  overlayBorderColor: "#334155",
  overlayCardColor: "#334155",
  overlayHoverColor: "#3a4551",
  overlayMutedTextColor: "#94a3b8",

  // Input colors
  inputBackgroundColor: "#1a1a1a",
  inputBorderColor: "#2a2a2a",
  inputLabelColor: "#999999",
  inputSubtleTextColor: "#666666",

  // Chart-specific
  chartDeepBackgroundColor: "#060b12",
  chartSurfaceColor: "#1d2736",
  chartSurfaceAltColor: "#16202e",
  chartPriceTagColor: "#d88a31",

  // Foreground colors (for contrast pairs)
  backgroundForegroundColor: "#ffffff",
  backgroundMutedForegroundColor: "#a1a8b3",
  surfaceForegroundColor: "#ffffff",
  surfaceMutedForegroundColor: "#a1a8b3",
  surfaceAltForegroundColor: "#ffffff",
  surfaceAltMutedForegroundColor: "#a1a8b3",
  cardForegroundColor: "#ffffff",
  cardMutedForegroundColor: "#a1a8b3",
  overlaySurfaceForegroundColor: "#ffffff",
  overlaySurfaceMutedForegroundColor: "#94a3b8",
  overlayCardForegroundColor: "#ffffff",
  overlayCardMutedForegroundColor: "#94a3b8",
  inputForegroundColor: "#ffffff",
  inputMutedForegroundColor: "#999999",
  primaryForegroundColor: "#ffffff",
  successForegroundColor: "#ffffff",
  dangerForegroundColor: "#ffffff",
  warningForegroundColor: "#111827",
  demoForegroundColor: "#ffffff",

  depositGatewayMode: "manual",
  withdrawGatewayMode: "manual",
} as const;

export type BrandingConfig = typeof BRANDING_DEFAULTS & {
  [key: string]: string | number | null | undefined;
};

export const BRANDING_FIELDS = [
  "primaryColor",
  "primaryHoverColor",
  "primaryGradientFrom",
  "primaryGradientVia",
  "primaryGradientTo",
  "buttonTextColor",
  "backgroundColor",
  "surfaceColor",
  "surfaceAltColor",
  "cardColor",
  "borderColor",
  "headerGradientFrom",
  "headerGradientTo",
  "headerTextColor",
  "mutedTextColor",
  "authBackgroundColor",
  "loadingBackgroundColor",
  "loadingTrackColor",
  "loadingGradientFrom",
  "loadingGradientVia",
  "loadingGradientTo",
  "successColor",
  "dangerColor",
  "textColor",
  "iconColor",
  "iconBgColor",
  "positiveColor",
  "negativeColor",
  "candleUpColor",
  "candleDownColor",
  "chartGridColor",
  "warningColor",
  "infoColor",
  "accentColor",
  "demoColor",
  "demoHoverColor",
  "overlayBackdropColor",
  "overlaySurfaceColor",
  "overlayBorderColor",
  "overlayCardColor",
  "overlayHoverColor",
  "overlayMutedTextColor",
  "inputBackgroundColor",
  "inputBorderColor",
  "inputLabelColor",
  "inputSubtleTextColor",
  "chartDeepBackgroundColor",
  "chartSurfaceColor",
  "chartSurfaceAltColor",
  "chartPriceTagColor",
  "backgroundForegroundColor",
  "backgroundMutedForegroundColor",
  "surfaceForegroundColor",
  "surfaceMutedForegroundColor",
  "surfaceAltForegroundColor",
  "surfaceAltMutedForegroundColor",
  "cardForegroundColor",
  "cardMutedForegroundColor",
  "overlaySurfaceForegroundColor",
  "overlaySurfaceMutedForegroundColor",
  "overlayCardForegroundColor",
  "overlayCardMutedForegroundColor",
  "inputForegroundColor",
  "inputMutedForegroundColor",
  "primaryForegroundColor",
  "successForegroundColor",
  "dangerForegroundColor",
  "warningForegroundColor",
  "demoForegroundColor",
  "depositGatewayMode",
  "withdrawGatewayMode",
] as const;

export function getBrandingValue(
  config: Partial<BrandingConfig> | null | undefined,
  field: keyof typeof BRANDING_DEFAULTS,
): string {
  const raw = config?.[field];
  if (typeof raw === "string" && raw.trim().length > 0) {
    return raw.trim();
  }
  return BRANDING_DEFAULTS[field];
}

export function extractBrandingUpdate(
  input: Record<string, unknown>,
): Partial<Record<(typeof BRANDING_FIELDS)[number], string>> {
  const update: Partial<Record<(typeof BRANDING_FIELDS)[number], string>> = {};

  for (const field of BRANDING_FIELDS) {
    const value = input[field];
    if (typeof value === "string" && value.trim().length > 0) {
      update[field] = value.trim();
    }
  }

  return update;
}

export function buildBrandingCssVariables(
  config: Partial<BrandingConfig> | null | undefined,
): Record<string, string> {
  return {
    "--platform-primary-color": getBrandingValue(config, "primaryColor"),
    "--platform-primary-hover-color": getBrandingValue(
      config,
      "primaryHoverColor",
    ),
    "--platform-primary-gradient-from": getBrandingValue(
      config,
      "primaryGradientFrom",
    ),
    "--platform-primary-gradient-via": getBrandingValue(
      config,
      "primaryGradientVia",
    ),
    "--platform-primary-gradient-to": getBrandingValue(
      config,
      "primaryGradientTo",
    ),
    "--platform-button-text-color": getBrandingValue(config, "buttonTextColor"),
    "--platform-background-color": getBrandingValue(config, "backgroundColor"),
    "--platform-surface-color": getBrandingValue(config, "surfaceColor"),
    "--platform-surface-alt-color": getBrandingValue(config, "surfaceAltColor"),
    "--platform-card-color": getBrandingValue(config, "cardColor"),
    "--platform-border-color": getBrandingValue(config, "borderColor"),
    "--platform-header-gradient-from": getBrandingValue(
      config,
      "headerGradientFrom",
    ),
    "--platform-header-gradient-to": getBrandingValue(
      config,
      "headerGradientTo",
    ),
    "--platform-header-text-color": getBrandingValue(
      config,
      "headerTextColor",
    ),
    "--platform-muted-text-color": getBrandingValue(config, "mutedTextColor"),
    "--platform-auth-background-color": getBrandingValue(
      config,
      "authBackgroundColor",
    ),
    "--platform-loading-background-color": getBrandingValue(
      config,
      "loadingBackgroundColor",
    ),
    "--platform-loading-track-color": getBrandingValue(
      config,
      "loadingTrackColor",
    ),
    "--platform-loading-gradient-from": getBrandingValue(
      config,
      "loadingGradientFrom",
    ),
    "--platform-loading-gradient-via": getBrandingValue(
      config,
      "loadingGradientVia",
    ),
    "--platform-loading-gradient-to": getBrandingValue(
      config,
      "loadingGradientTo",
    ),
    "--platform-success-color": getBrandingValue(config, "successColor"),
    "--platform-danger-color": getBrandingValue(config, "dangerColor"),
    "--platform-text-color": getBrandingValue(config, "textColor"),
    "--platform-icon-color": getBrandingValue(config, "iconColor"),
    "--platform-icon-bg-color": getBrandingValue(config, "iconBgColor"),
    "--platform-positive-color": getBrandingValue(config, "positiveColor"),
    "--platform-negative-color": getBrandingValue(config, "negativeColor"),
    "--platform-candle-up-color": getBrandingValue(config, "candleUpColor"),
    "--platform-candle-down-color": getBrandingValue(config, "candleDownColor"),
    "--platform-chart-grid-color": getBrandingValue(config, "chartGridColor"),

    // Semantic colors
    "--platform-warning-color": getBrandingValue(config, "warningColor"),
    "--platform-info-color": getBrandingValue(config, "infoColor"),
    "--platform-accent-color": getBrandingValue(config, "accentColor"),
    "--platform-demo-color": getBrandingValue(config, "demoColor"),
    "--platform-demo-hover-color": getBrandingValue(config, "demoHoverColor"),

    // Overlay colors
    "--platform-overlay-backdrop-color": getBrandingValue(config, "overlayBackdropColor"),
    "--platform-overlay-surface-color": getBrandingValue(config, "overlaySurfaceColor"),
    "--platform-overlay-border-color": getBrandingValue(config, "overlayBorderColor"),
    "--platform-overlay-card-color": getBrandingValue(config, "overlayCardColor"),
    "--platform-overlay-hover-color": getBrandingValue(config, "overlayHoverColor"),
    "--platform-overlay-muted-text-color": getBrandingValue(config, "overlayMutedTextColor"),

    // Input colors
    "--platform-input-background-color": getBrandingValue(config, "inputBackgroundColor"),
    "--platform-input-border-color": getBrandingValue(config, "inputBorderColor"),
    "--platform-input-label-color": getBrandingValue(config, "inputLabelColor"),
    "--platform-input-subtle-text-color": getBrandingValue(config, "inputSubtleTextColor"),

    // Chart-specific
    "--platform-chart-deep-background-color": getBrandingValue(config, "chartDeepBackgroundColor"),
    "--platform-chart-surface-color": getBrandingValue(config, "chartSurfaceColor"),
    "--platform-chart-surface-alt-color": getBrandingValue(config, "chartSurfaceAltColor"),
    "--platform-chart-price-tag-color": getBrandingValue(config, "chartPriceTagColor"),

    // Foreground colors (contrast pairs)
    "--platform-background-foreground-color": getBrandingValue(config, "backgroundForegroundColor"),
    "--platform-background-muted-foreground-color": getBrandingValue(config, "backgroundMutedForegroundColor"),
    "--platform-surface-foreground-color": getBrandingValue(config, "surfaceForegroundColor"),
    "--platform-surface-muted-foreground-color": getBrandingValue(config, "surfaceMutedForegroundColor"),
    "--platform-surface-alt-foreground-color": getBrandingValue(config, "surfaceAltForegroundColor"),
    "--platform-surface-alt-muted-foreground-color": getBrandingValue(config, "surfaceAltMutedForegroundColor"),
    "--platform-card-foreground-color": getBrandingValue(config, "cardForegroundColor"),
    "--platform-card-muted-foreground-color": getBrandingValue(config, "cardMutedForegroundColor"),
    "--platform-overlay-surface-foreground-color": getBrandingValue(config, "overlaySurfaceForegroundColor"),
    "--platform-overlay-surface-muted-foreground-color": getBrandingValue(config, "overlaySurfaceMutedForegroundColor"),
    "--platform-overlay-card-foreground-color": getBrandingValue(config, "overlayCardForegroundColor"),
    "--platform-overlay-card-muted-foreground-color": getBrandingValue(config, "overlayCardMutedForegroundColor"),
    "--platform-input-foreground-color": getBrandingValue(config, "inputForegroundColor"),
    "--platform-input-muted-foreground-color": getBrandingValue(config, "inputMutedForegroundColor"),
    "--platform-primary-foreground-color": getBrandingValue(config, "primaryForegroundColor"),
    "--platform-success-foreground-color": getBrandingValue(config, "successForegroundColor"),
    "--platform-danger-foreground-color": getBrandingValue(config, "dangerForegroundColor"),
    "--platform-warning-foreground-color": getBrandingValue(config, "warningForegroundColor"),
    "--platform-demo-foreground-color": getBrandingValue(config, "demoForegroundColor"),
  };
}

export function buildAdminThemeCssVariables(
  _config: Partial<BrandingConfig> | null | undefined,
): Record<string, string> {
  return {};
}

export function normalizeGatewayMode(value: unknown): "manual" | "round_robin" | "random" {
  if (value === "round_robin" || value === "random") {
    return value;
  }
  return "manual";
}

function normalizeHexColor(color: string | null | undefined): string | null {
  if (!color) return null;
  const normalized = color.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
    return normalized;
  }
  if (/^#[0-9a-fA-F]{3}$/.test(normalized)) {
    return `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`;
  }
  return null;
}

export function isDarkHexColor(
  color: string | null | undefined,
  fallback = true,
): boolean {
  const normalized = normalizeHexColor(color);
  if (!normalized) {
    return fallback;
  }

  const red = Number.parseInt(normalized.slice(1, 3), 16) / 255;
  const green = Number.parseInt(normalized.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(normalized.slice(5, 7), 16) / 255;

  const transform = (channel: number) =>
    channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;

  const luminance =
    0.2126 * transform(red) +
    0.7152 * transform(green) +
    0.0722 * transform(blue);

  return luminance < 0.45;
}

export function resolveLogoForBackground(input: {
  backgroundColor?: string | null;
  logoDark?: string | null;
  logoWhite?: string | null;
  fallback?: string;
}) {
  const fallback = input.fallback || "/nextbrokers.png";
  const darkBg = isDarkHexColor(
    input.backgroundColor ?? BRANDING_DEFAULTS.backgroundColor,
  );

  if (darkBg) {
    return input.logoWhite || input.logoDark || fallback;
  }

  return input.logoDark || input.logoWhite || fallback;
}
