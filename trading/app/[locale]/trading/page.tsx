// app/[locale]/trading/page.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { StockChart } from "@/components/trading-view";
import { MobileTradingPanel } from "@/components/mobile-trading-panel";
import { ToastContainer } from "@/components/ui/toast";
import type { Order } from "@/components/type";
import TradingPanel from "@/components/trading-panel";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { TradingSidebar } from "@/components/sidebar";
import { useChartMarkers } from "@/hooks/useChartMarkers";
import { useBalanceSync } from "@/hooks/useBalanceSync";
import { useSettlementWorker } from "@/hooks/useSettlementWorker";
import { useActiveOperations } from "@/hooks/useActiveOperations";
import { useTradingGeneralConfig } from "@/hooks/useTradingGeneralConfig";
import { useTradingSelectionState } from "@/hooks/useTradingSelectionState";
import { useTickSound } from "@/hooks/use-tick-sound";

type OrdersRef = Record<string, NodeJS.Timeout>;
type TradingSidebarPanel =
  | "portfolio"
  | "history"
  | "assets"
  | "news"
  | "promotions"
  | null;

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [sidebarPanel, setSidebarPanel] = useState<TradingSidebarPanel>(null);
  const [tradeHoverDirection, setTradeHoverDirection] = useState<
    "buy" | "sell" | null
  >(null);
  const playDealWin = useTickSound("/sound_deal_win.ogg");
  const playDealLoss = useTickSound("/sound_deal_loose.ogg");

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

            <div className="h-[60%] md:h-auto md:flex-1 overflow-hidden relative">
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
                />
              ) : (
                <div className="h-full w-full bg-black" />
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

            <div className="md:hidden border-t border-gray-800">
              {tradingPair ? (
                <MobileTradingPanel
                  currentPrice={currentPrice}
                  onPlaceOrder={handlePlaceOrder}
                  onOperationConfirmed={handleConfirmOperation}
                  tradingPair={tradingPair}
                  payoutRate={selectedCrypto?.payoutRate ?? 0.9}
                  defaultExpirationMinutes={defaultExpirationMinutes}
                  expirationOptions={expirationOptions}
                />
              ) : null}
            </div>
          </div>
          <div className="hidden md:flex">
            <Footer />
          </div>
      </main>
    </ToastContainer>
  );
}
