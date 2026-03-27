"use client";

import { ChevronDown, Search, Star, X, Plus } from "lucide-react";
import Image from "next/image";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { debounce } from "lodash";
import { Crypto } from "@/lib/forex-data";
import { priceProvider } from "@/lib/price-provider";
import { useTranslations } from "next-intl";
import { useTickSound } from "@/hooks/use-tick-sound";

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
}

export function CryptoSelector({
  cryptos,
  selectedCrypto,
  currentPrice,
  onSelect,
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
                    <Image
                      src={crypto.image}
                      alt={crypto.name}
                      width={32}
                      height={32}
                      className="object-contain"
                      priority
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
          className="px-3 py-2 rounded-xl cursor-pointer transition-all duration-300 hover:bg-platform-overlay-hover flex items-center group border-b-2 border-b-platform-text w-full max-w-[160px] my-2 mx-4"
          onClick={() => {
            playTick();
            setIsAddMode(false);
            setIsDropdownOpen(!isDropdownOpen);
          }}
        >
          <div className="w- h-12 rounded-md items-center justify-center overflow-hidden p-1 shadow-sm flex mr-2">
            <Image
              src={selectedCrypto?.image || "/placeholder.svg?width=20&height=20&query=crypto+logo"}
              alt={selectedCrypto?.name || t("placeholderAlt")}
              width={64}
              height={64}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col items-start flex-1">
            <div className="text-platform-text font-medium text-xs">{selectedCrypto?.name || t("selectCrypto")}</div>
            <div className="text-platform-overlay-muted text-[10px] mt-0.5">{selectedCrypto?.type || ""}</div>
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
            if (assetBrowserMode === "sidebar") {
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

      {isDropdownOpen && (
        <div className="fixed inset-0 z-[9999] bg-platform-overlay-backdrop backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-platform-overlay-surface backdrop-blur-xl rounded-2xl border border-platform-overlay-card shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-platform-overlay-card">
              <h3 className="text-platform-text font-bold text-xl">{t("selectAsset")}</h3>
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

            <div className="p-6 overflow-y-auto flex-grow">
              <div className="relative mb-6">
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

              <div className="flex items-center mb-6 gap-2">
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
                        <Image
                          src={crypto.image || "/placeholder.svg?width=32&height=32&query=crypto+badge"}
                          alt={crypto.name}
                          width={64}
                          height={64}
                          className="object-contain"
                          priority={selectedCrypto?.symbol === crypto.symbol}
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
        </div>
      )}
    </div>
  );
}
