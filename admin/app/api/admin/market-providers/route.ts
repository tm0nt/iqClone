import { NextRequest, NextResponse } from "next/server";
import { asc, eq, isNotNull, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { marketDataProviders, tradingPairs } from "@/db/schema";

function normalizeSlug(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeType(value: unknown): "crypto" | "forex" {
  return value === "forex" ? "forex" : "crypto";
}

export async function GET() {
  const auth = await requireAdmin("SUPER_ADMIN", "ADMIN");
  if (auth.error) return auth.error;

  try {
    const [providers, stats] = await Promise.all([
      db
        .select()
        .from(marketDataProviders)
        .orderBy(
          asc(marketDataProviders.sortOrder),
          asc(marketDataProviders.name),
        ),
      db
        .select({
          providerId: tradingPairs.providerId,
          pairsCount: sql<number>`count(*)`,
          activePairsCount: sql<number>`count(*) filter (where ${tradingPairs.isActive} = true)`,
        })
        .from(tradingPairs)
        .where(isNotNull(tradingPairs.providerId))
        .groupBy(tradingPairs.providerId),
    ]);

    const statsByProviderId = new Map(
      stats.map((item) => [item.providerId, item]),
    );

    return NextResponse.json(
      providers.map((provider) => {
        const providerStats = statsByProviderId.get(provider.id);

        return {
          ...provider,
          pairsCount: Number(providerStats?.pairsCount ?? 0),
          activePairsCount: Number(providerStats?.activePairsCount ?? 0),
        };
      }),
    );
  } catch (error) {
    console.error("Erro ao listar provedores:", error);
    return NextResponse.json(
      { error: "Erro ao listar provedores" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin("SUPER_ADMIN");
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const slug = normalizeSlug(body.slug || body.name);
    const name = String(body.name || "").trim();

    if (!slug || !name || !body.restBaseUrl) {
      return NextResponse.json(
        { error: "Campos obrigatórios: slug, name e restBaseUrl" },
        { status: 400 },
      );
    }

    const [provider] = await db
      .insert(marketDataProviders)
      .values({
        slug,
        name,
        type: normalizeType(body.type),
        restBaseUrl: String(body.restBaseUrl).trim(),
        wsBaseUrl: body.wsBaseUrl ? String(body.wsBaseUrl).trim() : null,
        authType: body.authType ? String(body.authType).trim() : "none",
        authHeaderName: body.authHeaderName
          ? String(body.authHeaderName).trim()
          : null,
        authQueryParam: body.authQueryParam
          ? String(body.authQueryParam).trim()
          : null,
        authToken: body.authToken ? String(body.authToken).trim() : null,
        envKey: null,
        isActive: body.isActive ?? true,
        sortOrder: Number(body.sortOrder ?? 0),
      })
      .returning();

    return NextResponse.json(provider, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar provedor:", error);
    return NextResponse.json(
      { error: "Erro ao criar provedor" },
      { status: 500 },
    );
  }
}
