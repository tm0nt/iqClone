import { prisma } from "@/lib/prisma";
import type { UserProfile } from "@/types";

/**
 * Repository para operações de User no banco de dados.
 * Centraliza todas as queries Prisma — nunca chame prisma.user diretamente fora daqui.
 */
export const userRepository = {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nome: true,
        cpf: true,
        nacionalidade: true,
        documentoTipo: true,
        documentoNumero: true,
        ddi: true,
        telefone: true,
        dataNascimento: true,
        avatarUrl: true,
        kyc: true,
      },
    });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        nome: true,
        senha: true,
        cpf: true,
        avatarUrl: true,
      },
    });
  },

  async create(data: {
    nome: string;
    email: string;
    senha: string;
    affiliateId?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          nome: data.nome,
          email: data.email,
          senha: data.senha,
          affiliateId: data.affiliateId || undefined,
        },
        select: { id: true, email: true, nome: true },
      });

      await tx.balance.create({
        data: {
          userId: user.id,
          saldoDemo: 10000,
          saldoReal: 0,
          saldoComissao: 0,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          entidade: "User",
          entidadeId: user.id,
          acao: "create",
          valoresNovos: { nome: data.nome, email: data.email },
        },
      });

      await tx.affiliate.create({
        data: {
          userId: user.id,
          tipoComissao: null,
        },
      });

      return user;
    });
  },

  async updateProfile(
    userId: string,
    data: Partial<
      Pick<
        UserProfile,
        | "nome"
        | "cpf"
        | "email"
        | "telefone"
        | "dataNascimento"
        | "documentoTipo"
        | "documentoNumero"
        | "nacionalidade"
        | "ddi"
      >
    >,
  ) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
      },
    });
  },

  async updatePassword(userId: string, hashedPassword: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { senha: hashedPassword },
      select: { id: true },
    });
  },

  async updateAvatar(userId: string, avatarUrl: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: { id: true, avatarUrl: true },
    });
  },
};
