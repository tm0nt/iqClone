import { NextResponse } from "next/server";
import { getPlatformConfig } from "@/lib/config/site-config";

/**
 * Resolve a logo URL so it is always an absolute URL accessible from any origin.
 *
 * - If already absolute (http/https) → return as-is.
 * - If relative → return the stored path.
 */
function resolveLogoUrl(url: string | null | undefined): string {
  if (!url) return "/nextbrokers.png";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return url;
}

export async function GET() {
  try {
    const config = await getPlatformConfig();

    return NextResponse.json({
      logo: resolveLogoUrl(config.logoUrlDark),
      logoDark: resolveLogoUrl(config.logoUrlDark),
      logoWhite: resolveLogoUrl(config.logoUrlWhite),
      nome: config.nomeSite,
      backgroundColor: config.backgroundColor,
    });
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
