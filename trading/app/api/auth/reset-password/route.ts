import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { getRuntimeConfig } from "@/lib/config/runtime-config";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token e nova senha são obrigatórios." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 8 caracteres." },
        { status: 400 },
      );
    }

    const { authSecret } = await getRuntimeConfig();
    if (!authSecret) {
      return NextResponse.json(
        { error: "Autenticação indisponível no momento." },
        { status: 500 },
      );
    }

    const secret = new TextEncoder().encode(authSecret);

    let payload: any;
    try {
      const result = await jwtVerify(token, secret);
      payload = result.payload;
    } catch {
      return NextResponse.json(
        { error: "Link inválido ou expirado." },
        { status: 400 },
      );
    }

    if (payload.type !== "password-reset" || !payload.userId) {
      return NextResponse.json(
        { error: "Token inválido." },
        { status: 400 },
      );
    }

    const hashed = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: payload.userId as string },
      data: { senha: hashed },
    });

    return NextResponse.json({
      success: true,
      message: "Senha redefinida com sucesso.",
    });
  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 },
    );
  }
}
