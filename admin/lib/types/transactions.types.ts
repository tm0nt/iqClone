export type TransactionStatus =
  | "pendente"
  | "processando"
  | "concluido"
  | "cancelado";

export type TransactionType = "deposit" | "withdrawal";

type DepositType = "pix" | "boleto" | "ted" | "cartao";
type WithdrawalType = "usuario" | "afiliado";
type PixKeyType = "cpf" | "cnpj" | "email" | "telefone" | "aleatoria";

export interface AdminTransaction {
  id: string;
  transactionId?: string;
  type: TransactionType;
  status: TransactionStatus;
  tipo: DepositType | WithdrawalType;
  valor: number;
  data: string;
  dataPagamento: string | null;
  email: string;
  nomeCliente: string;
  idCliente: string;
  chave?: string;
  tipoChave?: PixKeyType;
}

interface TransactionTotals {
  total: number;
  totalProcessing: number;
  totalCompleted: number;
  totalPending: number;
  totalCanceled: number;
  totalProcessingValue: number;
  totalCompletedValue: number;
  totalPendingValue: number;
  totalCanceledValue: number;
  totalValue: number;
}

export interface AdminTransactionsResponse {
  deposits: AdminTransaction[];
  withdrawals: AdminTransaction[];
  totals: {
    deposits: TransactionTotals | null;
    withdrawals: TransactionTotals | null;
  };
  startDate: string;
  endDate: string;
}
