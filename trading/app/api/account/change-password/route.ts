import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs"; // Para verificar e criptografar a senha
import { requireAuth } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;
    const userId = session.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "ID de usuário não encontrado" },
        { status: 400 },
      );
    }

    // Extrair os dados enviados pela requisição
    const { currentPassword, newPassword, confirmNewPassword } =
      await request.json();

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 },
      );
    }

    // Verificar se a nova senha e a confirmação são iguais
    if (newPassword !== confirmNewPassword) {
      return NextResponse.json(
        { error: "As senhas não coincidem" },
        { status: 400 },
      );
    }

    // Buscar o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    // Verificar se a senha atual é válida
    if (!user.senha) {
      return NextResponse.json(
        { error: "Esta conta foi criada com login social. Defina uma senha via recuperação de senha." },
        { status: 400 },
      );
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.senha);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Senha atual incorreta" },
        { status: 400 },
      );
    }

    // Criptografar a nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar a senha no banco de dados
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        senha: hashedPassword,
      },
    });

    return NextResponse.json({
      message: "Senha alterada com sucesso",
      userId: updatedUser.id,
      email: updatedUser.email,
    });
  } catch (error) {
    console.error("Erro ao processar a requisição:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
