import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AccountState {
  name: string | null;
  user: string | null;
  email: string | null;
  cpf: string | null;
  taxa: number;
  saldoComissao: number;
  tipoComissao: any;
  totalRecebido: number;
  pagamentosPendentes: number;

  fetchAffiliate: () => Promise<void>;
  updateUserInfo: (data: Partial<AccountState>) => void;
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      name: null,
      user: null,
      email: null,
      taxa: 0,
      tipoComissao: null,
      cpf: null,
      saldoComissao: 0,
      totalRecebido: 0,
      pagamentosPendentes: 0,

      // Função para sincronizar dados da API
      fetchAffiliate: async () => {
        try {
          const res = await fetch("/api/account", {
            credentials: "include",
          });
          if (!res.ok) return;

          const data = await res.json();

          // Atualizando estado com os dados recebidos da API
          set({
            saldoComissao: data.saldoComissao,
            totalRecebido: data.totalRecebido,  // Atualizando total recebido
            pagamentosPendentes: data.pagamentosPendentes,  // Atualizando pagamentos pendentes
            user: data.user.userId,
            tipoComissao: data.tipoComissao,
            name: data.user.name,
            taxa: data.taxa,
            email: data.user.email,
            cpf: data.user.cpf || null,
          });
        } catch (err) {
          console.error("Erro ao sincronizar saldos:", err);
        }
      },

      // Função para atualizar as informações do usuário
      updateUserInfo: (data) => {
        set((state) => ({
          ...state,
          ...data,
        }));
      },
    }),
    {
      name: "account-storage", // Nome da chave de persistência
      partialize: (state) => ({
        name: state.name,
        user: state.user,
        taxa: state.taxa,
        tipoComissao: state.tipoComissao,
        saldoComissao: state.saldoComissao,
        totalRecebido: state.totalRecebido,  // Persistindo totalRecebido
        pagamentosPendentes: state.pagamentosPendentes,  // Persistindo pagamentosPendentes
        cpf: state.cpf,
      }), // Salva somente o que for necessário
    }
  )
);
