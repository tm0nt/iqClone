import { NextResponse } from "next/server";
import { db } from "@/db";
import { configs } from "@/db/schema";

const COLOR_FIELDS = [
  "primaryColor",
  "primaryHoverColor",
  "primaryGradientFrom",
  "primaryGradientVia",
  "primaryGradientTo",
  "accentColor",
  "warningColor",
  "demoColor",
  "demoHoverColor",
  "buttonTextColor",
  "backgroundColor",
  "surfaceColor",
  "surfaceAltColor",
  "cardColor",
  "borderColor",
  "overlayBackdropColor",
  "overlaySurfaceColor",
  "overlayBorderColor",
  "overlayCardColor",
  "overlayHoverColor",
  "overlayMutedTextColor",
  "headerGradientFrom",
  "headerGradientTo",
  "headerTextColor",
  "mutedTextColor",
  "textColor",
  "authBackgroundColor",
  "inputBackgroundColor",
  "inputBorderColor",
  "inputLabelColor",
  "inputSubtleTextColor",
  "loadingBackgroundColor",
  "loadingTrackColor",
  "loadingGradientFrom",
  "loadingGradientVia",
  "loadingGradientTo",
  "successColor",
  "dangerColor",
  "iconColor",
  "iconBgColor",
  "positiveColor",
  "negativeColor",
  "chartPriceTagColor",
] as const;

export async function GET() {
  try {
    const [config] = await db.select().from(configs).limit(1);

    if (!config) {
      return NextResponse.json({});
    }

    const colors: Record<string, string> = {};
    for (const field of COLOR_FIELDS) {
      const value = (config as Record<string, unknown>)[field];
      if (typeof value === "string" && value) {
        colors[field] = value;
      }
    }

    return NextResponse.json(colors, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Erro ao buscar tema:", error);
    return NextResponse.json({}, { status: 500 });
  }
}
