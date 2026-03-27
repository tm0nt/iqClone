// =================== Admin ===================
export interface AdminUser {
  id: string;
  email: string;
  nome: string;
  nivel: "SUPER_ADMIN" | "ADMIN" | "ASSISTANT_ADMIN";
  telefone?: string | null;
  dataCriacao?: Date;
}

// =================== Client ===================
export interface ClientOverview {
  id: string;
  email: string;
  nome: string;
  cpf: string | null;
  telefone: string | null;
  kyc: string | null;
  createdAt: Date;
  balance: {
    saldoReal: number;
    saldoDemo: number;
  } | null;
}

// =================== Withdrawal ===================
export interface WithdrawalDetail {
  id: string;
  userId: string;
  valor: number;
  taxa: number;
  status: string;
  tipoChave: string;
  chave: string;
  tipo: string;
  dataPedido: Date;
  dataPagamento: Date | null;
  user: {
    nome: string;
    email: string;
  };
}

// =================== Dashboard Stats ===================
export interface DashboardStats {
  totalClientes: number;
  totalDepositoValor: number;
  totalSaquesComTaxa: number;
  totalSaquesPendentes: number;
  saquesPendentesCount: number;
  crescimentoClientes: number;
}

// =================== API Response ===================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
