"use client";

import { useEffect, useState, createContext, useContext } from "react";

type ThemeColors = Record<string, string>;

const ThemeColorsContext = createContext<ThemeColors>({});

export function useThemeColors() {
  return useContext(ThemeColorsContext);
}

/** Convert hex (#rrggbb) to HSL string "h s% l%" (no commas, Tailwind format) */
function hexToHsl(hex: string): string | null {
  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return null;

  let r = parseInt(match[1], 16) / 255;
  let g = parseInt(match[2], 16) / 255;
  let b = parseInt(match[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Maps DB color field names to CSS custom property names.
 * The CSS vars use the Tailwind HSL format (no hsl() wrapper — Tailwind adds it).
 */
const COLOR_TO_CSS_VAR: Record<string, string> = {
  // Core semantic — overrides the existing Tailwind CSS vars
  primaryColor: "--primary",
  dangerColor: "--destructive",
  borderColor: "--border",
  cardColor: "--card",
  backgroundColor: "--background",
  textColor: "--foreground",
  mutedTextColor: "--muted-foreground",
  surfaceColor: "--secondary",
  accentColor: "--accent",

  // Extended — new custom vars available via Tailwind extend
  primaryHoverColor: "--primary-hover",
  primaryGradientFrom: "--primary-gradient-from",
  primaryGradientVia: "--primary-gradient-via",
  primaryGradientTo: "--primary-gradient-to",
  warningColor: "--warning",
  demoColor: "--demo",
  demoHoverColor: "--demo-hover",
  buttonTextColor: "--button-text",
  surfaceAltColor: "--surface-alt",
  overlayBackdropColor: "--overlay-backdrop",
  overlaySurfaceColor: "--overlay-surface",
  overlayBorderColor: "--overlay-border",
  overlayCardColor: "--overlay-card",
  overlayHoverColor: "--overlay-hover",
  overlayMutedTextColor: "--overlay-muted-text",
  headerGradientFrom: "--header-gradient-from",
  headerGradientTo: "--header-gradient-to",
  headerTextColor: "--header-text",
  authBackgroundColor: "--auth-background",
  inputBackgroundColor: "--input-background",
  inputBorderColor: "--input-border",
  inputLabelColor: "--input-label",
  inputSubtleTextColor: "--input-subtle-text",
  loadingBackgroundColor: "--loading-background",
  loadingTrackColor: "--loading-track",
  loadingGradientFrom: "--loading-gradient-from",
  loadingGradientVia: "--loading-gradient-via",
  loadingGradientTo: "--loading-gradient-to",
  successColor: "--success",
  iconColor: "--icon",
  iconBgColor: "--icon-bg",
  positiveColor: "--positive",
  negativeColor: "--negative",
  chartPriceTagColor: "--chart-price-tag",
};

export function DynamicThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [colors, setColors] = useState<ThemeColors>({});

  useEffect(() => {
    fetch("/api/theme")
      .then((res) => (res.ok ? res.json() : {}))
      .then((data: ThemeColors) => {
        setColors(data);
        const root = document.documentElement;

        for (const [field, hex] of Object.entries(data)) {
          const cssVar = COLOR_TO_CSS_VAR[field];
          if (!cssVar) continue;

          const hsl = hexToHsl(hex);
          if (hsl) {
            root.style.setProperty(cssVar, hsl);
          }
        }

        // Also set ring to match primary
        if (data.primaryColor) {
          const hsl = hexToHsl(data.primaryColor);
          if (hsl) root.style.setProperty("--ring", hsl);
        }
        // primary-foreground = button text
        if (data.buttonTextColor) {
          const hsl = hexToHsl(data.buttonTextColor);
          if (hsl) root.style.setProperty("--primary-foreground", hsl);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <ThemeColorsContext.Provider value={colors}>
      {children}
    </ThemeColorsContext.Provider>
  );
}
