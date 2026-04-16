// app/[locale]/trading/page.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { StockChart } from "@/components/trading-view";
import { MobileTradingPanel } from "@/components/mobile-trading-panel";
import { ToastContainer } from "@/components/ui/toast";
import {
  SettlementToastContainer,
  showSettlementToast,
} from "@/components/ui/settlement-toast";
import type { Order } from "@/components/type";
import TradingPanel from "@/components/trading-panel";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { TradingSidebar } from "@/components/sidebar";
import { useChartMarkers } from "@/hooks/useChartMarkers";
import { useBalanceSync } from "@/hooks/useBalanceSync";
import { useSettlementWorker } from "@/hooks/useSettlementWorker";
import { useActiveOperations } from "@/hooks/useActiveOperations";
import { useTradingGeneralConfig } from "@/hooks/useTradingGeneralConfig";
import { useTradingSelectionState } from "@/hooks/useTradingSelectionState";
import { useTickSound } from "@/hooks/use-tick-sound";
import { useTranslations } from "next-intl";
import { useMediaQuery } from "@/hooks/use-media-query";

type OrdersRef = Record<string, NodeJS.Timeout>;
type TradingSidebarPanel =
  | "portfolio"
  | "history"
  | "assets"
  | "news"
  | "promotions"
  | null;

export default function Home() {
  const t = useTranslations("StockChart");
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [sidebarPanel, setSidebarPanel] = useState<TradingSidebarPanel>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [tradeHoverDirection, setTradeHoverDirection] = useState<
    "buy" | "sell" | null
  >(null);
  const playDealWin = useTickSound("/sound_deal_win.ogg");
  const playDealLoss = useTickSound("/sound_deal_loose.ogg");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const ordersRef = useRef<OrdersRef>({});
  const currentPriceRef = useRef(0);
  const priceSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const {
    chartBackgroundUrl,
    defaultExpirationMinutes,
    expirationOptions,
  } = useTradingGeneralConfig();
  const {
    cryptos,
    selectedCrypto,
    openCharts,
    currentChart,
    tradingPair,
    setTradingPair,
    handleCryptoSelect,
    handleChangeChart,
    removeChart,
    handleToggleFavorite,
    handleUpdateCryptos,
    pairsLoaded,
    hasAvailablePairs,
  } = useTradingSelectionState();

  // --- New hooks ---
  // Periodically sync balances from Prisma
  useBalanceSync();
  // Server-side settlement worker heartbeat
  useSettlementWorker();
  // Chart markers (entry tips + result popups)
  const {
    entryMarkers,
    resultMarkers,
    addEntryMarker,
    removeEntryMarker,
    syncPendingMarkers,
    updateMarkerOperationId,
    settleMarker,
    dismissResult,
  } = useChartMarkers();
  // Poll for settled operations — drives chart marker settlement
  useActiveOperations({
    onSyncPending: (operations) => {
      syncPendingMarkers(
        operations.map((operation) => ({
          operationId: operation.id,
          pair: operation.asset,
          type: operation.type,
          entryPrice: operation.entryPrice,
          value: operation.value,
          timeframe: operation.timeframe,
          createdAt: operation.openedAt,
        })),
      );
    },
    onSettle: (operation) => {
      if (operation.result === "win") {
        playDealWin();
      } else {
        playDealLoss();
      }

      settleMarker(
        operation.id,
        operation.result,
        operation.closePrice,
        operation.profit,
        {
          pair: operation.asset,
          type: operation.type,
          entryPrice: operation.entryPrice,
          value: operation.value,
          timeframe: operation.timeframe,
          createdAt: operation.openedAt,
        },
      );

      showSettlementToast({
        image: selectedCrypto?.image || "",
        assetName: operation.asset,
        result: operation.result,
        profit: operation.profit,
        value: operation.value,
      });
    },
  });

  const handlePriceUpdate = useCallback((price: number): void => {
    currentPriceRef.current = price;

    if (priceSyncTimeoutRef.current) {
      return;
    }

    priceSyncTimeoutRef.current = setTimeout(() => {
      setCurrentPrice(currentPriceRef.current);
      priceSyncTimeoutRef.current = null;
    }, 150);
  }, []);

  const handlePlaceOrder = useCallback(
    (
      orderType: "buy" | "sell",
      orderAmount: number,
      expirationMinutes: number,
    ): string => {
      const orderId = `order-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const expirationTime = Date.now() + expirationMinutes * 60 * 1000;

      const newOrder: Order = {
        id: orderId,
        type: orderType,
        amount: orderAmount,
        price: currentPriceRef.current,
        createdAt: Date.now(),
        expirationTime,
        lineId: orderId,
      };

      setOrders((prevOrders) => [...prevOrders, newOrder]);

      // Add entry marker ("Tip") on the chart
      addEntryMarker({
        operationId: orderId,
        pair: tradingPair,
        type: orderType,
        entryPrice: currentPriceRef.current,
        value: orderAmount,
        timeframe: `${expirationMinutes}m`,
      });

      // Only clean up the order list when the timer fires.
      // Actual win/loss result comes from the server via useActiveOperations.
      const timer = setTimeout(() => {
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order.id !== orderId),
        );
        delete ordersRef.current[orderId];
      }, expirationMinutes * 60 * 1000);

      ordersRef.current[orderId] = timer;
      return orderId;
    },
    [addEntryMarker, tradingPair],
  );

  // Called by TradingPanel after the server confirms the operation.
  // Updates the chart marker's operationId from the local temp ID to the server UUID,
  // so useActiveOperations can find and settle the correct marker.
  const handleConfirmOperation = useCallback(
    (localId: string, serverId: string) => {
      updateMarkerOperationId(localId, serverId);
    },
    [updateMarkerOperationId],
  );

  const handleCancelOrder = (orderId: string): void => {
    if (ordersRef.current[orderId]) {
      clearTimeout(ordersRef.current[orderId]);
      delete ordersRef.current[orderId];
    }
    setOrders((prevOrders) =>
      prevOrders.filter((order) => order.id !== orderId),
    );
    removeEntryMarker(orderId);
  };

  useEffect(() => {
    return () => {
      Object.values(ordersRef.current).forEach(clearTimeout);
      if (priceSyncTimeoutRef.current) {
        clearTimeout(priceSyncTimeoutRef.current);
      }
    };
  }, []);

  const handleOpenMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(true);
  }, []);

  const handleCloseMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(false);
    setSidebarPanel(null);
  }, []);

  return (
    <ToastContainer>
      <main className="flex flex-col h-screen bg-black text-white overflow-hidden">
          <Header
            cryptos={cryptos}
            selectedCrypto={selectedCrypto}
            currentPrice={currentPrice}
            onSelect={handleCryptoSelect}
            onToggleFavorite={handleToggleFavorite}
            onUpdateCryptos={handleUpdateCryptos}
            openCharts={openCharts}
            currentChart={currentChart}
            onChangeChart={handleChangeChart}
            onRemoveChart={removeChart}
            onOpenAssetsPanel={() => setSidebarPanel("assets")}
          />

          <div className="flex flex-col flex-1 overflow-hidden md:flex-row">
            {/* SIDEBAR VISIBLE ONLY ON DESKTOP */}
            <div className="hidden md:flex">
              <TradingSidebar
                onSelectAsset={handleCryptoSelect}
                onToggleFavorite={handleToggleFavorite}
                activePanel={sidebarPanel}
                onActivePanelChange={setSidebarPanel}
                selectedAssetSymbol={selectedCrypto?.symbol}
              />
            </div>

            {/* MOBILE SIDEBAR OVERLAY */}
            {isMobile && mobileSidebarOpen && (
              <div className="fixed inset-0 z-50 flex">
                <div
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={handleCloseMobileSidebar}
                />
                <div className="relative z-10 flex h-full animate-in slide-in-from-left duration-200">
                  <TradingSidebar
                    onSelectAsset={(crypto, addOnly) => {
                      handleCryptoSelect(crypto, addOnly);
                      if (!addOnly) handleCloseMobileSidebar();
                    }}
                    onToggleFavorite={handleToggleFavorite}
                    activePanel={sidebarPanel}
                    onActivePanelChange={setSidebarPanel}
                    selectedAssetSymbol={selectedCrypto?.symbol}
                    isMobileOverlay
                  />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-hidden relative flex flex-col">
              <div className="flex-1 overflow-hidden relative">
                {selectedCrypto && tradingPair ? (
                  <StockChart
                    orders={orders}
                    entryMarkers={entryMarkers}
                    resultMarkers={resultMarkers}
                    onDismissResult={dismissResult}
                    onCancelOrder={handleCancelOrder}
                    onPlaceOrder={handlePlaceOrder}
                    onPriceUpdate={handlePriceUpdate}
                    tradingPair={tradingPair}
                    setTradingPair={setTradingPair}
                    cryptos={cryptos}
                    selectedCrypto={selectedCrypto}
                    currentPrice={currentPrice}
                    onCryptoSelect={handleCryptoSelect}
                    onToggleFavorite={handleToggleFavorite}
                    onUpdateCryptos={handleUpdateCryptos}
                    openCharts={openCharts}
                    currentChart={currentChart}
                    onChangeChart={handleChangeChart}
                    onRemoveChart={removeChart}
                    chartBackgroundUrl={chartBackgroundUrl}
                    tradeHoverDirection={tradeHoverDirection}
                    onOpenMobileMenu={handleOpenMobileSidebar}
                  />
                ) : pairsLoaded && !hasAvailablePairs ? (
                  <div className="flex h-full w-full items-center justify-center bg-black px-6">
                    <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 px-6 py-8 text-center text-white backdrop-blur-sm">
                      <h2 className="text-xl font-semibold">{t("noTradingPairs")}</h2>
                      <p className="mt-2 text-sm text-white/70">
                        {t("noTradingPairsDescription")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full w-full bg-black" />
                )}
              </div>

              {/* Mobile controls (timer, progress, time/value) — inline, scrolls with content */}
              {tradingPair && (
                <div className="md:hidden">
                  <MobileTradingPanel
                    currentPrice={currentPrice}
                    onPlaceOrder={handlePlaceOrder}
                    onOperationConfirmed={handleConfirmOperation}
                    tradingPair={tradingPair}
                    payoutRate={selectedCrypto?.payoutRate ?? 0.9}
                    defaultExpirationMinutes={defaultExpirationMinutes}
                    expirationOptions={expirationOptions}
                  />
                </div>
              )}
            </div>

            <div className="hidden md:block w-[135px]">
              {tradingPair ? (
                <TradingPanel
                  currentPrice={currentPrice}
                  onPlaceOrder={handlePlaceOrder}
                  onOperationConfirmed={handleConfirmOperation}
                  tradingPair={tradingPair}
                  payoutRate={selectedCrypto?.payoutRate ?? 0.9}
                  defaultExpirationMinutes={defaultExpirationMinutes}
                  expirationOptions={expirationOptions}
                  onTradeHoverChange={setTradeHoverDirection}
                />
              ) : null}
            </div>
          </div>


          <div className="hidden md:flex">
            <Footer />
          </div>
      </main>
      <SettlementToastContainer />
      <PWAInstallPrompt />
    </ToastContainer>
  );
}
