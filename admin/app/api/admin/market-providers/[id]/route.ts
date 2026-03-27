import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin("SUPER_ADMIN");
  if (auth.error) return auth.error;

  try {
    const { id } = await context.params;
    const body = await request.json();
    const providerId = Number(id);

    const currentProvider = await db.query.marketDataProviders.findFirst({
      where: eq(marketDataProviders.id, providerId),
    });

    if (!currentProvider) {
      return NextResponse.json(
        { error: "Provedor não encontrado" },
        { status: 404 },
      );
    }

    const nextName = body.name
      ? String(body.name).trim()
      : currentProvider.name;
    const nextSlug =
      body.slug !== undefined
        ? normalizeSlug(body.slug)
        : currentProvider.slug;

    const [provider] = await db
      .update(marketDataProviders)
      .set({
        slug: nextSlug || currentProvider.slug,
        name: nextName,
        type:
          body.type !== undefined
            ? normalizeType(body.type)
            : currentProvider.type,
        restBaseUrl:
          body.restBaseUrl !== undefined
            ? String(body.restBaseUrl).trim()
            : undefined,
        wsBaseUrl:
          body.wsBaseUrl !== undefined
            ? body.wsBaseUrl
              ? String(body.wsBaseUrl).trim()
              : null
            : undefined,
        authType:
          body.authType !== undefined
            ? String(body.authType).trim()
            : undefined,
        authHeaderName:
          body.authHeaderName !== undefined
            ? body.authHeaderName
              ? String(body.authHeaderName).trim()
              : null
            : undefined,
        authQueryParam:
          body.authQueryParam !== undefined
            ? body.authQueryParam
              ? String(body.authQueryParam).trim()
              : null
            : undefined,
        authToken:
          body.authToken !== undefined
            ? body.authToken
              ? String(body.authToken).trim()
              : null
            : undefined,
        isActive: body.isActive,
        sortOrder:
          body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
      })
      .where(eq(marketDataProviders.id, providerId))
      .returning();

    await db
      .update(tradingPairs)
      .set({
        provider: provider.name,
        priceSource: provider.slug,
      })
      .where(eq(tradingPairs.providerId, providerId));

    return NextResponse.json(provider);
  } catch (error) {
    console.error("Erro ao atualizar provedor:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar provedor" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin("SUPER_ADMIN");
  if (auth.error) return auth.error;

  try {
    const { id } = await context.params;
    const providerId = Number(id);

    const linkedPair = await db.query.tradingPairs.findFirst({
      where: eq(tradingPairs.providerId, providerId),
      columns: { id: true },
    });

    if (linkedPair) {
      return NextResponse.json(
        { error: "Remova ou migre os ativos vinculados antes de excluir." },
        { status: 409 },
      );
    }

    await db
      .delete(marketDataProviders)
      .where(eq(marketDataProviders.id, providerId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao remover provedor:", error);
    return NextResponse.json(
      { error: "Erro ao remover provedor" },
      { status: 500 },
    );
  }
}
