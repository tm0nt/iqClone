import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { configs } from "@/db/schema";
import { resolveAdminAssetUrl } from "@shared/platform/asset-urls";

function normalizeConfigAssets<T extends { logoUrlDark: string; logoUrlWhite: string }>(
  config: T,
) {
  const adminBaseUrl =
    process.env.ADMIN_BASE_URL?.trim() ??
    process.env.NEXT_PUBLIC_ADMIN_URL?.trim() ??
    "";

  return {
    ...config,
    logoUrlDark:
      resolveAdminAssetUrl(config.logoUrlDark, adminBaseUrl) ||
      config.logoUrlDark,
    logoUrlWhite:
      resolveAdminAssetUrl(config.logoUrlWhite, adminBaseUrl) ||
      config.logoUrlWhite,
  };
}

export async function GET(request: NextRequest) {

  try {
    // Buscar configurações (só deve existir um registro)
    const [config] = await db.select().from(configs).limit(1);

    if (!config) {
      // Se não existir, criar com valores padrão
      const [createdConfig] = await db.insert(configs).values({}).returning();
      const newConfig = normalizeConfigAssets(createdConfig);
      return NextResponse.json({
        logo: newConfig.logoUrlDark,
        logoDark: newConfig.logoUrlDark,
        logoWhite: newConfig.logoUrlWhite,
        nome: newConfig.nomeSite,
        backgroundColor: newConfig.backgroundColor,
      });
    }

    const normalizedConfig = normalizeConfigAssets(config);

    return NextResponse.json({
      logo: normalizedConfig.logoUrlDark,
      logoDark: normalizedConfig.logoUrlDark,
      logoWhite: normalizedConfig.logoUrlWhite,
      nome: normalizedConfig.nomeSite,
      backgroundColor: normalizedConfig.backgroundColor,
    });
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
