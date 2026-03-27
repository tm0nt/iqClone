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
    <div className="absolute left-0 right-0 top-0 z-20 hidden border-b border-white/10 bg-black/78 px-6 py-3 backdrop-blur-sm md:flex md:items-center md:justify-between">
      <div className="grid flex-1 grid-cols-4 gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
            {t("timeToClose")}
          </div>
          <div className="mt-1 text-[15px] font-semibold text-white">
            {remainingLabel}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
            {t("totalInvested")}
          </div>
          <div className="mt-1 text-[15px] font-semibold text-white">
            {totalInvested}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
            {t("expectedProfit")}
          </div>
          <div
            className="mt-1 text-[15px] font-semibold"
            style={{ color: "var(--platform-success-color)" }}
          >
            {expectedProfit}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
            {t("sellPnL")}
          </div>
          <div
            className="mt-1 text-[15px] font-semibold"
            style={{
              color: sellPnLPositive
                ? "var(--platform-success-color)"
                : "var(--platform-danger-color)",
            }}
          >
            {sellPnL}
          </div>
        </div>
      </div>

      <button
        onClick={onSell}
        disabled={isSelling}
        className="ml-6 min-w-[150px] rounded-md bg-white/12 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/18 disabled:cursor-not-allowed disabled:opacity-60"
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
