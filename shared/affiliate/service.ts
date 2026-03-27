export type AffiliateCommissionType = "cpa" | "revShare";

export interface AffiliateConfigSnapshot {
  cpaMin: number;
  cpaValor: number;
  revShareFalsoValue: number;
  revShareNegativo: number | null;
  revShareValue: number;
  taxa: number;
  valorMinimoSaque: number;
  valorMinimoDeposito: number;
  urlSite?: string | null;
}

export function normalizeCommissionType(
  value: string | null | undefined,
): AffiliateCommissionType | null {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized === "cpa") return "cpa";
  if (normalized === "revshare") return "revShare";
  if (value === "revShare") return "revShare";
  return null;
}

export function isAffiliateCommissionType(
  value: string | null | undefined,
): value is AffiliateCommissionType {
  return normalizeCommissionType(value) !== null;
}

export function buildAffiliateOfferLink(
  urlSite: string | null | undefined,
  affiliateUserId: string,
): string {
  const base = (urlSite || "").replace(/\/+$/, "");
  return `${base}/auth?aff=${affiliateUserId}`;
}

export function calculateCPACommission(
  amount: number,
  config: Pick<AffiliateConfigSnapshot, "cpaMin" | "cpaValor">,
): number {
  return amount >= config.cpaMin ? config.cpaValor : 0;
}

export function calculateRevShareCommission(
  amount: number,
  config: Pick<AffiliateConfigSnapshot, "revShareValue">,
): number {
  return amount * (config.revShareValue / 100);
}

export function calculateNegativeRevShareCommission(
  amount: number,
  config: Pick<AffiliateConfigSnapshot, "revShareValue" | "revShareNegativo">,
): number {
  const rate =
    typeof config.revShareNegativo === "number"
      ? config.revShareNegativo
      : config.revShareValue;
  return amount * (rate / 100);
}

export function sumAffiliateCommissionValues(
  values: Array<number | null | undefined>,
): number {
  return values.reduce((total, value) => total + (value || 0), 0);
}

export function buildAffiliateOfferResponse(input: {
  tipoComissao: AffiliateCommissionType | null;
  config: AffiliateConfigSnapshot;
  clicks: number;
  affiliateUserId: string;
}) {
  const { tipoComissao, config, clicks, affiliateUserId } = input;

  const response = {
    tipoComissao,
    taxa: config.taxa,
    valorMinimoSaque: config.valorMinimoSaque,
    valorMinimoDeposito: config.valorMinimoDeposito,
    cliques: clicks,
    offerLink: buildAffiliateOfferLink(config.urlSite, affiliateUserId),
    cpaMin: undefined as number | undefined,
    cpaValor: undefined as number | undefined,
    revShareFalsoValue: undefined as number | undefined,
    revShareValue: undefined as number | undefined,
  };

  if (tipoComissao === "cpa") {
    response.cpaMin = config.cpaMin;
    response.cpaValor = config.cpaValor;
  }

  if (tipoComissao === "revShare") {
    response.revShareFalsoValue = config.revShareFalsoValue;
    response.revShareValue = config.revShareValue;
  }

  return response;
}

export function extractAffiliateConfigUpdate(input: Record<string, unknown>) {
  const result: Partial<AffiliateConfigSnapshot> = {};

  const numericFields = [
    "cpaMin",
    "cpaValor",
    "revShareFalsoValue",
    "revShareValue",
    "taxa",
    "valorMinimoSaque",
    "valorMinimoDeposito",
  ] as const;

  for (const field of numericFields) {
    if (input[field] !== undefined) {
      result[field] = Number(input[field]) as never;
    }
  }

  if (input.revShareNegativo !== undefined) {
    result.revShareNegativo =
      input.revShareNegativo === null || input.revShareNegativo === ""
        ? null
        : Number(input.revShareNegativo);
  }

  return result;
}
