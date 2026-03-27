export interface AdminWithdrawal {
  id: string;
  status: string;
  tipo: string;
  valor: number;
  chave: string;
  tipoChave: string;
  email: string;
  dataPedido: string;
  dataPagamento: string | null;
  nomeCliente: string;
  user: {
    nome?: string | null;
    email?: string | null;
  } | null;
  taxa: number;
  idCliente: string;
  userId?: string;
}

export interface WithdrawalsResponse {
  withdrawals: AdminWithdrawal[];
  total: number;
  totalPaid: number;
  totalPending: number;
  totalPaidValue: number;
  totalPendingValue: number;
  totalValue: number;
}
