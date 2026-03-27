// /lib/services/account-service.ts

export const accountService = {
  async getBalances() {
    const res = await fetch("/api/account/balances", { method: "GET" });
    if (!res.ok) throw new Error("Erro ao buscar saldos");
    return res.json();
  },

  async reloadDemoAccount() {
    const res = await fetch("/api/account/reload-demo", { method: "POST" });
    if (!res.ok) throw new Error("Erro ao recarregar conta demo");
    const data = await res.json();
    return data.demoBalance;
  },
};
