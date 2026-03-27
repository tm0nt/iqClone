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
      .select({
        id: withdrawals.id,
      })
      .from(withdrawals)
      .where(eq(withdrawals.id, id))
      .limit(1);

    if (!withdrawal) {
      return NextResponse.json({ error: "Saque não encontrado" }, { status: 404 });
    }

    await db
      .update(withdrawals)
      .set({ status: "processando" })
      .where(eq(withdrawals.id, id));

    return NextResponse.json({
      message: "Saque aprovado em modo manual com sucesso",
    });
  } catch (error: any) {
    console.error("Erro ao aprovar saque:", error);
    return NextResponse.json(
      { error: "Erro interno ao aprovar saque", details: error.message },
      { status: 500 }
    );
  }
}
