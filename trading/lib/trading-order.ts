import type { Operation } from "@/store/account-store";

export const BUTTON_DISABLE_THRESHOLD = 5;
export const MIN_PERCENTAGE = 5;
export const QUICK_AMOUNTS = [50, 100, 150, 200] as const;
export const DEFAULT_TIME_INTERVALS = [1, 5, 10, 15, 30, 60, 1440] as const;
export const SECONDS_IN_DAY = 86400;

export type TradeType = "buy" | "sell";
export type TimeInterval = number;

interface CreateTradeDraftParams {
  asset: string;
  type: TradeType;
  value: number;
  timeValue: TimeInterval;
  payoutRate: number;
  price: number;
  now?: Date;
}

interface BuildTradeOperationPayloadParams {
  selectedAccount: "demo" | "real";
  tradingPair: string;
  type: TradeType;
  timeValue: TimeInterval;
  entryPrice: number;
  value: number;
  expiryTime: number;
}

export function sanitizeExpirationOptions(
  expirationOptions: readonly number[],
): number[] {
  const sanitized = expirationOptions
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);

  return sanitized.length > 0
    ? [...new Set(sanitized)].sort((a, b) => a - b)
    : [...DEFAULT_TIME_INTERVALS];
}

export function resolveSafeExpirationValue(
  options: readonly number[],
  defaultExpirationMinutes: number,
  fallback: number,
): number {
  if (options.includes(defaultExpirationMinutes)) {
    return defaultExpirationMinutes;
  }

  return options[0] ?? fallback;
}

export function getAccountBalance(
  selectedAccount: "demo" | "real",
  realBalance: number,
  demoBalance: number,
): number {
  return selectedAccount === "real" ? realBalance : demoBalance;
}

export function normalizeTradeAmountStepUp(amount: number): number {
  if (amount < 10) return 10;
  return Math.floor(amount / 10) * 10 + 10;
}

export function normalizeTradeAmountStepDown(amount: number): number {
  if (amount <= 10) return 1;
  return Math.ceil((amount - 10) / 10) * 10;
}

export function formatTradeExpirationLabel(minutes: number): string {
  return minutes === 1440 ? "1d" : `${minutes}m`;
}

export function calculateSecondsUntilNextInterval(
  intervalMinutes: number,
  now = new Date(),
): number {
  if (intervalMinutes === 1440) {
    const tomorrow = new Date(now);
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return Math.floor((tomorrow.getTime() - now.getTime()) / 1000);
  }

  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
  const nextIntervalMinutes =
    (Math.floor(currentTotalMinutes / intervalMinutes) + 1) * intervalMinutes;
  const nextIntervalTime = new Date(now);
  nextIntervalTime.setHours(Math.floor(nextIntervalMinutes / 60));
  nextIntervalTime.setMinutes(nextIntervalMinutes % 60);
  nextIntervalTime.setSeconds(0);
  nextIntervalTime.setMilliseconds(0);

  return Math.round((nextIntervalTime.getTime() - now.getTime()) / 1000);
}

export function createTradeDraft({
  asset,
  type,
  value,
  timeValue,
  payoutRate,
  price,
  now = new Date(),
}: CreateTradeDraftParams): Operation {
  return {
    id: Date.now().toString(),
    asset,
    type,
    value,
    entryTime: now.toLocaleString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    openedAt: now.getTime(),
    timeframe: formatTradeExpirationLabel(timeValue),
    expiryTime: now.getTime() + timeValue * 60 * 1000,
    progress: 100,
    entryPrice: price,
    expectedProfit: value * payoutRate,
  };
}

export function buildTradeOperationPayload({
  selectedAccount,
  tradingPair,
  type,
  timeValue,
  entryPrice,
  value,
  expiryTime,
}: BuildTradeOperationPayloadParams) {
  return {
    balance: selectedAccount,
    tipo: selectedAccount,
    data: new Date(),
    ativo: tradingPair,
    tempo: formatTradeExpirationLabel(timeValue),
    previsao: type === "buy" ? "call" : "put",
    vela: type === "buy" ? "green" : "red",
    abertura: entryPrice,
    valor: value,
    expiresAt: new Date(expiryTime).toISOString(),
  };
}
