import { format } from "date-fns";
import { api } from "@/lib/api/client";
import { ADMIN_ENDPOINTS } from "@/lib/api/endpoints";
import type { AdminClient, RawClient } from "@/lib/types/clients.types";

const mapClient = (user: RawClient): AdminClient => ({
  id: user.id,
  name: user.nome,
  email: user.email,
  cpf: user.cpf ?? "",
  phone: user.telefone ?? "",
  birthDate: user.dataNascimento
    ? format(new Date(user.dataNascimento), "dd/MM/yyyy")
    : "",
  documentType: user.documentoTipo ?? "",
  documentNumber: user.documentoNumero ?? "",
  realBalance: user.saldoReal ?? 0,
  demoBalance: user.saldoDemo ?? 0,
  commissionBalance: user.saldoComissao ?? 0,
  totalDeposited: user.totalDepositado ?? 0,
  totalWithdrawn: user.totalSacado ?? 0,
  registrationDate: format(new Date(user.createdAt), "dd/MM/yyyy"),
});

export const clientsService = {
  async list(
    page: number,
    limit: number,
  ): Promise<{ clients: AdminClient[]; total: number }> {
    const data = await api.get<{ clients: RawClient[]; total: number }>(
      ADMIN_ENDPOINTS.clients.list(page, limit),
    );
    return { clients: data.clients.map(mapClient), total: data.total };
  },

  async getById(userId: string): Promise<AdminClient> {
    const data = await api.get<AdminClient & { birthDate?: string }>(
      ADMIN_ENDPOINTS.clients.search(userId),
    );
    return {
      ...data,
      birthDate: data.birthDate
        ? format(new Date(data.birthDate), "yyyy-MM-dd")
        : "",
    };
  },

  async update(client: Partial<AdminClient>): Promise<void> {
    await api.put(ADMIN_ENDPOINTS.clients.update, {
      userId: client.id,
      nome: client.name,
      email: client.email,
      cpf: client.cpf,
      telefone: client.phone ?? "",
      dataNascimento: client.birthDate,
      documentoTipo: client.documentType ?? "",
      documentoNumero: client.documentNumber ?? "",
      saldoReal: Number(client.realBalance),
      saldoDemo: Number(client.demoBalance),
      saldoComissao: Number(client.commissionBalance),
    });
  },

  async delete(userId: string): Promise<void> {
    await api.delete(ADMIN_ENDPOINTS.clients.delete, { userId });
  },
};
