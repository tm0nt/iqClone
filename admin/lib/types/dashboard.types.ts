export interface AdminGeneralDashboardData {
  totalDepositoValor: number;
  totalSaquesComTaxa: number;
  crescimentoClientes: number;
  saquesPendentesCount: number;
  totalSaquesPendentes: number;
  totalClientes: number;
}

export interface AdminDashboardMetrics {
  totalDeposits: number;
  totalWithdrawals: number;
  netRevenue: number;
  clientGrowth: number;
  pendingCount: number;
  pendingValue: number;
  totalClients: number;
  conversionRate: number | null;
}

export interface AdminFinancialChartPoint {
  name: string;
  depositos: number;
  saques: number;
}

export type AdminFinancialInterval = "3m" | "6m" | "12m";

export const ADMIN_FINANCIAL_INTERVALS: Array<{
  label: string;
  value: AdminFinancialInterval;
  months: number;
}> = [
  { label: "3M", value: "3m", months: 3 },
  { label: "6M", value: "6m", months: 6 },
  { label: "12M", value: "12m", months: 12 },
];
