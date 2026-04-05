"use client";

import { Star } from "lucide-react";
import type { Crypto } from "@/lib/forex-data";

interface TradingChartAssetBadgeProps {
  selectedCrypto: Crypto;
  loadingAssetLabel: string;
  formattedCurrentPrice: string;
  priceChangePercent: number;
  priceChangeText: string;
  hasActiveSummary?: boolean;
  payoutRate?: number;
  onToggleFavorite: (crypto: Crypto) => void;
  onPlayTick: () => void;
}

export function TradingChartAssetBadge({
  selectedCrypto,
  loadingAssetLabel,
  formattedCurrentPrice,
  priceChangePercent,
  priceChangeText,
  hasActiveSummary = false,
  payoutRate,
  onToggleFavorite,
  onPlayTick,
}: TradingChartAssetBadgeProps) {
  const payoutLabel = payoutRate != null ? `+${Math.round(payoutRate * 100)}%` : null;

  return (
    <div
      className={`absolute left-4 z-20 flex items-center gap-2 ${
        hasActiveSummary ? "top-20" : "top-4"
      }`}
    >
      <div className="flex items-center gap-3 rounded-2xl bg-platform-overlay-backdrop/70 px-3 py-2 backdrop-blur-sm">
        {selectedCrypto?.image ? (
          <img
            src={selectedCrypto.image}
            alt={selectedCrypto.name}
            className="h-8 w-8 md:h-10 md:w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-platform-overlay-surface text-xs font-semibold text-platform-text">
            {selectedCrypto?.symbol?.slice(0, 2) || loadingAssetLabel.slice(0, 2)}
          </div>
        )}
        <div className="min-w-0">
          <div className="truncate text-xs md:text-sm font-semibold text-white">
            {selectedCrypto?.symbol || loadingAssetLabel}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[10px] md:text-xs leading-none">
            <span className="font-medium text-white">${formattedCurrentPrice}</span>
            <span
              className="font-medium"
              style={{
                color:
                  priceChangePercent >= 0
                    ? "var(--platform-success-color)"
                    : "var(--platform-danger-color)",
              }}
            >
              {priceChangeText}
            </span>
            {payoutLabel && (
              <span
                className="font-bold"
                style={{ color: "var(--platform-success-color)" }}
              >
                {payoutLabel}
              </span>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={() => {
          onPlayTick();
          onToggleFavorite(selectedCrypto);
        }}
        className="transition-transform hover:scale-110 hidden md:block"
      >
        <Star
          className={`h-5 w-5 ${
            selectedCrypto.favorite
              ? "fill-current text-platform-warning"
              : "text-platform-overlay-muted"
          }`}
        />
      </button>
    </div>
  );
}
