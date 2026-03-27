export const DEFAULT_TRADING_EXPIRY_OPTIONS = [
  1,
  5,
  10,
  15,
  30,
  60,
  1440,
] as const;

export const DEFAULT_TRADING_RUNTIME_RULES = {
  minPriceVariation: 0,
  settlementTolerance: 0,
  defaultExpiryMinutes: 5,
  expiryOptions: [...DEFAULT_TRADING_EXPIRY_OPTIONS],
  settlementGraceSeconds: 2,
} as const;

export type TradingRuntimeRules = {
  minPriceVariation: number;
  settlementTolerance: number;
  defaultExpiryMinutes: number;
  expiryOptions: number[];
  settlementGraceSeconds: number;
};

type TradingRulesInput = Partial<{
  tradingMinPriceVariation: number | null;
  tradingSettlementTolerance: number | null;
  tradingDefaultExpiryMinutes: number | null;
  tradingExpiryOptions: string | null;
  tradingSettlementGraceSeconds: number | null;
}>;

export function parseTradingExpiryOptions(raw?: string | null) {
  const parsed = (raw ?? "")
    .split(",")
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => Number.isFinite(value) && value > 0);

  const uniqueSorted = [...new Set(parsed)].sort((a, b) => a - b);

  return uniqueSorted.length > 0
    ? uniqueSorted
    : [...DEFAULT_TRADING_EXPIRY_OPTIONS];
}

export function normalizeTradingRuntimeRules(
  input?: TradingRulesInput | null,
): TradingRuntimeRules {
  const expiryOptions = parseTradingExpiryOptions(input?.tradingExpiryOptions);
  const configuredDefault = Number(input?.tradingDefaultExpiryMinutes);
  const safeDefault = Number.isFinite(configuredDefault) && configuredDefault > 0
    ? Math.round(configuredDefault)
    : DEFAULT_TRADING_RUNTIME_RULES.defaultExpiryMinutes;

  return {
    minPriceVariation: Math.max(
      0,
      Number(input?.tradingMinPriceVariation) || 0,
    ),
    settlementTolerance: Math.max(
      0,
      Number(input?.tradingSettlementTolerance) || 0,
    ),
    defaultExpiryMinutes: expiryOptions.includes(safeDefault)
      ? safeDefault
      : expiryOptions[0] ?? DEFAULT_TRADING_RUNTIME_RULES.defaultExpiryMinutes,
    expiryOptions,
    settlementGraceSeconds: Math.max(
      0,
      Math.round(
        Number(input?.tradingSettlementGraceSeconds) ||
          DEFAULT_TRADING_RUNTIME_RULES.settlementGraceSeconds,
      ),
    ),
  };
}

export function tempoToMinutes(
  tempo: string,
  fallbackMinutes: number = DEFAULT_TRADING_RUNTIME_RULES.defaultExpiryMinutes,
) {
  const match = tempo.trim().match(/^(\d+)(m|h|d)$/i);

  if (!match) {
    return fallbackMinutes;
  }

  const amount = Number.parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  if (!Number.isFinite(amount) || amount <= 0) {
    return fallbackMinutes;
  }

  switch (unit) {
    case "m":
      return amount;
    case "h":
      return amount * 60;
    case "d":
      return amount * 1440;
    default:
      return fallbackMinutes;
  }
}

export function minutesToTempo(minutes: number) {
  if (minutes >= 1440 && minutes % 1440 === 0) {
    return `${minutes / 1440}d`;
  }

  if (minutes >= 60 && minutes % 60 === 0) {
    return `${minutes / 60}h`;
  }

  return `${minutes}m`;
}

export function computeExpiresAtFromMinutes(
  minutes: number,
  fromDate = new Date(),
) {
  return new Date(fromDate.getTime() + minutes * 60_000);
}

export function resolveTradeOutcome(input: {
  previsao: string;
  abertura: number;
  fechamento: number;
  minPriceVariation?: number;
  settlementTolerance?: number;
}) {
  const priceDelta = input.fechamento - input.abertura;
  const directionMultiplier = input.previsao === "call" ? 1 : -1;
  const directionalDelta = priceDelta * directionMultiplier;
  const requiredMove =
    Math.max(0, input.minPriceVariation ?? 0) +
    Math.max(0, input.settlementTolerance ?? 0);

  return {
    priceDelta,
    directionalDelta,
    requiredMove,
    didWin:
      directionalDelta > 0 &&
      directionalDelta >= requiredMove,
  };
}
