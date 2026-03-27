export interface AffiliateDashboardMetricsData {
  receitaTotal: number;
  usuariosAtivos: {
    totalUsuarios: number;
    crescimento: number;
  };
  conversoes: number;
  saldoDisponivel: number;
}

export interface AffiliateAccountData {
  saldoComissao: number;
  totalRecebido: number;
  pagamentosPendentes: number;
  taxa: number;
  tipoComissao: string | null;
  user: {
    userId: string;
    name: string;
    email: string;
    cpf: string | null;
  };
}

export interface AffiliateUser {
  id: string;
  nome: string;
  email: string;
  status: "active" | "inactive" | "pending";
  lastActive: string;
  createdAt: string;
}

export interface AffiliateUserAnalyticsMetrics {
  totalAffiliates: number;
  newAffiliates: number;
  activeUsers: number;
  churnRate: number;
  percentageChangeTotalAffiliates: number;
  percentageChangeNewAffiliates: number;
  percentageChangeChurnRate: number;
}

export interface AffiliateUserMetricsPoint {
  date: string;
  "Novos Usuários": number;
  "Usuários Ativos": number;
  Churn: number;
}

export interface AffiliatePayment {
  id: string;
  tipo: string;
  valor: number;
  status: "concluido" | "pendente" | "cancelado";
  metodo: string;
  dataPedido?: string;
}

export interface AffiliateWithdrawalPayload {
  withdrawals: AffiliatePayment[];
}

export interface AffiliateOfferApiPayload {
  tipoComissao: string | null;
  cpaMin?: number;
  cpaValor?: number;
  revShareFalsoValue?: number;
  revShareValue?: number;
  cliques: number;
  offerLink: string;
}

export interface AffiliateOfferRow {
  id: string;
  name: string;
  status: "active" | "inactive" | "pending";
  category: string;
  tipoComissao: string | null;
  cpaMin?: number;
  cpaValor?: number;
  revShareFalsoValue?: number;
  revShareValue?: number;
  cliques: number;
  offerLink: string;
}

export type AffiliateUserStatus = "active" | "inactive" | "pending";

export interface AffiliateAffiliateRow {
  id: string;
  name: string;
  email: string;
  status: AffiliateUserStatus;
  joinDate: string;
  conversions: number;
  earnings: number;
  commissionRate: number;
  avatar?: string;
}

export interface AffiliateStatisticsRow {
  date: string;
  uniqueVisitors: number;
  registrations: number;
  firstDeposits: number;
  revenue: number;
}
