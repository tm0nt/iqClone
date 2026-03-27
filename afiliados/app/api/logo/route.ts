import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { configs } from "@/db/schema";

export async function GET(request: NextRequest) {

  try {
    // Buscar configurações (só deve existir um registro)
    const [config] = await db.select().from(configs).limit(1);

    if (!config) {
      // Se não existir, criar com valores padrão
      const [newConfig] = await db.insert(configs).values({}).returning();
      return NextResponse.json({
        logo: newConfig.logoUrlDark,
        logoDark: newConfig.logoUrlDark,
        logoWhite: newConfig.logoUrlWhite,
        nome: newConfig.nomeSite,
        backgroundColor: newConfig.backgroundColor,
      });
    }

    return NextResponse.json({
      logo: config.logoUrlDark,
      logoDark: config.logoUrlDark,
      logoWhite: config.logoUrlWhite,
      nome: config.nomeSite,
      backgroundColor: config.backgroundColor,
    });
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
