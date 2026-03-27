import { NextResponse } from "next/server";
import { getPlatformConfig } from "@/lib/config/site-config";

// GET - Obter configurações (apenas campos específicos)
export async function GET() {
  try {
    const config = await getPlatformConfig();
    return NextResponse.json({
      ...config,
      nome: config.nomeSite,
      logo: config.logoUrlDark,
      logoDark: config.logoUrlDark,
      logoWhite: config.logoUrlWhite,
      backgroundColor: config.backgroundColor,
    });
  } catch (error) {
    console.error("Erro ao carregar configurações:", error);
    return NextResponse.json(
      { error: "Falha ao carregar configurações" },
      { status: 500 },
    );
  }
}
