// =================== Domínio: User ===================
export interface UserProfile {
  id: string;
  email: string;
  nome: string;
  cpf: string | null;
  nacionalidade: string | null;
  documentoTipo: string | null;
  documentoNumero: string | null;
  ddi: string | null;
  telefone: string | null;
  dataNascimento: Date | null;
  avatarUrl: string | null;
  kyc: string | null;
}

// =================== Domínio: Balance ===================
export interface BalanceData {
  saldoDemo: number;
  saldoReal: number;
  saldoComissao: number;
}

// =================== Domínio: Trade ===================
export interface CreateOperationInput {
  userId: string;
  tipo: string;
  ativo: string;
  tempo: string;
  previsao: string;
  vela: string;
  abertura: number;
  valor: number;
  receita?: number;
  expiresAt?: Date;
}

export interface OperationResult {
  id: string;
  resultado: "ganho" | "perda";
  fechamento: number;
  receita: number;
}

// =================== Domínio: Deposit ===================
export interface DepositInput {
  userId: string;
  method: "pix" | "credit" | "crypto";
  amount: number;
  name: string;
  cpf: string;
  email: string;
}

// =================== Domínio: Withdrawal ===================
export interface WithdrawalInput {
  userId: string;
  valor: number;
  tipoChave: string;
  chave: string;
}

// =================== Domínio: Chart ===================
export interface CandleData {
  Date: number;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
}

export type ChartType = "line" | "candlestick" | "ohlc";

export type TimeframeUnit = "minute" | "hour" | "day" | "week";

export interface TimeframeConfig {
  timeUnit: TimeframeUnit;
  count: number;
}

export interface ChartColors {
  background: string;
  panel: string;
  grid: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  candle: { up: string; down: string };
  volume: { up: string; down: string };
  accent: string;
  success: string;
  danger: string;
}

// =================== Domínio: Auth ===================
export interface LoginInput {
  email: string;
  senha: string;
}

export interface RegisterInput {
  nome: string;
  email: string;
  senha: string;
  affiliateId?: string;
}

// =================== Domínio: KYC ===================
export interface KYCUploadInput {
  userId: string;
  type: "CNH" | "RG" | "PASSAPORTE";
  files: {
    front: File;
    back?: File;
    selfie?: File;
  };
}

// =================== API Response ===================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
