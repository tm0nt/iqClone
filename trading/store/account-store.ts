import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AccountState {
  name: string | null;
  user: string | null;
  email: string | null;
  cpf: string | null;
  documentType: string | null;
  documentNumber: string | null;
  nationality: string | null;
  phone: string | null;
  birthdate: string | null;
  kycStatus: string | null;
  createdAt: string;
  profilePicture: string | null;
  demoBalance: number;
  realBalance: number;
  selectedAccount: "demo" | "real";
  activeOperations: Operation[];
  operationHistory: OperationResult[];
  currentPrices: Record<string, number>;

  setUser: (user: string) => void;
  setDemoBalance: (balance: number) => void;
  setRealBalance: (balance: number) => void;
  setSelectedAccount: (account: "demo" | "real") => void;
  addOperation: (operation: Operation) => void;
  syncActiveOperations: (operations: Operation[]) => void;
  removeOperation: (id: string) => void;
  addOperationResult: (result: OperationResult) => void;
  updateCurrentPrice: (symbol: string, price: number) => void;
  getCurrentBalance: () => number;
  syncBalances: () => Promise<void>;
  updateUserInfo: (data: Partial<AccountState>) => void;
}

export interface Operation {
  id: string;
  asset: string;
  type: "buy" | "sell";
  accountType?: "demo" | "real";
  value: number;
  entryTime: string;
  openedAt: number;
  timeframe: string;
  expiryTime: number;
  progress: number;
  entryPrice: number;
  expectedProfit: number;
}

export interface OperationResult {
  id: string;
  asset: string;
  type: "buy" | "sell";
  value: number;
  timeframe: string;
  entryTime: string;
  expiryTime: string;
  openPrice: string;
  closePrice: string;
  result: "win" | "loss";
  profit?: number;
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      name: null,
      user: null,
      email: null,
      cpf: null,
      documentType: null,
      documentNumber: null,
      nationality: null,
      phone: null,
      birthdate: null,
      kycStatus: null,
      createdAt: "0000-00-00",
      profilePicture: "",
      demoBalance: 0,
      realBalance: 0,
      selectedAccount: "demo",
      activeOperations: [],
      operationHistory: [],
      currentPrices: {},

      setUser: (user) => set({ user }),

      setDemoBalance: (balance) => set({ demoBalance: balance }),
      setRealBalance: (balance) => set({ realBalance: balance }),
      setSelectedAccount: (account) => set({ selectedAccount: account }),

      getCurrentBalance: () => {
        const { selectedAccount, demoBalance, realBalance } = get();
        return selectedAccount === "demo" ? demoBalance : realBalance;
      },

      addOperation: (operation) => {
        set((state) => ({
          activeOperations: [
            ...state.activeOperations.filter((op) => op.id !== operation.id),
            operation,
          ],
        }));
      },

      syncActiveOperations: (operations) => {
        set({
          activeOperations: operations.sort(
            (a, b) => a.expiryTime - b.expiryTime,
          ),
        });
      },

      removeOperation: (id) => {
        set((state) => ({
          activeOperations: state.activeOperations.filter((op) => op.id !== id),
        }));
      },

      addOperationResult: (result) => {
        set((state) => ({
          operationHistory: [
            result,
            ...state.operationHistory.filter((item) => item.id !== result.id),
          ].slice(0, 100),
        }));
      },

      updateCurrentPrice: (symbol, price) => {
        set((state) => ({
          currentPrices: {
            ...state.currentPrices,
            [symbol]: price,
          },
        }));
      },

      syncBalances: async () => {
        try {
          const res = await fetch("/api/account/balances", {
            credentials: "include",
          });
          if (!res.ok) return;
          const data = await res.json();
          set({
            demoBalance: data.demoBalance,
            realBalance: data.realBalance,
            user: data.userId,
            name: data.name,
            email: data.email,
            profilePicture: data.avatarUrl,
            createdAt: data.createdAt,
            cpf: data.cpf || null,
            documentType: data.documentType || null,
            documentNumber: data.documentNumber || null,
            nationality: data.nationality || null,
            phone: data.phone || null,
            birthdate: data.birthdate || null,
            kycStatus: data.kycStatus || null,
          });
        } catch (err) {
          console.error("Erro ao sincronizar saldos:", err);
        }
      },

      updateUserInfo: (data) => {
        set((state) => ({
          ...state,
          ...data,
        }));
      },
    }),
    {
      name: "account-storage",
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const cutoff = Date.now() - 5 * 60 * 1000;
        state.activeOperations = state.activeOperations.filter(
          (op) => op.expiryTime > cutoff,
        );
      },
      partialize: (state) => ({
        name: state.name,
        user: state.user,
        email: state.email,
        avatarUrl: state.profilePicture,
        demoBalance: state.demoBalance,
        realBalance: state.realBalance,
        selectedAccount: state.selectedAccount,
        activeOperations: state.activeOperations,
        createdAt: state.createdAt,
        cpf: state.cpf,
        documentType: state.documentType,
        documentNumber: state.documentNumber,
        nationality: state.nationality,
        phone: state.phone,
        birthdate: state.birthdate,
        kycStatus: state.kycStatus,
      }),
    },
  ),
);
