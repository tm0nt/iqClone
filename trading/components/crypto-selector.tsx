"use client";

import { ChevronDown, Search, Star, X, Plus } from "lucide-react";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { debounce } from "lodash";
import { Crypto } from "@/lib/forex-data";
import { priceProvider } from "@/lib/price-provider";
import { useTranslations } from "next-intl";
import { useTickSound } from "@/hooks/use-tick-sound";
import { useMediaQuery } from "@/hooks/use-media-query";

interface CryptoSelectorProps {
  cryptos: Crypto[];
  selectedCrypto: Crypto | undefined; // allow undefined
  currentPrice: number;
  onSelect: (crypto: Crypto, addOnly: boolean) => void;
  onToggleFavorite: (crypto: Crypto) => void;
  onUpdateCryptos: (updatedCryptos: Crypto[]) => void;
  openCharts?: string[];
  currentChart?: string;
  onChangeChart?: (symbol: string) => void;
  onRemoveChart?: (symbol: string) => void;
  assetBrowserMode?: "modal" | "sidebar";
  onOpenAssetBrowser?: () => void;
  // Mobile price badge props (show price info inline in the trigger)
  formattedCurrentPrice?: string;
  priceChangePercent?: number;
  priceChangeText?: string;
  payoutRate?: number;
}

function TradingPairIcon({
  image,
  name,
  fallback,
  className,
}: {
  image?: string;
  name: string;
  fallback: string;
  className?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!imageFailed && image) {
    return (
      <img
        src={image}
        alt={name}
        className={className ?? "h-full w-full object-contain"}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <span className="text-xs font-semibold text-platform-text">{fallback}</span>
  );
}

export function CryptoSelector({
  cryptos,
  selectedCrypto,
  currentPrice,
  onSelect,
  formattedCurrentPrice,
  priceChangePercent,
  priceChangeText,
  payoutRate,
  onToggleFavorite,
  onUpdateCryptos,
  openCharts,
  currentChart,
  onChangeChart,
  onRemoveChart,
  assetBrowserMode = "modal",
  onOpenAssetBrowser,
}: CryptoSelectorProps) {
  const t = useTranslations("CryptoSelector");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [localCryptos, setLocalCryptos] = useState<Crypto[]>(cryptos ?? []);
  const onUpdateCryptosRef = useRef(onUpdateCryptos);
  const playTick = useTickSound();

  useEffect(() => {
    onUpdateCryptosRef.current = onUpdateCryptos;
  }, [onUpdateCryptos]);

  useEffect(() => {
    setLocalCryptos(cryptos ?? []);
  }, [cryptos]);

  const symbolsKey = useMemo(
    () => (cryptos ?? []).map((crypto) => crypto.symbol).join(","),
    [cryptos],
  );

  const filteredCryptos = useMemo(
    () =>
      (localCryptos ?? []).filter((crypto) => {
        const matchesSearch =
          crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          crypto.name.toLowerCase().includes(searchTerm.toLowerCase());
        return filterFavorites ? matchesSearch && crypto.favorite : matchesSearch;
      }),
    [localCryptos, searchTerm, filterFavorites],
  );
  const shouldUseSidebarAssetBrowser = assetBrowserMode === "sidebar" && !isMobile;

  const changeCrypto = useCallback(
    debounce((crypto: Crypto) => {
      playTick();
      onSelect(crypto, isAddMode);
      setIsDropdownOpen(false);
    }, 300),
    [onSelect, isAddMode, playTick],
  );

  const toggleFavorite = useCallback(
    (crypto: Crypto) => {
      playTick();
      const updatedCryptos = localCryptos.map((c) =>
        c.symbol === crypto.symbol ? { ...c, favorite: !c.favorite } : c,
      );
      setLocalCryptos(updatedCryptos);
      onToggleFavorite(crypto);
    },
    [localCryptos, onToggleFavorite, playTick],
  );

  const closeDropdown = useCallback(() => setIsDropdownOpen(false), []);

  useEffect(() => {
    if (!isDropdownOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDropdownOpen) closeDropdown();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDropdownOpen, closeDropdown]);

  useEffect(() => {
    if (!selectedCrypto) return;

    const updatePrice = (price: number) => {
      setLocalCryptos((prev) =>
        prev.map((c) => (c.symbol === selectedCrypto.symbol ? { ...c, basePrice: price } : c)),
      );
    };
    priceProvider.subscribe(selectedCrypto.symbol, updatePrice);
    return () => priceProvider.unsubscribe(selectedCrypto.symbol, updatePrice);
  }, [selectedCrypto?.symbol]); // safe optional chaining in dependency

  useEffect(() => {
    if (!symbolsKey) return;

    let cancelled = false;

    async function fetchCryptoData() {
      try {
        const response = await fetch(
          `/api/market/snapshots?symbols=${encodeURIComponent(symbolsKey)}`,
          { cache: "no-store" },
        );
        const snapshotRows = await response.json();

        if (cancelled || !response.ok || !Array.isArray(snapshotRows)) {
          return;
        }

        const snapshotMap = new Map(
          snapshotRows.map((snapshot) => [snapshot.symbol, snapshot]),
        );
        const updatedCryptos = (cryptos ?? []).map((crypto) => {
          const snapshot = snapshotMap.get(crypto.symbol);

          if (!snapshot?.ok) {
            return crypto;
          }

          const currentMarketPrice = Number(snapshot.price) || crypto.basePrice;
          const priceChangePercent =
            Number(snapshot.priceChangePercent) || 0;
          const change =
            typeof snapshot.change === "string"
              ? snapshot.change
              : `${priceChangePercent.toFixed(2)}%`;

          return {
            ...crypto,
            basePrice: currentMarketPrice,
            change,
            priceChangePercent,
          };
        });

        if (cancelled) return;

        setLocalCryptos(updatedCryptos);
        onUpdateCryptosRef.current(updatedCryptos);
      } catch (err) {
        if (!cancelled) {
          if (process.env.NODE_ENV !== "production") {
            console.error("Error fetching crypto data:", err);
          }
        }
      }
    }

    fetchCryptoData();

    return () => {
      cancelled = true;
    };
  }, [symbolsKey]);

  return (
    <div className="relative flex items-center gap-2">
      {openCharts ? (
        <div className="flex items-center gap-2 overflow-x-auto">
          {openCharts.map((symbol) => {
            const crypto = localCryptos.find((c) => c.symbol === symbol);
            if (!crypto) return null;
            return (
              <div key={symbol} className="flex-shrink-0">
                <div
                  role="button"
                  tabIndex={0}
                  className={`px-3 py-2 rounded-xl cursor-pointer transition-all duration-300 hover:bg-platform-overlay-hover flex items-center group border-b-2 ${
                    currentChart === symbol ? "border-b-platform-text" : "border-b-transparent"
                  } my-2 mx-0 w-[160px] min-w-[160px]`}
                  onClick={() => {
                    playTick();
                    onChangeChart?.(symbol);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      playTick();
                      onChangeChart?.(symbol);
                    }
                  }}
                >
                  <div className="w-10 h-10 rounded-md items-center justify-center overflow-hidden p-1 shadow-sm flex mr-2">
                    <TradingPairIcon
                      image={crypto.image}
                      name={crypto.name}
                      fallback={crypto.logo || crypto.symbol.slice(0, 3)}
                      className="h-8 w-8 object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex flex-1 flex-col items-start">
                    <div className="truncate whitespace-nowrap text-platform-text font-medium text-xs">
                      {crypto.name}
                    </div>
                    <div className="text-platform-overlay-muted text-[10px] mt-0.5">{crypto.type}</div>
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      playTick();
                      onRemoveChart?.(symbol);
                    }}
                    className="ml-1 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <X className="h-3 w-3 text-platform-overlay-muted hover:text-platform-danger" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <button
          className="px-2 py-1.5 rounded-xl cursor-pointer transition-all duration-300 hover:bg-platform-overlay-hover flex items-center group border-b-2 border-b-platform-text my-1"
          onClick={() => {
            playTick();
            setIsAddMode(false);
            setIsDropdownOpen(!isDropdownOpen);
          }}
        >
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full shadow-sm mr-1.5 flex-shrink-0">
            <TradingPairIcon
              image={selectedCrypto?.image}
              name={selectedCrypto?.name || t("placeholderAlt")}
              fallback={
                selectedCrypto?.logo ||
                selectedCrypto?.symbol?.slice(0, 3) ||
                "..."
              }
              className="h-8 w-8 object-contain"
            />
          </div>
          <div className="flex flex-col items-start">
            <div className="text-platform-text font-semibold text-xs leading-tight">
              {selectedCrypto?.symbol || t("selectCrypto")}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              {(formattedCurrentPrice || selectedCrypto?.basePrice) ? (
                <span className="text-[10px] text-white/70">
                  ${formattedCurrentPrice || selectedCrypto?.basePrice?.toLocaleString("en-US", {
                    minimumFractionDigits: (selectedCrypto?.basePrice ?? 0) >= 100 ? 2 : 5,
                    maximumFractionDigits: (selectedCrypto?.basePrice ?? 0) >= 100 ? 2 : 5,
                  })}
                </span>
              ) : (
                <span className="text-[10px] text-white/70">{selectedCrypto?.type || ""}</span>
              )}
              {priceChangeText && (
                <span
                  className="text-[10px] font-medium"
                  style={{
                    color: (priceChangePercent ?? 0) >= 0
                      ? "var(--platform-success-color)"
                      : "var(--platform-danger-color)",
                  }}
                >
                  {priceChangeText}
                </span>
              )}
              {payoutRate != null && (
                <span
                  className="text-[10px] font-bold"
                  style={{ color: "var(--platform-success-color)" }}
                >
                  +{Math.round(payoutRate * 100)}%
                </span>
              )}
            </div>
          </div>
          <div className="ml-1">
            <ChevronDown
              className={`h-3 w-3 text-platform-overlay-muted transition-transform duration-300 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>
      )}

      {(openCharts ? openCharts.length < 5 : true) && (
        <button
          className="flex items-center justify-center w-8 h-8 bg-platform-overlay-card rounded-xl hover:bg-platform-overlay-hover transition-colors"
          onClick={() => {
            playTick();
            if (shouldUseSidebarAssetBrowser) {
              onOpenAssetBrowser?.();
              return;
            }

            setIsAddMode(true);
            setIsDropdownOpen(true);
          }}
          title={t("addNewPair")}
        >
          <Plus className="h-5 w-5 text-platform-text" />
        </button>
      )}

      {isDropdownOpen && createPortal(
        <div
          className={`fixed inset-0 z-[9999] bg-platform-overlay-backdrop/80 backdrop-blur-md ${
            isMobile
              ? "flex items-end justify-center p-0"
              : "flex items-center justify-center p-4"
          }`}
          onClick={() => {
            playTick();
            closeDropdown();
          }}
        >
          <div
            className={`bg-platform-overlay-surface backdrop-blur-xl border border-platform-overlay-card shadow-2xl overflow-hidden flex flex-col ${
              isMobile
                ? "w-full max-h-[82vh] rounded-t-[28px] rounded-b-none border-b-0"
                : "w-full max-w-2xl max-h-[90vh] rounded-2xl"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={`flex justify-between items-center border-b border-platform-overlay-card ${isMobile ? "px-4 pb-4 pt-3" : "p-6"}`}>
              <div className="flex flex-col">
                {isMobile ? (
                  <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-platform-overlay-muted/40" />
                ) : null}
                <h3 className="text-platform-text font-bold text-xl">{t("selectAsset")}</h3>
              </div>
              <button
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-platform-overlay-card hover:bg-platform-overlay-hover transition-all duration-200 group"
                onClick={() => {
                  playTick();
                  closeDropdown();
                }}
              >
                <X className="h-5 w-5 text-platform-overlay-muted group-hover:text-platform-text transition-colors" />
              </button>
            </div>

            <div className={`overflow-y-auto flex-grow ${isMobile ? "px-4 pb-4" : "p-6"}`}>
              <div className={`relative ${isMobile ? "mb-4 mt-4" : "mb-6"}`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-platform-overlay-muted" />
                </div>
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  className="w-full text-platform-text pl-12 pr-4 py-3.5 rounded-xl bg-platform-overlay-card border border-platform-overlay-hover focus:outline-none focus:ring-2 focus:ring-platform-positive/50 focus:border-transparent transition-all duration-200 placeholder-platform-overlay-muted"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className={`flex items-center gap-2 ${isMobile ? "mb-4" : "mb-6"}`}>
                <button
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center transition-all duration-200 ${
                    filterFavorites
                      ? "bg-gradient-to-r from-platform-success to-platform-positive text-platform-text shadow-lg shadow-platform-positive/25"
                      : "bg-platform-overlay-card text-platform-overlay-muted hover:bg-platform-overlay-hover hover:text-platform-text"
                  }`}
                  onClick={() => {
                    playTick();
                    setFilterFavorites(true);
                  }}
                >
                  <Star className={`h-4 w-4 mr-2 ${filterFavorites ? "fill-platform-warning" : ""}`} />
                  {t("favorites")}
                </button>
                <button
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    !filterFavorites
                      ? "bg-gradient-to-r from-platform-success to-platform-positive text-platform-text shadow-lg shadow-platform-positive/25"
                      : "bg-platform-overlay-card text-platform-overlay-muted hover:bg-platform-overlay-hover hover:text-platform-text"
                  }`}
                  onClick={() => {
                    playTick();
                    setFilterFavorites(false);
                  }}
                >
                  {t("all")}
                </button>
              </div>

              <div className="space-y-1">
                {filteredCryptos.length > 0 ? (
                  filteredCryptos.map((crypto) => (
                    <div
                      key={crypto.symbol}
                      className={`flex items-center p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 group ${
                        selectedCrypto?.symbol === crypto.symbol
                          ? "bg-platform-positive/20 border border-platform-positive/50"
                          : "hover:bg-platform-overlay-card border border-transparent"
                      }`}
                      onClick={() => changeCrypto(crypto)}
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mr-3 sm:mr-4 overflow-hidden p-1 sm:p-2 group-hover:bg-platform-overlay-hover transition-colors">
                        <TradingPairIcon
                          image={crypto.image}
                          name={crypto.name}
                          fallback={crypto.logo || crypto.symbol.slice(0, 3)}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="text-platform-text font-semibold text-sm sm:text-base">{crypto.symbol}</div>
                        <div className="text-xs sm:text-sm text-platform-overlay-muted">{crypto.name}</div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-platform-text font-semibold tabular-nums text-xs sm:text-sm">
                          $
                          {crypto.basePrice > 100
                            ? crypto.basePrice.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : crypto.basePrice.toFixed(5)}
                        </div>
                        <div
                          className={`text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full mt-1 font-semibold ${
                            crypto.priceChangePercent >= 0
                              ? "bg-platform-positive/20 text-platform-positive"
                              : "bg-platform-negative/20 text-platform-negative"
                          }`}
                        >
                          {crypto.priceChangePercent >= 0 ? "↑" : "↓"} {crypto.change}
                        </div>
                      </div>
                      <div
                        className="ml-2 sm:ml-4 p-1 sm:p-2 rounded-xl hover:bg-platform-overlay-hover transition-all duration-200 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(crypto);
                        }}
                      >
                        <Star
                          className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors ${
                            crypto.favorite ? "fill-platform-warning text-platform-warning" : "text-platform-overlay-muted hover:text-platform-text"
                          }`}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-platform-overlay-muted">
                    <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <div className="font-medium">{t("noCryptoFound")}</div>
                    <div className="text-sm mt-1">{t("tryAnotherTerm")}</div>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-platform-overlay-card border-b-2 border-b-platform-positive p-4">
              <div className="text-center text-platform-overlay-muted text-xs">{t("selectToContinue")}</div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
