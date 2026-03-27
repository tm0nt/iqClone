"use client";

import { X } from "lucide-react";

interface TradingActiveOperationsModalItem {
  id: string;
  invested: string;
  expectedProfit: string;
  sellPnL: string;
  sellPnLPositive: boolean;
}

interface TradingActiveOperationsModalProps {
  open: boolean;
  operationCount: number;
  totalInvested: string;
  expectedProfit: string;
  sellPnL: string;
  sellPnLPositive: boolean;
  items: TradingActiveOperationsModalItem[];
  sellingAll: boolean;
  sellingOperationIds: string[];
  onClose: () => void;
  onSellAll: () => void;
  onSellOne: (id: string) => void;
  onPlayTick: () => void;
  t: (key: string, values?: Record<string, string>) => string;
}

export function TradingActiveOperationsModal({
  open,
  operationCount,
  totalInvested,
  expectedProfit,
  sellPnL,
  sellPnLPositive,
  items,
  sellingAll,
  sellingOperationIds,
  onClose,
  onSellAll,
  onSellOne,
  onPlayTick,
  t,
}: TradingActiveOperationsModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-40 flex items-start justify-center bg-black/45 px-4 pt-24 backdrop-blur-sm">
      <div className="w-full max-w-[720px] overflow-hidden rounded-[28px] border border-white/10 bg-[#1b1d22]/96 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <div className="text-[13px] font-semibold uppercase tracking-[0.18em] text-white/45">
              {t("sellTitle")}
            </div>
            <div className="mt-1 text-xl font-semibold text-white">
              {t("sellTitleWithCount", { count: String(operationCount) })}
            </div>
          </div>
          <button
            onClick={() => {
              onPlayTick();
              onClose();
            }}
            className="rounded-full p-2 text-white/55 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6 border-b border-white/10 px-6 py-5">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
              {t("totalInvested")}
            </div>
            <div className="mt-1 text-[28px] font-semibold text-white">
              {totalInvested}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
              {t("expectedProfit")}
            </div>
            <div
              className="mt-1 text-[28px] font-semibold"
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
              className="mt-1 text-[28px] font-semibold"
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

        <div className="px-6 py-5">
          <div className="grid grid-cols-[1.2fr_1fr_1.2fr_92px] items-center gap-4 border-b border-white/10 pb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
            <div>{t("modalInvested")}</div>
            <div>{t("modalExpectedProfit")}</div>
            <div>{t("modalSellPnL")}</div>
            <div className="text-right">{t("sell")}</div>
          </div>

          <div className="divide-y divide-white/10">
            {items.map((item) => {
              const isSelling = sellingOperationIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-[1.2fr_1fr_1.2fr_92px] items-center gap-4 py-4"
                >
                  <div className="text-lg font-semibold text-white">
                    {item.invested}
                  </div>
                  <div
                    className="text-lg font-semibold"
                    style={{ color: "var(--platform-success-color)" }}
                  >
                    {item.expectedProfit}
                  </div>
                  <div
                    className="text-lg font-semibold"
                    style={{
                      color: item.sellPnLPositive
                        ? "var(--platform-success-color)"
                        : "var(--platform-danger-color)",
                    }}
                  >
                    {item.sellPnL}
                  </div>
                  <div className="text-right">
                    <button
                      onClick={() => {
                        onPlayTick();
                        onSellOne(item.id);
                      }}
                      disabled={isSelling || sellingAll}
                      className="text-sm font-medium text-white/72 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isSelling ? t("selling") : t("sell")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end border-t border-white/10 px-6 py-5">
          <button
            onClick={() => {
              onPlayTick();
              onSellAll();
            }}
            disabled={sellingAll || items.length === 0}
            className="rounded-xl bg-[#f26f52] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#f57f65] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sellingAll
              ? t("selling")
              : t("sellAll", { count: String(operationCount) })}
          </button>
        </div>
      </div>
    </div>
  );
}
