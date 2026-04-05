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
    <>
      {/* Desktop: full strip */}
      <div
        className="absolute left-0 top-0 z-20 hidden border-b border-r border-white/10 bg-black/80 px-5 py-2.5 backdrop-blur-sm md:flex md:items-center md:gap-5"
        style={{ borderBottomRightRadius: "0.75rem" }}
      >
        <div className="text-[15px] font-semibold tabular-nums text-white">
          {remainingLabel}
        </div>

        <div className="h-4 w-px bg-white/20" />

        <div className="text-[15px] font-semibold text-white">
          {totalInvested}
        </div>

        <div className="h-4 w-px bg-white/20" />

        <div
          className="text-[15px] font-semibold"
          style={{ color: "var(--platform-success-color)" }}
        >
          {expectedProfit}
        </div>

        <div className="h-4 w-px bg-white/20" />

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

      {/* Mobile: compact strip at top-right */}
      <div
        className="absolute right-3 top-4 z-20 flex items-center gap-2 rounded-xl bg-black/75 px-3 py-1.5 backdrop-blur-sm md:hidden"
      >
        <div className="text-[11px] font-semibold tabular-nums text-white">
          {remainingLabel}
        </div>
        <div className="h-3 w-px bg-white/20" />
        <div
          className="text-[11px] font-bold"
          style={{
            color: sellPnLPositive
              ? "var(--platform-success-color)"
              : "var(--platform-danger-color)",
          }}
        >
          {sellPnL}
        </div>
        <button
          onClick={onSell}
          disabled={isSelling}
          className="rounded-md bg-white/12 px-2.5 py-1 text-[10px] font-medium text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSelling
            ? t("selling")
            : operationCount > 1
              ? `${t("sell")} (${operationCount})`
              : t("sell")}
        </button>
      </div>
    </>
  );
}
