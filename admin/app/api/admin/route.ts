import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/auth";
import { getAdmins, getAdminByEmail, createAdmin } from "@/db/queries";

export async function GET(_request: NextRequest) {
  const auth = await requireAdmin("SUPER_ADMIN");
  if (auth.error) return auth.error;

  try {
    const admins = await getAdmins();
    return NextResponse.json(admins);
  } catch (error) {
    console.error("Erro ao listar administradores:", error);
    return NextResponse.json(
      { error: "Erro interno ao listar administradores" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin("SUPER_ADMIN");
  if (auth.error) return auth.error;

  try {
    const body = await request.json();

    const existing = await getAdminByEmail(body.email);
    if (existing) {
      return NextResponse.json(
        { error: "Administrador com este email já existe." },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(body.senha, 12);

    const newAdmin = await createAdmin({
      email: body.email,
      senha: hashedPassword,
      nome: body.nome,
      telefone: body.telefone,
      nivel: body.nivel,
    });

    return NextResponse.json(newAdmin);
  } catch (error) {
    console.error("Erro ao criar administrador:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar administrador" },
      { status: 500 },
    );
  }
}
