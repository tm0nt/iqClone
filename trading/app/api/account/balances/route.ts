import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    // Buscar os dados do usuário e o saldo
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        balance: true,
      },
    });

    if (!user || !user.balance) {
      return NextResponse.json(
        { error: "Usuário ou saldo não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      userId: user.id,
      avatarUrl: user.avatarUrl,
      email: user.email,
      name: user.nome,
      cpf: user.cpf,
      nationality: user.nacionalidade,
      documentType: user.documentoTipo,
      documentNumber: user.documentoNumero,
      phone: user.telefone,
      birthdate: user.dataNascimento,
      kycStatus: user.kyc,
      createdAt: user.createdAt,
      demoBalance: Number(user.balance.saldoDemo),
      realBalance: Number(user.balance.saldoReal),
    });
  } catch (error) {
    console.error("Erro ao processar a requisição:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
