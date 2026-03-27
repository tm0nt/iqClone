import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";
import { getRuntimeConfig } from "@/lib/config/runtime-config";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "E-mail é obrigatório." },
        { status: 400 },
      );
    }

    // Always return success to not leak whether email exists
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const runtimeConfig = await getRuntimeConfig();
      const authSecret = runtimeConfig.authSecret;

      const secret = new TextEncoder().encode(authSecret);

      const token = await new SignJWT({
        userId: user.id,
        email: user.email,
        type: "password-reset",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(secret);

      const requestUrl = new URL(req.url);
      const baseUrl =
        runtimeConfig.urlSite.replace(/\/$/, "") || requestUrl.origin;

      const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

      // In production, integrate an email provider here.
      // For now, log the link so admin can share it manually.
      console.log(`[forgot-password] Reset link for ${email}: ${resetUrl}`);
    }

    return NextResponse.json({
      success: true,
      message:
        "Se este e-mail estiver cadastrado, você receberá um link de redefinição.",
    });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 },
    );
  }
}
