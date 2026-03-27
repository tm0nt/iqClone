export interface AdminClient {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string | null;
  birthDate: string | null;
  documentType: string | null;
  documentNumber: string | null;
  realBalance: number;
  demoBalance: number;
  commissionBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  registrationDate: string;
}

export type RawClient = {
  id: string;
  nome: string;
  email: string;
  cpf?: string | null;
  telefone?: string | null;
  dataNascimento?: string | null;
  documentoTipo?: string | null;
  documentoNumero?: string | null;
  saldoReal?: number | null;
  saldoDemo?: number | null;
  saldoComissao?: number | null;
  totalDepositado?: number | null;
  totalSacado?: number | null;
  createdAt: string;
};
