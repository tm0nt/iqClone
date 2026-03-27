import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAdminById } from "@/db/queries";

export async function GET() {
  const auth = await requireAdmin(
    "SUPER_ADMIN",
    "ADMIN",
    "ASSISTANT_ADMIN",
  );
  if (auth.error) return auth.error;

  const admin = await getAdminById(auth.adminId);
  if (!admin) {
    return NextResponse.json(
      { error: "Admin não encontrado" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    id: admin.id,
    nome: admin.nome,
    email: admin.email,
    nivel: admin.nivel,
    telefone: admin.telefone ?? null,
  });
}
