import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/auth";
import { updateAdmin, updateAdminPassword, deleteAdmin, getAdminById } from "@/db/queries";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin("SUPER_ADMIN");
  if (auth.error) return auth.error;

  try {
    const { id } = await context.params;
    const body = await request.json();

    const updated = await updateAdmin(id, {
      email: body.email,
      nome: body.nome,
      telefone: body.telefone,
      nivel: body.nivel,
    });

    if (body.senha) {
      const hashed = await bcrypt.hash(body.senha, 12);
      await updateAdminPassword(id, hashed);
    }

    if (!updated) {
      return NextResponse.json(
        { error: "Administrador não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar administrador:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar administrador" },
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
    const admin = await getAdminById(id);

    if (!admin) {
      return NextResponse.json(
        { error: "Administrador não encontrado" },
        { status: 404 },
      );
    }

    await deleteAdmin(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir administrador:", error);
    return NextResponse.json(
      { error: "Erro interno ao excluir administrador" },
      { status: 500 },
    );
  }
}
