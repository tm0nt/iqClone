import { NextRequest, NextResponse } from "next/server";
import { getConfig, upsertConfig } from "@/db/queries";

/** Normalize a logo URL. Relative /uploads/… paths become absolute using the
 *  admin's own host so the trading app (different origin) can load them. */
function resolveLogoUrl(url: string | null | undefined, baseUrl: string): string {
  if (!url) return "/nextbrokers.png";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // Legacy relative path like "/uploads/123.png" → absolute image endpoint
  if (url.startsWith("/uploads/")) {
    const filename = url.replace("/uploads/", "");
    return `${baseUrl}/api/images/${filename}`;
  }
  return url;
}

export async function GET(request: NextRequest) {
  const proto =
    request.headers.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "production" ? "https" : "http");
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "localhost";
  const baseUrl = `${proto}://${host}`;

  try {
    let config = await getConfig();
    if (!config) {
      config = await upsertConfig({});
    }

    const logoDark = resolveLogoUrl(config.logoUrlDark, baseUrl);
    const logoWhite = resolveLogoUrl(config.logoUrlWhite, baseUrl);

    return NextResponse.json({
      logo: logoDark,
      logoDark,
      logoWhite,
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
