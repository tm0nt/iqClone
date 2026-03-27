import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { withdrawals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("SUPER_ADMIN", "ADMIN");
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const [withdrawal] = await db
      .update(withdrawals)
      .set({ status: "cancelado" })
      .where(eq(withdrawals.id, id))
      .returning();

    return NextResponse.json({
      message: "Saque rejeitado e status alterado para CANCELADO",
      withdrawal,
    });
  } catch (error) {
    console.error("Erro ao cancelar saque:", error);
    return NextResponse.json({ error: "Erro interno ao cancelar saque" }, { status: 500 });
  }
}
