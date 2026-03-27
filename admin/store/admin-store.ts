import { create } from "zustand";
import { persist } from "zustand/middleware";

type AdminNivel = "SUPER_ADMIN" | "ADMIN" | "ASSISTANT_ADMIN";

interface AdminState {
  id: string | null;
  nome: string | null;
  email: string | null;
  nivel: AdminNivel | null;
  telefone: string | null;

  fetchAdmin: () => Promise<void>;
  updateAdminInfo: (data: Partial<Omit<AdminState, "fetchAdmin" | "updateAdminInfo">>) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      id: null,
      nome: null,
      email: null,
      nivel: null,
      telefone: null,

      fetchAdmin: async () => {
        try {
          const res = await fetch("/api/auth/me", { credentials: "include" });
          if (!res.ok) return;
          const data = await res.json();
          set({
            id: data.id,
            nome: data.nome,
            email: data.email,
            nivel: data.nivel,
            telefone: data.telefone,
          });
        } catch (err) {
          console.error("Erro ao sincronizar dados do admin:", err);
        }
      },

      updateAdminInfo: (data) => {
        set((state) => ({ ...state, ...data }));
      },
    }),
    {
      name: "admin-storage",
      partialize: (state) => ({
        id: state.id,
        nome: state.nome,
        email: state.email,
        nivel: state.nivel,
        telefone: state.telefone,
      }),
    },
  ),
);
