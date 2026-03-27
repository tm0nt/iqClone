import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const nome = body.nome ?? body.name;
    const cpf = body.cpf ?? body.ssn;
    const telefone = body.telefone ?? body.phone;
    const dataNascimento = body.dataNascimento ?? body.birthDate;
    const documentoTipo = body.documentoTipo ?? body.documentType;
    const documentoNumero = body.documentoNumero ?? body.documentNumber;
    const nacionalidade = body.nacionalidade ?? body.nationality;
    const ddi = body.ddi ?? body.countryCode;

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        nome,
        cpf,
        email: body.email,
        telefone,
        dataNascimento: dataNascimento
          ? new Date(dataNascimento)
          : undefined,
        documentoTipo,
        documentoNumero,
        nacionalidade,
        ddi,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Erro ao atualizar dados:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
