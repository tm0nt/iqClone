import { NextResponse } from "next/server";
import { getPlatformConfig } from "@/lib/config/site-config";

export async function GET() {
  try {
    const config = await getPlatformConfig();

    return NextResponse.json({
      logo: config.logoUrlDark,
      logoDark: config.logoUrlDark,
      logoWhite: config.logoUrlWhite,
      logoMobile: config.logoUrlMobile || null,
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
