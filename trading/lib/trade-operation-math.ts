export type TradeOperationDirection = "buy" | "sell";

interface TradeOperationLike {
  openedAt: number;
  expiryTime: number;
}

interface LiveOperationInput {
  type: TradeOperationDirection;
  value: number;
  entryPrice: number;
  expectedProfit: number;
  livePrice: number;
}

interface RealizedOperationInput {
  value: number;
  revenue: number;
  result: string | null | undefined;
}

export function getOperationRemainingMs(
  operation: TradeOperationLike,
  now = Date.now(),
) {
  return Math.max(operation.expiryTime - now, 0);
}

export function getOperationRemainingPercent(
  operation: TradeOperationLike,
  now = Date.now(),
) {
  const totalDuration = Math.max(operation.expiryTime - operation.openedAt, 1);
  return Math.max(
    0,
    Math.min(100, (getOperationRemainingMs(operation, now) / totalDuration) * 100),
  );
}

export function calculateLiveOperationPnl({
  type,
  value,
  entryPrice,
  livePrice,
}: Pick<LiveOperationInput, "type" | "value" | "entryPrice" | "livePrice">) {
  if (!Number.isFinite(entryPrice) || entryPrice <= 0) {
    return 0;
  }

  const directionMultiplier = type === "buy" ? 1 : -1;
  return directionMultiplier * ((livePrice - entryPrice) / entryPrice) * value;
}

export function calculateLiveOperationSellSnapshot(input: LiveOperationInput) {
  const rawPnl = calculateLiveOperationPnl(input);
  const maxExitValue = Math.max(0, input.value + Math.max(input.expectedProfit, 0));
  const exitValue = Math.max(0, Math.min(maxExitValue, input.value + rawPnl));
  const pnl = exitValue - input.value;

  return {
    rawPnl,
    exitValue,
    pnl,
    pnlPercent: input.value > 0 ? (pnl / input.value) * 100 : 0,
  };
}

export function getRealizedOperationPnl({
  value,
  revenue,
  result,
}: RealizedOperationInput) {
  const normalized = `${result ?? ""}`.toLowerCase();

  if (normalized === "ganho" || normalized === "win") {
    return revenue;
  }

  if (normalized === "perda" || normalized === "loss") {
    return revenue < 0 ? revenue : -value;
  }

  return 0;
}
