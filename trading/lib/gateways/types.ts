export interface GatewayHandlerParams {
  amount: number;
  name: string;
  cpf: string;
  email: string;
  method: "pix" | "credit" | "crypto";
  idGateway: number;
  gateway?: {
    id: number;
    name: string;
    provider?: string;
    tokenPrivado?: string;
    tokenPublico?: string;
    endpoint?: string;
    split?: string | null;
    splitValue?: number | null;
    isActive?: boolean;
    sortOrder?: number | null;
  };

  // Permite campos adicionais (como `card`, `pix`, etc)
  [key: string]: any;
}
