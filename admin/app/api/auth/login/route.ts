import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { getAdminByEmail } from "@/db/queries";
import { getSessionCookieOptions } from "@shared/auth/session-core";
import { getAdminRuntimeConfig } from "@/lib/runtime-config";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios." },
        { status: 400 },
      );
    }

    const user = await getAdminByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 400 },
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.senha);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Senha incorreta." },
        { status: 400 },
      );
    }

    const runtimeConfig = await getAdminRuntimeConfig();
    const token = await new SignJWT({ userId: user.id, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(new TextEncoder().encode(runtimeConfig.adminSessionSecret));

    const cookieStore = await cookies();
    cookieStore.set("session", token, getSessionCookieOptions());

    return NextResponse.json({ message: "Login bem-sucedido", user });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 },
    );
  }
}
