import { api } from "@/lib/api/client";
import { AFFILIATE_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  AffiliatePayment,
  AffiliateWithdrawalPayload,
} from "@/lib/types/account.types";

interface ListWithdrawalsParams {
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

interface CreateWithdrawalParams {
  valor: number;
  tipoChave: string;
  chave: string;
}

export const paymentsService = {
  async list(params: ListWithdrawalsParams = {}): Promise<AffiliatePayment[]> {
    const searchParams = new URLSearchParams({
      searchQuery: params.searchQuery ?? "",
      startDate: params.startDate ?? "",
      endDate: params.endDate ?? "",
      status: params.status ?? "",
    });

    const data = await api.get<AffiliateWithdrawalPayload>(
      AFFILIATE_ENDPOINTS.withdrawals.list(searchParams),
    );

    return data.withdrawals ?? [];
  },

  async create(params: CreateWithdrawalParams): Promise<void> {
    await api.post(AFFILIATE_ENDPOINTS.withdrawals.create, {
      valor: params.valor,
      tipoChave: params.tipoChave,
      chave: params.chave,
      tipo: "afiliado",
    });
  },
};
