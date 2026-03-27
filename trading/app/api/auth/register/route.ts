// app/api/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { sendPlatformPostback } from "@/lib/services/platform-postback";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando." },
        { status: 400 },
      );
    }

    // Verificando se o usuário já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email já está em uso." },
        { status: 400 },
      );
    }

    // Criando a senha criptografada
    const hashedPassword = await bcrypt.hash(password, 10);

    // Verificando o cookie 'aff' para associar o afiliado
    const cookieStore = await cookies();
    const aff = cookieStore.get("aff")?.value;

    // Criando o novo usuário, balance, afiliado e audit log
    const newUserData: any = {
      nome: name,
      name,
      email,
      senha: hashedPassword,
      emailVerified: null,
      cpf: null,
      nacionalidade: "Brasil",
      documentoTipo: null,
      documentoNumero: null,
      ddi: null,
      telefone: null,
      dataNascimento: null,
      avatarUrl: null,
      image: null,
      affiliateId: aff || undefined, // Associando o afiliado se presente
      balance: {
        create: {
          saldoDemo: 10000.0,
          saldoReal: 0.0,
        },
      },
      auditLogs: {
        create: {
          entidade: "User",
          entidadeId: "", // Vai ser atualizado com o id do usuário depois
          acao: "create",
          valoresAntigos: {},
          valoresNovos: {
            nome: name,
            email,
          },
        },
      },
      affiliate: {
        create: {
          tipoComissao: null,
        },
      },
    };

    const newUser = await prisma.user.create({
      data: newUserData,
      include: {
        auditLogs: true,
        affiliate: true,
      },
    });

    // Atualizando o audit log com o ID do usuário recém-criado
    await prisma.auditLog.update({
      where: { id: newUser.auditLogs[0].id },
      data: {
        entidadeId: newUser.id,
      },
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
