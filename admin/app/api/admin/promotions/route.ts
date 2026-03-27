import { NextRequest, NextResponse } from "next/server";
import { asc, desc, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { promotionRedemptions, promotions } from "@/db/schema";

function normalizeSlug(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function nullableNumber(value: unknown) {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function nullableDate(value: unknown) {
  if (!value) return null;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function GET() {
  const auth = await requireAdmin("SUPER_ADMIN", "ADMIN");
  if (auth.error) return auth.error;

  try {
    const [items, stats] = await Promise.all([
      db.select().from(promotions).orderBy(desc(promotions.createdAt)),
      db
        .select({
          promotionId: promotionRedemptions.promotionId,
          claimsCount: sql<number>`count(*)`,
        })
        .from(promotionRedemptions)
        .groupBy(promotionRedemptions.promotionId),
    ]);

    const statsMap = new Map(
      stats.map((item) => [item.promotionId, Number(item.claimsCount ?? 0)]),
    );

    return NextResponse.json(
      items.map((item) => ({
        ...item,
        claimsCount: statsMap.get(item.id) ?? 0,
      })),
    );
  } catch (error) {
    console.error("Erro ao listar promoções:", error);
    return NextResponse.json(
      { error: "Erro ao listar promoções" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin("SUPER_ADMIN");
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const title = String(body.title || "").trim();
    const slug = normalizeSlug(body.slug || title);

    if (!title || !slug || !body.type) {
      return NextResponse.json(
        { error: "Campos obrigatórios: title, slug e type." },
        { status: 400 },
      );
    }

    const [promotion] = await db
      .insert(promotions)
      .values({
        title,
        slug,
        type: body.type === "deposit_bonus" ? "deposit_bonus" : "revenue_multiplier",
        description: body.description ? String(body.description).trim() : null,
        rulesText: body.rulesText ? String(body.rulesText).trim() : null,
        bonusPercent: nullableNumber(body.bonusPercent),
        bonusFixedAmount: nullableNumber(body.bonusFixedAmount),
        maxBonusAmount: nullableNumber(body.maxBonusAmount),
        revenueMultiplier: nullableNumber(body.revenueMultiplier),
        minDepositAmount: nullableNumber(body.minDepositAmount),
        maxClaimsTotal: nullableNumber(body.maxClaimsTotal),
        validFrom: nullableDate(body.validFrom),
        validUntil: nullableDate(body.validUntil),
        isActive: body.isActive ?? true,
      })
      .returning();

    return NextResponse.json(promotion, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar promoção:", error);
    return NextResponse.json(
      { error: "Erro ao criar promoção" },
      { status: 500 },
    );
  }
}
