import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { kycs, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin("SUPER_ADMIN", "ADMIN");
  if (auth.error) return auth.error;

  try {
    const { id } = await context.params;
    const body = await request.json();
    const status = body.status;

    if (!["APPROVED", "PENDING", "REJECT"].includes(status)) {
      return NextResponse.json(
        { error: "Status inválido" },
        { status: 400 },
      );
    }

    const updated = await db.transaction(async (tx) => {
      const [kyc] = await tx
        .update(kycs)
        .set({ status })
        .where(eq(kycs.id, id))
        .returning();

      if (!kyc) throw new Error("KYC não encontrado");

      await tx
        .update(users)
        .set({ kyc: status })
        .where(eq(users.id, kyc.userId));

      return kyc;
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar KYC:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar KYC" },
      { status: 500 },
    );
  }
}
