import { prisma } from "@/lib/prisma";
import { balanceRepository } from "@/repositories/balance.repository";
import { ApiError } from "@/lib/errors";

/**
 * Service de Balance.
 * Centraliza todas as operacoes de saldo — rotas nao devem acessar prisma.balance diretamente.
 */
export const balanceService = {
  /**
   * Retorna saldo + dados do usuario para o frontend.
   */
  async getUserBalanceInfo(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        avatarUrl: true,
        email: true,
        nome: true,
        cpf: true,
        nacionalidade: true,
        documentoTipo: true,
        documentoNumero: true,
        telefone: true,
        dataNascimento: true,
        kyc: true,
        createdAt: true,
        balance: {
          select: { saldoDemo: true, saldoReal: true },
        },
      },
    });

    if (!user || !user.balance) {
      throw ApiError.notFound("Usuario ou saldo nao encontrado");
    }

    return {
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
    };
  },

  /**
   * Atualiza saldo (incrementa ou decrementa).
   */
  async updateBalance(
    userId: string,
    tipo: "demo" | "real",
    operacao: "increase" | "decrease",
    valor: number,
  ) {
    if (valor <= 0) {
      throw ApiError.badRequest("Valor invalido");
    }

    const balance = await balanceRepository.findByUserId(userId);
    if (!balance) {
      throw ApiError.notFound("Saldo nao encontrado");
    }

    const currentBalance =
      tipo === "demo" ? balance.saldoDemo : balance.saldoReal;
    const newBalance = Math.max(
      0,
      operacao === "increase"
        ? currentBalance + valor
        : currentBalance - valor,
    );

    const field = tipo === "demo" ? "saldoDemo" : "saldoReal";
    await prisma.balance.update({
      where: { userId },
      data: { [field]: newBalance },
    });

    return { tipo, saldo: newBalance };
  },

  /**
   * Reseta saldo demo para o valor padrao.
   */
  async resetDemoBalance(userId: string, defaultBalance = 10000) {
    const result = await balanceRepository.resetDemo(userId, defaultBalance);
    return { demoBalance: Number(result.saldoDemo) };
  },
};
