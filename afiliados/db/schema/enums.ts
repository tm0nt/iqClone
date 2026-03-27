import { pgEnum } from "drizzle-orm/pg-core";

export const platformEnum = pgEnum("Platform", [
  "GOOGLE",
  "TIKTOK",
  "FACEBOOK",
  "KWAI",
  "CUSTOM",
]);

export const gatewayTypeEnum = pgEnum("GatewayType", [
  "credit",
  "pix",
  "crypto",
]);

export const tradingPairTypeEnum = pgEnum("TradingPairType", [
  "forex",
  "crypto",
]);

export const statusEnum = pgEnum("Status", ["ACTIVE", "INACTIVE"]);

export const kycStatusEnum = pgEnum("KYCStatus", [
  "APPROVED",
  "PENDING",
  "REJECT",
]);

export const kycTypeEnum = pgEnum("KYCType", ["CNH", "RG", "PASSAPORTE"]);

export const dispatchStatusEnum = pgEnum("DispatchStatus", [
  "SUCCESS",
  "FAILED",
  "PENDING",
]);

export const tipoComissaoEnum = pgEnum("TipoComissao", ["cpa", "revShare"]);

export const withdrawalStatusEnum = pgEnum("WithdrawalStatus", [
  "concluido",
  "pendente",
  "cancelado",
  "processando",
]);

export const withdrawalTipoEnum = pgEnum("WithdrawalTipo", [
  "afiliado",
  "usuario",
]);

export const depositStatusEnum = pgEnum("DepositStatus", [
  "concluido",
  "pendente",
  "cancelado",
  "processando",
]);

export const commissionStatusEnum = pgEnum("CommissionStatus", [
  "pendente",
  "paga",
  "cancelada",
]);

export const resultadoEnum = pgEnum("Resultado", [
  "ganho",
  "perda",
  "pendente",
]);

export const settlementJobStatusEnum = pgEnum("SettlementJobStatus", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const roleEnum = pgEnum("Role", [
  "SUPER_ADMIN",
  "ADMIN",
  "ASSISTANT_ADMIN",
]);

export const acaoAuditoriaEnum = pgEnum("AcaoAuditoria", [
  "create",
  "update",
  "delete",
]);
