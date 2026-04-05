"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Briefcase,
  Clock,
  X,
  TrendingUp,
  TrendingDown,
  Newspaper,
  Megaphone,
  LayoutGrid,
  Search,
  Star,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { ForexPair } from "@/lib/forex-data";
import { useTickSound } from "@/hooks/use-tick-sound";
import { useToast } from "@/components/ui/toast";
import { useAccountStore } from "@/store/account-store";
import { SidebarPanelSkeleton } from "@/components/account-loading-skeletons";
import {
  calculateLiveOperationSellSnapshot,
  getRealizedOperationPnl,
  getOperationRemainingPercent,
} from "@/lib/trade-operation-math";

type SidebarPanel =
  | "portfolio"
  | "history"
  | "assets"
  | "news"
  | "promotions"
  | null;

const NEWS_FALLBACK_URL =
  "https://br.investing.com/currencies/single-currency-crosses";

interface TradeEntry {
  id: string;
  time: string;
  date: string;
  pair: string;
  platform: string;
  amount: number;
  profit: number;
  profitPercent: number;
  direction: "up" | "down";
}

interface OpenPosition {
  id: string;
  time: string;
  date: string;
  pair: string;
  platform: string;
  amount: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPercent: number;
  direction: "up" | "down";
  status: "open";
  expiryTime: number;
  remainingMs: number;
  progressPercent: number;
  expectedProfit: number;
}

interface NewsEntry {
  id: string;
  title: string;
  description: string | null;
  source: string | null;
  url: string | null;
  publishedDate: string | null;
  tickers: string[];
  tags: string[];
}

interface PromotionEntry {
  id: string;
  title: string;
  description: string | null;
  rulesText: string | null;
  type: "deposit_bonus" | "revenue_multiplier";
  bonusPercent: number | null;
  bonusFixedAmount: number | null;
  maxBonusAmount: number | null;
  revenueMultiplier: number | null;
  minDepositAmount: number | null;
  validUntil: string | null;
  redeemed: boolean;
  redemptionStatus: "active" | "consumed" | "expired" | "cancelled" | null;
  rewardValue: number | null;
  claimsLeft: number | null;
}

interface TradingSidebarProps {
  onSelectAsset?: (crypto: ForexPair, addOnly: boolean) => void;
  onToggleFavorite?: (crypto: ForexPair) => void;
  activePanel: SidebarPanel;
  onActivePanelChange: (panel: SidebarPanel) => void;
  selectedAssetSymbol?: string;
}

export function TradingSidebar({
  onSelectAsset,
  onToggleFavorite,
  activePanel,
  onActivePanelChange,
  selectedAssetSymbol,
}: TradingSidebarProps) {
  const t = useTranslations("TradingSidebar");
  const playTick = useTickSound();
  const toast = useToast();
  const [selectedFilter, setSelectedFilter] = useState<"all" | "profit" | "loss">("all");
  const [selectedPortfolioFilter, setSelectedPortfolioFilter] = useState<"open" | "positive" | "negative">("open");
  const [operations, setOperations] = useState<any[]>([]);
  const [operationsLoading, setOperationsLoading] = useState(true);
  const [assetSearch, setAssetSearch] = useState("");
  const [availablePairs, setAvailablePairs] = useState<ForexPair[]>([]);
  const [pairsLoading, setPairsLoading] = useState(false);
  const [snapshotsLoading, setSnapshotsLoading] = useState(false);
  const [assetTypeFilter, setAssetTypeFilter] = useState<
    "all" | "forex" | "crypto" | "iex" | "favorites"
  >("all");
  const [assetSnapshotMap, setAssetSnapshotMap] = useState<
    Record<
      string,
      { price: number; priceChangePercent: number; change: string; ok: boolean }
    >
  >({});
  const [nowTs, setNowTs] = useState(() => Date.now());
  const [seenHistoryCount, setSeenHistoryCount] = useState(0);
  const [newsItems, setNewsItems] = useState<NewsEntry[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsScope, setNewsScope] = useState<"asset" | "general">("asset");
  const [newsProviderEnabled, setNewsProviderEnabled] = useState<boolean | null>(null);
  const [promotionItems, setPromotionItems] = useState<PromotionEntry[]>([]);
  const [promotionsLoading, setPromotionsLoading] = useState(false);
  const [promotionFilter, setPromotionFilter] = useState<"available" | "redeemed">("available");
  const [redeemingPromotionId, setRedeemingPromotionId] = useState<string | null>(null);
  const activeOperations = useAccountStore((state) => state.activeOperations);
  const currentPrices = useAccountStore((state) => state.currentPrices);
  const operationHistory = useAccountStore((state) => state.operationHistory);
  const selectedAccount = useAccountStore((state) => state.selectedAccount);

  const isPortfolioOpen = activePanel === "portfolio";
  const isHistoryOpen = activePanel === "history";
  const isAssetsOpen = activePanel === "assets";
  const isNewsOpen = activePanel === "news";
  const isPromotionsOpen = activePanel === "promotions";

  useEffect(() => {
    setOperationsLoading(true);

    fetch('/api/account/operations')
      .then(res => res.json())
      .then(data => {
        if (data.operations) {
          setOperations(data.operations);
        }
      })
      .catch(error => console.error('Error fetching operations:', error))
      .finally(() => setOperationsLoading(false));
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowTs(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const loadNewsAvailability = useCallback(async () => {
    try {
      const response = await fetch("/api/market/news?meta=true", {
        credentials: "include",
      });
      const data = await response.json();
      const enabled = Boolean(data.enabled);
      setNewsProviderEnabled(enabled);
      return enabled;
    } catch {
      setNewsProviderEnabled(false);
      return false;
    }
  }, []);

  const loadPromotions = useCallback(async () => {
    setPromotionsLoading(true);
    try {
      const response = await fetch("/api/promotions", {
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Falha ao carregar promoções");
      }
      setPromotionItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setPromotionItems([]);
    } finally {
      setPromotionsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNewsAvailability();
  }, [loadNewsAvailability]);

  const trades = useMemo(() => {
    const persistedTrades = operations
      .filter((op) => op.resultado !== "pendente")
      .map(op => {
        const realizedPnl = getRealizedOperationPnl({
          value: Number(op.valor) || 0,
          revenue: Number(op.receita) || 0,
          result: op.resultado,
        });

        return ({
        id: op.id,
        time: new Date(op.data).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        date: new Date(op.data).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
        pair: op.ativo,
        platform: "Blitz",
        amount: op.valor,
        profit: realizedPnl,
        profitPercent: op.valor > 0 ? (realizedPnl / op.valor) * 100 : 0,
        direction: op.previsao === "call" ? "up" : "down",
      })});
    const liveTrades = operationHistory.map((op) => ({
      id: op.id,
      time: op.entryTime.split(" ")[1] || "--:--",
      date: op.entryTime.split(",")[0] || "--",
      pair: op.asset,
      platform: "Blitz",
      amount: op.value,
      profit: op.result === "win" ? op.profit ?? 0 : -op.value,
      profitPercent:
        op.result === "win"
          ? ((op.profit ?? 0) / Math.max(op.value, 1)) * 100
          : -100,
      direction: op.type === "buy" ? "up" : "down",
    }));

    return [...liveTrades, ...persistedTrades.filter((trade) =>
      !liveTrades.some((liveTrade) => liveTrade.id === trade.id),
    )];
  }, [operationHistory, operations]);

  // Mark history as seen when panel is open
  useEffect(() => {
    if (isHistoryOpen) {
      setSeenHistoryCount(trades.length);
    }
  }, [isHistoryOpen, trades.length]);

  const openPositions = useMemo(() => {
    return activeOperations
      .filter(
        (operation) =>
          !operation.accountType || operation.accountType === selectedAccount,
      )
      .map((operation) => {
      const livePrice =
        currentPrices[operation.asset] ??
        assetSnapshotMap[operation.asset]?.price ??
        operation.entryPrice;
      const sellSnapshot = calculateLiveOperationSellSnapshot({
        type: operation.type,
        value: operation.value,
        entryPrice: operation.entryPrice,
        expectedProfit: operation.expectedProfit,
        livePrice,
      });

      return {
        id: operation.id,
        time: new Date(operation.openedAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: new Date(operation.openedAt).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
        }),
        pair: operation.asset,
        platform: "Blitz",
        amount: operation.value,
        currentValue: sellSnapshot.exitValue,
        unrealizedPnL: sellSnapshot.pnl,
        unrealizedPercent: sellSnapshot.pnlPercent,
        direction: operation.type === "buy" ? ("up" as const) : ("down" as const),
        status: "open" as const,
        expiryTime: operation.expiryTime,
        remainingMs: Math.max(operation.expiryTime - nowTs, 0),
        progressPercent: getOperationRemainingPercent(operation, nowTs),
        expectedProfit: operation.expectedProfit,
      } satisfies OpenPosition;
    });
  }, [activeOperations, assetSnapshotMap, currentPrices, nowTs, selectedAccount]);

  const filteredOpenPositions = useMemo(() => {
    return openPositions.filter((position) => {
      if (selectedPortfolioFilter === "positive") return position.unrealizedPnL >= 0;
      if (selectedPortfolioFilter === "negative") return position.unrealizedPnL < 0;
      return true;
    });
  }, [openPositions, selectedPortfolioFilter]);

  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      if (selectedFilter === "profit") return trade.profit >= 0;
      if (selectedFilter === "loss") return trade.profit < 0;
      return true;
    });
  }, [selectedFilter, trades]);

  const portfolioSummary = useMemo(() => {
    const totalInvested = openPositions.reduce((sum, pos) => sum + pos.amount, 0);
    const currentValue = openPositions.reduce((sum, pos) => sum + pos.currentValue, 0);
    const pnlTotal = openPositions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0);
    const pnlPercent = totalInvested > 0 ? (pnlTotal / totalInvested) * 100 : 0;

    return { totalInvested, currentValue, pnlTotal, pnlPercent };
  }, [openPositions]);

  const formatTimeRemaining = useCallback((remainingMs: number) => {
    const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
    }

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }, []);

  const activeAssetOperationMap = useMemo(() => {
    const nextMap = new Map<
      string,
      {
        count: number;
        remainingMs: number;
        livePnL: number;
        expectedProfit: number;
      }
    >();

    for (const position of openPositions) {
      const existing = nextMap.get(position.pair);

      if (existing) {
        existing.count += 1;
        existing.remainingMs = Math.min(existing.remainingMs, position.remainingMs);
        existing.livePnL += position.unrealizedPnL;
        existing.expectedProfit += position.expectedProfit;
        continue;
      }

      nextMap.set(position.pair, {
        count: 1,
        remainingMs: position.remainingMs,
        livePnL: position.unrealizedPnL,
        expectedProfit: position.expectedProfit,
      });
    }

    return nextMap;
  }, [openPositions]);

  // Load available pairs when assets panel opens
  useEffect(() => {
    if (!isAssetsOpen || availablePairs.length > 0) return;

    setPairsLoading(true);

    fetch('/api/config/pairs', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAvailablePairs(data);
        }
      })
      .catch(() => {})
      .finally(() => setPairsLoading(false));
  }, [isAssetsOpen, availablePairs.length]);

  useEffect(() => {
    if (!isAssetsOpen || availablePairs.length === 0) return;

    const controller = new AbortController();
    const symbols = availablePairs.map((pair) => pair.symbol).join(",");

    setSnapshotsLoading(true);

    fetch(`/api/market/snapshots?symbols=${encodeURIComponent(symbols)}`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((rows) => {
        if (!Array.isArray(rows)) return;

        const nextSnapshotMap: Record<
          string,
          { price: number; priceChangePercent: number; change: string; ok: boolean }
        > = {};

        for (const row of rows) {
          nextSnapshotMap[row.symbol] = {
            price: Number(row.price) || 0,
            priceChangePercent: Number(row.priceChangePercent) || 0,
            change:
              typeof row.change === "string"
                ? row.change
                : `${(Number(row.priceChangePercent) || 0).toFixed(2)}%`,
            ok: Boolean(row.ok),
          };
        }

        setAssetSnapshotMap(nextSnapshotMap);
      })
      .catch(() => {})
      .finally(() => setSnapshotsLoading(false));

    return () => controller.abort();
  }, [availablePairs, isAssetsOpen]);

  const getAssetCategory = useCallback((pair: ForexPair) => {
    const providerName = `${pair.provider ?? pair.exchange ?? ""}`.toLowerCase();

    if (providerName.includes("iex")) {
      return "iex" as const;
    }

    return pair.type === "crypto" ? ("crypto" as const) : ("forex" as const);
  }, []);

  const handleToggleFavorite = useCallback((pair: ForexPair) => {
    setAvailablePairs((prev) =>
      prev.map((p) =>
        p.symbol === pair.symbol ? { ...p, favorite: !p.favorite } : p,
      ),
    );
    onToggleFavorite?.({ ...pair, favorite: !pair.favorite });
  }, [onToggleFavorite]);

  const filteredPairs = useMemo(() => {
    const q = assetSearch.toLowerCase();
    return availablePairs
      .filter((pair) => {
        if (assetTypeFilter === "favorites") return pair.favorite === true;
        if (assetTypeFilter === "all") return true;
        return getAssetCategory(pair) === assetTypeFilter;
      })
      .filter((p) =>
        !q
          ? true
          : p.symbol.toLowerCase().includes(q) || p.name.toLowerCase().includes(q),
      );
  }, [availablePairs, assetSearch, assetTypeFilter, getAssetCategory]);

  const assetSummary = useMemo(() => {
    const visiblePairs = filteredPairs;
    const avgPayout =
      visiblePairs.length > 0
        ? visiblePairs.reduce((sum, pair) => sum + (pair.payoutRate ?? 0), 0) /
          visiblePairs.length
        : 0;
    const avgChange =
      visiblePairs.length > 0
        ? visiblePairs.reduce((sum, pair) => {
            const snapshot = assetSnapshotMap[pair.symbol];
            return sum + (snapshot?.priceChangePercent ?? pair.priceChangePercent ?? 0);
          }, 0) / visiblePairs.length
        : 0;
    const topPricePair = visiblePairs.reduce<ForexPair | null>((top, pair) => {
      const topPrice = top
        ? assetSnapshotMap[top.symbol]?.price || top.basePrice || 0
        : -Infinity;
      const currentPrice = assetSnapshotMap[pair.symbol]?.price || pair.basePrice || 0;
      return currentPrice > topPrice ? pair : top;
    }, null);

    return {
      count: visiblePairs.length,
      avgPayout,
      avgChange,
      topPricePair,
    };
  }, [assetSnapshotMap, filteredPairs]);

  const unseenHistoryCount = trades.length - seenHistoryCount;

  const filteredPromotionItems = useMemo(() => {
    return promotionItems.filter((item) => {
      if (promotionFilter === "redeemed") {
        return item.redeemed;
      }
      return !item.redeemed;
    });
  }, [promotionFilter, promotionItems]);

  const handleOpenNews = useCallback(async () => {
    playTick();
    const enabled =
      newsProviderEnabled == null
        ? await loadNewsAvailability()
        : newsProviderEnabled;

    if (enabled) {
      onActivePanelChange(isNewsOpen ? null : "news");
      return;
    }

    window.open(NEWS_FALLBACK_URL, "_blank", "noopener,noreferrer");
  }, [
    isNewsOpen,
    loadNewsAvailability,
    newsProviderEnabled,
    onActivePanelChange,
    playTick,
  ]);

  const handleRedeemPromotion = useCallback(
    async (promotionId: string) => {
      playTick();
      setRedeemingPromotionId(promotionId);
      try {
        const response = await fetch("/api/promotions/redeem", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ promotionId }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Falha ao resgatar promoção");
        }

        toast.open({
          variant: "success",
          title: t("promotionRedeemedTitle"),
          description: t("promotionRedeemedDescription"),
          duration: 3500,
        });
        await loadPromotions();
      } catch (error) {
        toast.open({
          variant: "error",
          title: t("promotionRedeemErrorTitle"),
          description:
            error instanceof Error
              ? error.message
              : t("promotionRedeemErrorDescription"),
          duration: 3500,
        });
      } finally {
        setRedeemingPromotionId(null);
      }
    },
    [loadPromotions, playTick, t, toast],
  );

  useEffect(() => {
    if (!isNewsOpen) return;

    const controller = new AbortController();
    const searchParams = new URLSearchParams({
      limit: "12",
    });

    if (newsScope === "asset" && selectedAssetSymbol) {
      searchParams.set("symbol", selectedAssetSymbol);
    }

    setNewsLoading(true);

    fetch(`/api/market/news?${searchParams.toString()}`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.enabled) {
          setNewsProviderEnabled(false);
          throw new Error("Tiingo news provider unavailable");
        }
        setNewsProviderEnabled(true);
        setNewsItems(Array.isArray(data.items) ? data.items : []);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error(error);
        setNewsItems([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setNewsLoading(false);
        }
      });

    return () => controller.abort();
  }, [isNewsOpen, newsScope, selectedAssetSymbol]);

  useEffect(() => {
    if (!isPromotionsOpen) return;
    void loadPromotions();
  }, [isPromotionsOpen, loadPromotions]);

  const menuItems = [
    {
      title: t("operations"),
      subtitle: t("active"),
      icon: Briefcase,
      badge: !isPortfolioOpen && openPositions.length > 0 ? openPositions.length.toString() : undefined,
      onClick: () => {
        playTick();
        onActivePanelChange(isPortfolioOpen ? null : "portfolio");
      },
    },
    {
      title: t("assets"),
      icon: LayoutGrid,
      onClick: () => {
        playTick();
        onActivePanelChange(isAssetsOpen ? null : "assets");
      },
    },
    {
      title: t("news"),
      icon: Newspaper,
      onClick: () => void handleOpenNews(),
    },
    {
      title: t("promotions"),
      icon: Megaphone,
      onClick: () => {
        playTick();
        onActivePanelChange(isPromotionsOpen ? null : "promotions");
      },
    },
    {
      title: t("trading"),
      subtitle: t("history"),
      icon: Clock,
      badge: !isHistoryOpen && unseenHistoryCount > 0 ? unseenHistoryCount.toString() : undefined,
      onClick: () => {
        playTick();
        onActivePanelChange(isHistoryOpen ? null : "history");
      },
    },
  ];

  return (
    <>
      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: var(--platform-overlay-hover-color) var(--platform-surface-alt-color);
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: var(--platform-surface-alt-color);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--platform-overlay-hover-color);
          border-radius: 3px;
          transition: background 0.2s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: color-mix(in srgb, var(--platform-overlay-hover-color) 80%, white);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: color-mix(in srgb, var(--platform-overlay-hover-color) 65%, white);
        }
      `}</style>

      <div className="flex h-screen w-full bg-platform-bg">
        {/* Sidebar */}
        <div className="w-16 md:w-20 flex-shrink-0 border-r border-platform-overlay-hover flex flex-col">
          <div className="flex-1">
            {menuItems.map((item, index) => (
              <div key={index} className="relative">
                <button
                  onClick={item.onClick}
                  className="flex flex-col items-center justify-center h-16 md:h-20 w-full text-platform-muted hover:text-platform-text hover:bg-platform-overlay-hover transition-colors group"
                >
                  <div className="relative">
                    <item.icon className="h-6 w-6 mb-1" />
                    {item.badge && (
                      <div className="absolute -top-2 -right-2 bg-platform-demo text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {item.badge}
                      </div>
                    )}
                  </div>
                  {item.title && (
                    <div className="text-center">
                      <div className="text-[9px] font-medium leading-tight">{item.title}</div>
                      {item.subtitle && <div className="text-[9px] font-medium leading-tight">{item.subtitle}</div>}
                    </div>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio Panel */}
        {isPortfolioOpen && (
          <div className="flex-1 md:w-80 md:flex-none border-r border-platform-overlay-hover flex flex-col overflow-hidden">
            <div className="p-4 border-b border-platform-overlay-hover">
              <div
                className="relative -m-4 border-b px-3 py-3 pr-12"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--platform-overlay-border-color) 60%, transparent)",
                  background:
                    "color-mix(in srgb, var(--platform-overlay-surface-color) 38%, transparent)",
                }}
              >
                <button
                  onClick={() => {
                    playTick();
                    onActivePanelChange(null);
                  }}
                  className="absolute right-3 top-3 text-platform-overlay-muted hover:text-platform-text transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="mb-2 text-[11px] uppercase tracking-[0.16em] text-[var(--platform-overlay-muted-text-color)]">
                  {filteredOpenPositions.length} abertas
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {[
                    { id: "open", label: "Abertas" },
                    { id: "positive", label: "Positivas" },
                    { id: "negative", label: "Negativas" },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => {
                        playTick();
                        setSelectedPortfolioFilter(
                          filter.id as typeof selectedPortfolioFilter,
                        );
                      }}
                      className="rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all"
                      style={
                        selectedPortfolioFilter === filter.id
                          ? {
                              borderColor: "var(--platform-primary-color)",
                              background:
                                "color-mix(in srgb, var(--platform-primary-color) 12%, transparent)",
                              color: "var(--platform-header-text-color)",
                            }
                          : {
                              borderColor:
                                "color-mix(in srgb, var(--platform-overlay-border-color) 78%, transparent)",
                              background: "transparent",
                              color: "var(--platform-muted-text-color)",
                            }
                      }
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Open Positions List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredOpenPositions.length === 0 ? (
                <div className="flex items-center justify-center h-24 text-platform-overlay-muted text-sm">
                  Nenhuma operacao encontrada
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredOpenPositions.map((position) => (
                    <div
                    key={position.id}
                    className="rounded-2xl border px-4 py-3 text-left transition-all"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--platform-overlay-border-color) 42%, transparent)",
                      background:
                        "color-mix(in srgb, var(--platform-background-color) 12%, transparent)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-white text-sm font-medium leading-tight">
                          {position.pair}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[11px] leading-tight text-[var(--platform-overlay-muted-text-color)]">
                          <span>{position.time}</span>
                          <span>{position.date}</span>
                          <span>{position.platform}</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right leading-tight">
                        <div className="text-white text-xs font-semibold">
                          ${position.currentValue.toLocaleString()}
                        </div>
                        <div className="mt-1 flex items-center justify-end gap-2 text-[11px]">
                          <span className="text-white/70">
                            ${position.amount.toLocaleString()}
                          </span>
                          <span
                            className="font-medium"
                            style={{
                              color:
                                position.unrealizedPnL >= 0
                                  ? "var(--platform-success-color)"
                                  : "var(--platform-danger-color)",
                            }}
                          >
                            {position.unrealizedPnL >= 0 ? "+" : "-"}
                            {Math.abs(position.unrealizedPercent).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--platform-overlay-muted-text-color)]">
                        <span>Expira em</span>
                        <span className="text-white">
                          {formatTimeRemaining(position.remainingMs)}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-white transition-all duration-1000 ease-linear"
                          style={{ width: `${position.progressPercent}%` }}
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {position.direction === "up" ? (
                          <TrendingUp className="h-4 w-4 text-platform-positive" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-platform-danger" />
                        )}
                        <span className="uppercase text-[var(--platform-overlay-muted-text-color)]">
                          {position.status}
                        </span>
                      </div>
                      <div
                        className="font-medium"
                        style={{
                          color:
                            position.unrealizedPnL >= 0
                              ? "var(--platform-success-color)"
                              : "var(--platform-danger-color)",
                        }}
                      >
                        {position.unrealizedPnL >= 0 ? "+" : "-"}$
                        {Math.abs(position.unrealizedPnL).toLocaleString()}
                      </div>
                    </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Portfolio Summary */}
            <div className="border-t p-3" style={{ borderColor: "color-mix(in srgb, var(--platform-overlay-border-color) 55%, transparent)" }}>
              <div
                className="rounded-2xl border px-4 py-3"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--platform-overlay-border-color) 42%, transparent)",
                  background:
                    "color-mix(in srgb, var(--platform-background-color) 12%, transparent)",
                }}
              >
                <div className="flex justify-between items-center mb-2 text-xs">
                  <span className="text-platform-muted">{t("totalInvested")}:</span>
                  <span className="text-white font-medium">${portfolioSummary.totalInvested.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2 text-xs">
                  <span className="text-platform-muted">{t("currentValue")}:</span>
                  <span className="text-white font-medium">${portfolioSummary.currentValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-platform-muted">{t("pnlTotal")}:</span>
                  <span className={`font-medium ${portfolioSummary.pnlTotal >= 0 ? "text-platform-positive" : "text-platform-negative"}`}>
                    {portfolioSummary.pnlTotal >= 0 ? "+" : "-"}${Math.abs(portfolioSummary.pnlTotal).toLocaleString()} ({portfolioSummary.pnlTotal >= 0 ? "+" : ""}{portfolioSummary.pnlPercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trading History Panel */}
        {isHistoryOpen && (
          <div className="flex-1 md:w-80 md:flex-none border-r border-platform-overlay-hover flex flex-col overflow-hidden">
            <div className="p-4 border-b border-platform-overlay-hover">
              <div
                className="relative -m-4 border-b px-3 py-3 pr-12"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--platform-overlay-border-color) 60%, transparent)",
                  background:
                    "color-mix(in srgb, var(--platform-overlay-surface-color) 38%, transparent)",
                }}
              >
                <button
                  onClick={() => {
                    playTick();
                    onActivePanelChange(null);
                  }}
                  className="absolute right-3 top-3 text-platform-overlay-muted hover:text-platform-text transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="mb-2 text-[11px] uppercase tracking-[0.16em] text-[var(--platform-overlay-muted-text-color)]">
                  {filteredTrades.length} registros
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {[
                    { id: "all", label: "Todos" },
                    { id: "profit", label: "Lucro" },
                    { id: "loss", label: "Perda" },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => {
                        playTick();
                        setSelectedFilter(filter.id as typeof selectedFilter);
                      }}
                      className="rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all"
                      style={
                        selectedFilter === filter.id
                          ? {
                              borderColor: "var(--platform-primary-color)",
                              background:
                                "color-mix(in srgb, var(--platform-primary-color) 12%, transparent)",
                              color: "var(--platform-header-text-color)",
                            }
                          : {
                              borderColor:
                                "color-mix(in srgb, var(--platform-overlay-border-color) 78%, transparent)",
                              background: "transparent",
                              color: "var(--platform-muted-text-color)",
                            }
                      }
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Trading List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {operationsLoading && operationHistory.length === 0 ? (
                <SidebarPanelSkeleton items={4} />
              ) : filteredTrades.length === 0 ? (
                <div className="flex items-center justify-center h-24 text-platform-overlay-muted text-sm">
                  Nenhum historico encontrado
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredTrades.map((trade) => (
                    <div
                    key={trade.id}
                    className="rounded-2xl border px-4 py-3 text-left transition-all"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--platform-overlay-border-color) 42%, transparent)",
                      background:
                        "color-mix(in srgb, var(--platform-background-color) 12%, transparent)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-white text-sm font-medium leading-tight">
                          {trade.pair}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[11px] leading-tight text-[var(--platform-overlay-muted-text-color)]">
                          <span>{trade.time}</span>
                          <span>{trade.date}</span>
                          <span>{trade.platform}</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right leading-tight">
                        <div className="text-white text-xs font-semibold">
                          ${trade.amount.toLocaleString()}
                        </div>
                        <div
                          className="mt-1 text-[11px] font-medium"
                          style={{
                            color:
                              trade.profit >= 0
                                ? "var(--platform-success-color)"
                                : "var(--platform-danger-color)",
                          }}
                        >
                          {trade.profit >= 0 ? "+" : "-"}
                          {Math.abs(trade.profitPercent)}%
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {trade.direction === "up" ? (
                          <TrendingUp className="h-4 w-4 text-platform-positive" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-platform-danger" />
                        )}
                        <span className="uppercase text-[var(--platform-overlay-muted-text-color)]">
                          {trade.direction === "up" ? "call" : "put"}
                        </span>
                      </div>
                      <div
                        className="font-medium"
                        style={{
                          color:
                            trade.profit >= 0
                              ? "var(--platform-success-color)"
                              : "var(--platform-danger-color)",
                        }}
                      >
                        {trade.profit >= 0 ? "+" : "-"}$
                        {Math.abs(trade.profit).toLocaleString()}
                      </div>
                    </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* News Panel */}
        {isNewsOpen && (
          <div className="flex-1 md:w-80 md:flex-none border-r border-platform-overlay-hover flex flex-col overflow-hidden">
            <div
              className="relative border-b px-3 py-3 pr-12"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--platform-overlay-border-color) 60%, transparent)",
                background:
                  "color-mix(in srgb, var(--platform-overlay-surface-color) 38%, transparent)",
              }}
            >
              <button
                onClick={() => {
                  playTick();
                  onActivePanelChange(null);
                }}
                className="absolute right-3 top-3 text-platform-overlay-muted hover:text-platform-text transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="mb-2 text-[11px] uppercase tracking-[0.16em] text-[var(--platform-overlay-muted-text-color)]">
                {newsItems.length} {t("news")}
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {[
                  { id: "asset", label: t("newsCurrentAsset") },
                  { id: "general", label: t("newsGeneral") },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => {
                      playTick();
                      setNewsScope(filter.id as "asset" | "general");
                    }}
                    className="rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all"
                    style={
                      newsScope === filter.id
                        ? {
                            borderColor: "var(--platform-primary-color)",
                            background:
                              "color-mix(in srgb, var(--platform-primary-color) 12%, transparent)",
                            color: "var(--platform-header-text-color)",
                          }
                        : {
                            borderColor:
                              "color-mix(in srgb, var(--platform-overlay-border-color) 78%, transparent)",
                            background: "transparent",
                            color: "var(--platform-muted-text-color)",
                          }
                    }
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {newsLoading ? (
                <SidebarPanelSkeleton items={5} />
              ) : newsItems.length === 0 ? (
                <div className="flex h-24 items-center justify-center px-6 text-center text-sm text-platform-overlay-muted">
                  {t("newsEmpty")}
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {newsItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        playTick();
                        if (item.url) {
                          window.open(item.url, "_blank", "noopener,noreferrer");
                        }
                      }}
                      className="w-full rounded-2xl border px-4 py-3 text-left transition-all"
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--platform-overlay-border-color) 42%, transparent)",
                        background:
                          "color-mix(in srgb, var(--platform-background-color) 12%, transparent)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="line-clamp-2 text-sm font-medium leading-tight text-white">
                            {item.title}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-[11px] leading-tight text-[var(--platform-overlay-muted-text-color)]">
                            <span>{item.source || t("newsSourceFallback")}</span>
                            {item.publishedDate ? (
                              <span>
                                {new Date(item.publishedDate).toLocaleDateString("en-US", {
                                  day: "2-digit",
                                  month: "short",
                                })}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <div className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-[var(--platform-primary-color)]">
                          {item.tickers[0] || t("newsTagMarket")}
                        </div>
                      </div>
                      {item.description ? (
                        <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-[var(--platform-overlay-muted-text-color)]">
                          {item.description}
                        </p>
                      ) : null}
                      {item.tags.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.tags.slice(0, 3).map((tag) => (
                            <span
                              key={`${item.id}-${tag}`}
                              className="rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.12em]"
                              style={{
                                borderColor:
                                  "color-mix(in srgb, var(--platform-overlay-border-color) 78%, transparent)",
                                color: "var(--platform-overlay-muted-text-color)",
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Promotions Panel */}
        {isPromotionsOpen && (
          <div className="flex-1 md:w-80 md:flex-none border-r border-platform-overlay-hover flex flex-col overflow-hidden">
            <div
              className="relative border-b px-3 py-3 pr-12"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--platform-overlay-border-color) 60%, transparent)",
                background:
                  "color-mix(in srgb, var(--platform-overlay-surface-color) 38%, transparent)",
              }}
            >
              <button
                onClick={() => {
                  playTick();
                  onActivePanelChange(null);
                }}
                className="absolute right-3 top-3 text-platform-overlay-muted hover:text-platform-text transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="mb-2 text-[11px] uppercase tracking-[0.16em] text-[var(--platform-overlay-muted-text-color)]">
                {promotionItems.length} {t("promotions")}
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {[
                  { id: "available", label: t("promotionAvailable") },
                  { id: "redeemed", label: t("promotionRedeemed") },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => {
                      playTick();
                      setPromotionFilter(
                        filter.id as "available" | "redeemed",
                      );
                    }}
                    className="rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all"
                    style={
                      promotionFilter === filter.id
                        ? {
                            borderColor: "var(--platform-primary-color)",
                            background:
                              "color-mix(in srgb, var(--platform-primary-color) 12%, transparent)",
                            color: "var(--platform-header-text-color)",
                          }
                        : {
                            borderColor:
                              "color-mix(in srgb, var(--platform-overlay-border-color) 78%, transparent)",
                            background: "transparent",
                            color: "var(--platform-muted-text-color)",
                          }
                    }
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {promotionsLoading ? (
                <SidebarPanelSkeleton items={4} />
              ) : filteredPromotionItems.length === 0 ? (
                <div className="flex h-24 items-center justify-center px-6 text-center text-sm text-platform-overlay-muted">
                  {t("promotionEmpty")}
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredPromotionItems.map((promotion) => {
                    const isRedeemed = promotion.redeemed;
                    const actionLabel = isRedeemed
                      ? promotion.redemptionStatus === "consumed"
                        ? t("promotionConsumed")
                        : t("promotionAlreadyRedeemed")
                      : t("promotionRedeem");

                    return (
                      <div
                        key={promotion.id}
                        className="rounded-2xl border px-4 py-3"
                        style={{
                          borderColor:
                            "color-mix(in srgb, var(--platform-overlay-border-color) 42%, transparent)",
                          background:
                            "color-mix(in srgb, var(--platform-background-color) 12%, transparent)",
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium leading-tight text-white">
                              {promotion.title}
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-[11px] leading-tight text-[var(--platform-overlay-muted-text-color)]">
                              <span>
                                {promotion.type === "deposit_bonus"
                                  ? t("promotionTypeDeposit")
                                  : t("promotionTypeRevenue")}
                              </span>
                              {promotion.validUntil ? (
                                <span>
                                  {new Date(promotion.validUntil).toLocaleDateString(
                                    "en-US",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                    },
                                  )}
                                </span>
                              ) : null}
                            </div>
                          </div>
                          <div
                            className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                            style={{
                              color: isRedeemed
                                ? "var(--platform-success-color)"
                                : "var(--platform-warning-color)",
                            }}
                          >
                            {isRedeemed
                              ? t("promotionStatusRedeemed")
                              : t("promotionStatusLive")}
                          </div>
                        </div>
                        {promotion.description ? (
                          <p className="mt-3 text-xs leading-relaxed text-[var(--platform-overlay-muted-text-color)]">
                            {promotion.description}
                          </p>
                        ) : null}
                        <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.12em]">
                          {promotion.type === "deposit_bonus" ? (
                            <>
                              {promotion.bonusPercent != null ? (
                                <span className="rounded-full border px-2 py-1 text-platform-positive">
                                  +{promotion.bonusPercent}% bonus
                                </span>
                              ) : null}
                              {promotion.bonusFixedAmount != null ? (
                                <span className="rounded-full border px-2 py-1 text-platform-positive">
                                  +${promotion.bonusFixedAmount.toFixed(2)}
                                </span>
                              ) : null}
                              {promotion.minDepositAmount != null ? (
                                <span className="rounded-full border px-2 py-1 text-[var(--platform-overlay-muted-text-color)]">
                                  min ${promotion.minDepositAmount.toFixed(2)}
                                </span>
                              ) : null}
                            </>
                          ) : (
                            <span className="rounded-full border px-2 py-1 text-platform-positive">
                              x{(promotion.revenueMultiplier ?? 1).toFixed(2)} revenue
                            </span>
                          )}
                        </div>
                        {promotion.rulesText ? (
                          <div className="mt-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-xs leading-relaxed text-[var(--platform-overlay-muted-text-color)]">
                            {promotion.rulesText}
                          </div>
                        ) : null}
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="text-[11px] text-[var(--platform-overlay-muted-text-color)]">
                            {promotion.claimsLeft != null
                              ? `${promotion.claimsLeft} ${t("promotionClaimsLeft")}`
                              : t("promotionUnlimited")}
                          </div>
                          <button
                            disabled={isRedeemed || redeemingPromotionId === promotion.id}
                            onClick={() => void handleRedeemPromotion(promotion.id)}
                            className="rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60"
                            style={{
                              borderColor: isRedeemed
                                ? "color-mix(in srgb, var(--platform-overlay-border-color) 78%, transparent)"
                                : "var(--platform-primary-color)",
                              background: isRedeemed
                                ? "transparent"
                                : "color-mix(in srgb, var(--platform-primary-color) 12%, transparent)",
                              color: isRedeemed
                                ? "var(--platform-overlay-muted-text-color)"
                                : "var(--platform-header-text-color)",
                            }}
                          >
                            {redeemingPromotionId === promotion.id
                              ? t("promotionRedeeming")
                              : actionLabel}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Asset Selection Panel */}
        {isAssetsOpen && (
          <div className="flex-1 md:w-80 md:flex-none border-r border-platform-overlay-hover flex flex-col overflow-hidden">
            <div
              className="relative border-b px-3 py-3 pr-12"
              style={{
                borderColor: "color-mix(in srgb, var(--platform-overlay-border-color) 60%, transparent)",
                background:
                  "color-mix(in srgb, var(--platform-overlay-surface-color) 38%, transparent)",
              }}
            >
              <button
                onClick={() => {
                  playTick();
                  onActivePanelChange(null);
                }}
                className="absolute right-3 top-3 text-platform-overlay-muted hover:text-platform-text transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="mb-2 text-[11px] uppercase tracking-[0.16em] text-[var(--platform-overlay-muted-text-color)]">
                {filteredPairs.length} ativos
              </div>

              <div className="flex gap-2 overflow-x-auto">
                {[
                  { id: "all", label: "Todos" },
                  { id: "favorites", label: "Favoritos", isStar: true },
                  { id: "forex", label: "Forex" },
                  { id: "crypto", label: "Cripto" },
                  { id: "iex", label: "IEX" },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => {
                      playTick();
                      setAssetTypeFilter(filter.id as typeof assetTypeFilter);
                    }}
                    className="rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5"
                    style={
                      assetTypeFilter === filter.id
                        ? {
                            borderColor: filter.id === "favorites" ? "var(--platform-warning-color)" : "var(--platform-primary-color)",
                            background: filter.id === "favorites"
                              ? "color-mix(in srgb, var(--platform-warning-color) 12%, transparent)"
                              : "color-mix(in srgb, var(--platform-primary-color) 12%, transparent)",
                            color: "var(--platform-header-text-color)",
                          }
                        : {
                            borderColor:
                              "color-mix(in srgb, var(--platform-overlay-border-color) 78%, transparent)",
                            background: "transparent",
                            color: "var(--platform-muted-text-color)",
                          }
                    }
                  >
                    {"isStar" in filter && filter.isStar && (
                      <Star className="h-3 w-3" style={{
                        color: assetTypeFilter === "favorites" ? "var(--platform-warning-color)" : "currentColor",
                        fill: assetTypeFilter === "favorites" ? "var(--platform-warning-color)" : "none",
                      }} />
                    )}
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div
              className="border-b p-3"
              style={{
                borderColor: "color-mix(in srgb, var(--platform-overlay-border-color) 55%, transparent)",
              }}
            >
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: "var(--platform-overlay-muted-text-color)" }}
                />
                <input
                  type="text"
                  placeholder="Buscar ativo..."
                  value={assetSearch}
                  onChange={(e) => setAssetSearch(e.target.value)}
                  className="w-full rounded-2xl border px-4 py-3 pl-11 text-sm outline-none transition-all"
                  style={{
                    background:
                      "color-mix(in srgb, var(--platform-overlay-card-color) 42%, transparent)",
                    borderColor:
                      "color-mix(in srgb, var(--platform-overlay-border-color) 75%, transparent)",
                    color: "var(--platform-header-text-color)",
                    boxShadow:
                      assetSearch.length > 0
                        ? "0 0 0 1px color-mix(in srgb, var(--platform-primary-color) 12%, transparent) inset"
                        : "none",
                  }}
                />
              </div>
            </div>

            {/* Pairs List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {pairsLoading && availablePairs.length === 0 ? (
                <SidebarPanelSkeleton showSearch items={6} />
              ) : filteredPairs.length === 0 ? (
                <div className="flex items-center justify-center h-24 text-platform-overlay-muted text-sm">
                  Nenhum ativo encontrado
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredPairs.map((pair) => {
                    const activeInfo = activeAssetOperationMap.get(pair.symbol);
                    const livePrice =
                      assetSnapshotMap[pair.symbol]?.price || pair.basePrice || 0;
                    const priceChangePercent =
                      assetSnapshotMap[pair.symbol]?.priceChangePercent ||
                      pair.priceChangePercent ||
                      0;

                    return (
                      <button
                        key={pair.symbol}
                        onClick={() => {
                          playTick();
                          onSelectAsset?.(pair, false);
                          onActivePanelChange(null);
                        }}
                        className="w-full rounded-2xl border px-4 py-3 text-left transition-all"
                        style={{
                          borderColor: activeInfo
                            ? "color-mix(in srgb, var(--platform-primary-color) 35%, var(--platform-overlay-border-color))"
                            : "color-mix(in srgb, var(--platform-overlay-border-color) 42%, transparent)",
                          background: activeInfo
                            ? "color-mix(in srgb, var(--platform-primary-color) 8%, var(--platform-background-color))"
                            : "color-mix(in srgb, var(--platform-background-color) 12%, transparent)",
                        }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playTick();
                                handleToggleFavorite(pair);
                              }}
                              className="shrink-0 transition-colors hover:scale-110 active:scale-95"
                              title={pair.favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                            >
                              <Star
                                className="h-4 w-4"
                                style={{
                                  color: pair.favorite
                                    ? "var(--platform-warning-color)"
                                    : "var(--platform-overlay-muted-text-color)",
                                  fill: pair.favorite ? "var(--platform-warning-color)" : "none",
                                }}
                              />
                            </button>
                            {pair.image ? (
                              <img
                                src={pair.image}
                                alt={pair.symbol}
                                className="w-8 h-8 rounded-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
                                }}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-platform-overlay-hover flex items-center justify-center text-xs text-white font-bold">
                                {pair.symbol.slice(0, 2)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="truncate text-white text-sm font-medium leading-tight">
                                {pair.symbol}
                              </div>
                              <div className="truncate text-xs leading-tight text-[var(--platform-overlay-muted-text-color)]">
                                {pair.name}
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0 text-right leading-tight">
                            {activeInfo ? (
                              <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--platform-primary-color)]">
                                {activeInfo.count} ativa
                                {activeInfo.count > 1 ? "s" : ""} •{" "}
                                {formatTimeRemaining(activeInfo.remainingMs)}
                              </div>
                            ) : null}
                            {snapshotsLoading && !assetSnapshotMap[pair.symbol] ? (
                              <div className="ml-auto flex flex-col items-end gap-2">
                                <div className="h-4 w-16 animate-pulse rounded-lg bg-white/[0.08]" />
                                <div className="h-3 w-12 animate-pulse rounded-lg bg-white/[0.05]" />
                              </div>
                            ) : (
                              <>
                                <div className="text-white text-xs font-semibold">
                                  $
                                  {livePrice.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 5,
                                  })}
                                </div>
                                <div className="mt-1 flex items-center justify-end gap-2 text-[11px]">
                                  {activeInfo ? (
                                    <>
                                      <span
                                        className="font-medium"
                                        style={{
                                          color:
                                            activeInfo.livePnL >= 0
                                              ? "var(--platform-success-color)"
                                              : "var(--platform-danger-color)",
                                        }}
                                      >
                                        {activeInfo.livePnL >= 0 ? "+" : "-"}$
                                        {Math.abs(activeInfo.livePnL).toLocaleString(
                                          "en-US",
                                          {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          },
                                        )}
                                      </span>
                                      <span className="uppercase text-[var(--platform-overlay-muted-text-color)]">
                                        aberta
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      {pair.payoutRate != null && (
                                        <span className="font-medium text-[var(--platform-success-color)]">
                                          {(pair.payoutRate * 100).toFixed(0)}%
                                        </span>
                                      )}
                                      <span
                                        className="font-medium"
                                        style={{
                                          color:
                                            priceChangePercent >= 0
                                              ? "var(--platform-success-color)"
                                              : "var(--platform-danger-color)",
                                        }}
                                      >
                                        {priceChangePercent >= 0 ? "+" : ""}
                                        {priceChangePercent.toFixed(2)}%
                                      </span>
                                      <span className="uppercase text-[var(--platform-overlay-muted-text-color)]">
                                        {getAssetCategory(pair)}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
