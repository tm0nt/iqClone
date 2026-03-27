import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { promotions } from "@/db/schema";

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin("SUPER_ADMIN");
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const title = String(body.title || "").trim();
    const slug = normalizeSlug(body.slug || title);

    const [promotion] = await db
      .update(promotions)
      .set({
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
        updatedAt: new Date(),
      })
      .where(eq(promotions.id, id))
      .returning();

    return NextResponse.json(promotion);
  } catch (error) {
    console.error("Erro ao atualizar promoção:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar promoção" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin("SUPER_ADMIN");
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    await db.delete(promotions).where(eq(promotions.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao remover promoção:", error);
    return NextResponse.json(
      { error: "Erro ao remover promoção" },
      { status: 500 },
    );
  }
}
