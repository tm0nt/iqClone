"use client";

interface TradingActiveOperationsStripProps {
  operationCount: number;
  remainingLabel: string;
  totalInvested: string;
  expectedProfit: string;
  sellPnL: string;
  sellPnLPositive: boolean;
  isSelling: boolean;
  onSell: () => void;
  t: (key: string) => string;
}

export function TradingActiveOperationsStrip({
  operationCount,
  remainingLabel,
  totalInvested,
  expectedProfit,
  sellPnL,
  sellPnLPositive,
  isSelling,
  onSell,
  t,
}: TradingActiveOperationsStripProps) {
  return (
    <div
      className="absolute left-0 top-0 z-20 hidden border-b border-r border-white/10 bg-black/80 px-5 py-2.5 backdrop-blur-sm md:flex md:items-center md:gap-5"
      style={{ borderBottomRightRadius: "0.75rem" }}
    >
      {/* Tempo restante */}
      <div className="text-[15px] font-semibold tabular-nums text-white">
        {remainingLabel}
      </div>

      <div className="h-4 w-px bg-white/20" />

      {/* Total investido */}
      <div className="text-[15px] font-semibold text-white">
        {totalInvested}
      </div>

      <div className="h-4 w-px bg-white/20" />

      {/* Lucro esperado */}
      <div
        className="text-[15px] font-semibold"
        style={{ color: "var(--platform-success-color)" }}
      >
        {expectedProfit}
      </div>

      <div className="h-4 w-px bg-white/20" />

      {/* L/P */}
      <div
        className="text-[15px] font-semibold"
        style={{
          color: sellPnLPositive
            ? "var(--platform-success-color)"
            : "var(--platform-danger-color)",
        }}
      >
        {sellPnL}
      </div>

      {/* Botão vender */}
      <button
        onClick={onSell}
        disabled={isSelling}
        className="ml-1 rounded-md bg-white/12 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSelling
          ? t("selling")
          : operationCount > 1
            ? `${t("sell")} (${operationCount})`
            : t("sell")}
      </button>
    </div>
  );
}
