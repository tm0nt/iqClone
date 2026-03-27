import { NextResponse } from "next/server";
import { getMarketProvidersMap } from "@/lib/server/market-registry";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const includeInactive = url.searchParams.get("includeInactive") === "true";

  try {
    const providers = [...(await getMarketProvidersMap()).values()]
      .filter((provider) => includeInactive || provider.isActive)
      .map((provider) => ({
        id: provider.id,
        slug: provider.slug,
        name: provider.name,
        type: provider.type,
        restBaseUrl: provider.restBaseUrl,
        wsBaseUrl: provider.wsBaseUrl,
        authType: provider.authType,
        authHeaderName: provider.authHeaderName,
        authQueryParam: provider.authQueryParam,
        envKey: provider.envKey,
        isActive: provider.isActive,
        sortOrder: provider.sortOrder,
      }));

    return NextResponse.json(providers, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Erro ao carregar providers de mercado:", error);
    return NextResponse.json(
      { error: "Falha ao carregar providers de mercado" },
      { status: 500 },
    );
  }
}
