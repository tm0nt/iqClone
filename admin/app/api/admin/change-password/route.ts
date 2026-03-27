import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/auth";
import { getAdminByEmail, updateAdminPassword } from "@/db/queries";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin("SUPER_ADMIN", "ADMIN");
  if (auth.error) return auth.error;

  const { currentPassword, newPassword, confirmNewPassword } =
    await request.json();

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return NextResponse.json(
      { error: "Preencha todos os campos" },
      { status: 400 },
    );
  }

  if (newPassword !== confirmNewPassword) {
    return NextResponse.json(
      { error: "As senhas não coincidem" },
      { status: 400 },
    );
  }

  try {
    const adminRows = await db
      .select({ id: admins.id, senha: admins.senha })
      .from(admins)
      .where(eq(admins.id, auth.adminId))
      .limit(1);

    const adminUser = adminRows[0];
    if (!adminUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      adminUser.senha,
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Senha atual inválida" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateAdminPassword(auth.adminId, hashedPassword);

    return NextResponse.json({ message: "Senha atualizada com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar senha:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar senha" },
      { status: 500 },
    );
  }
}
