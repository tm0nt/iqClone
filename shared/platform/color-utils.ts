/**
 * Utility for calculating relative luminance and determining
 * appropriate foreground text colors for contrast/legibility.
 */

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function srgbChannel(value: number): number {
  const s = value / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/**
 * Calculate relative luminance per WCAG 2.1 spec.
 * Returns a value between 0 (black) and 1 (white).
 */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (
    0.2126 * srgbChannel(r) + 0.7152 * srgbChannel(g) + 0.0722 * srgbChannel(b)
  );
}

/**
 * Calculate contrast ratio between two colors (WCAG 2.1).
 * Returns a value between 1 and 21.
 */
export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Returns "#ffffff" or "#000000" depending on which provides
 * better contrast against the given background color.
 */
export function getContrastTextColor(bgHex: string): "#ffffff" | "#000000" {
  const lum = relativeLuminance(bgHex);
  // If background is dark (luminance < 0.179), use white text; otherwise black.
  return lum < 0.179 ? "#ffffff" : "#000000";
}
