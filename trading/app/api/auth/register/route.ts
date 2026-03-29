import { NextResponse } from "next/server";
import { userRepository } from "@/repositories/user.repository";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { sendPlatformPostback } from "@/lib/services/platform-postback";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Campos obrigatorios faltando." },
        { status: 400 },
      );
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "Email ja esta em uso." },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const cookieStore = await cookies();
    const aff = cookieStore.get("aff")?.value;

    const newUser = await userRepository.create({
      nome: name,
      email,
      senha: hashedPassword,
      affiliateId: aff || undefined,
    });

    await sendPlatformPostback("register", {
      userId: newUser.id,
      email: newUser.email,
      affiliateId: aff || null,
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 },
    );
  }
}
