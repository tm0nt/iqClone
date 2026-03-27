"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { X } from "lucide-react";

import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5stock from "@amcharts/amcharts5/stock";
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";

import {
  subscribeToPriceUpdates,
  unsubscribeFromPriceUpdates,
} from "@/lib/price-provider";

import type { Order as PropOrder } from "@/components/type";
import type { Crypto } from "@/lib/forex-data";
import { useTranslations } from "next-intl";
import { chartService } from "@/lib/services/chart-service";
import type { EntryMarker, ResultMarker } from "@/hooks/useChartMarkers";
import { useTickSound } from "@/hooks/use-tick-sound";
import { useToast } from "@/components/ui/toast";
import { useAccountStore } from "@/store/account-store";
import { TradingChartLoader } from "@/components/trading-chart-loader";
import { TradingActiveOperationsModal } from "@/components/trading-active-operations-modal";
import { TradingChartControls } from "@/components/trading-chart-controls";
import {
  TRADING_CHART_TIMEFRAMES,
  createTradingChartDrawingTools,
  createTradingChartIndicators,
  createTradingChartTypes,
  type TradingChartDrawingTool,
  type TradingChartType,
} from "@/components/trading-chart-presets";
import {
  CandleData,
  ChartMarkerDatum,
  INITIAL_FETCH_CANDLES,
  MAX_CANDLES_IN_MEMORY,
  ResultMarkerDatum,
  VISIBLE_CANDLE_COUNT,
  disposeAm5Logo,
  getChartColors,
  getCssVar,
  getTickTimestampMs,
  isAm5Disposed,
  normalizeDateMs,
  timeframeToUnitCount,
  type ChartColors,
} from "@/lib/trading-chart";
import {
  createEntryMarkerSprite,
  createResultMarkerSprite,
} from "@/lib/trading-chart-markers";
import {
  calculateLiveOperationSellSnapshot,
  getOperationRemainingMs,
} from "@/lib/trade-operation-math";

// =================== Tipos ===================
type ChartType = TradingChartType;
type DropdownType =
  | "chartTypes"
  | "timeframes"
  | "drawingTools"
  | "indicators"
  | null;

import type { ChartEventType } from "@/hooks/useChartDebugLog";

export interface StockChartProps {
  orders: PropOrder[];
  entryMarkers: EntryMarker[];
  resultMarkers: ResultMarker[];
  onDismissResult: (operationId: string) => void;
  onCancelOrder: (id: string) => void;
  onPlaceOrder: (
    orderType: "buy" | "sell",
    amount: number,
    expirationMinutes: number,
  ) => void;
  onPriceUpdate: (price: number) => void;
  tradingPair: string;
  setTradingPair: (pair: string) => void;
  cryptos: Crypto[];
  selectedCrypto: Crypto;
  currentPrice: number;
  onCryptoSelect: (crypto: Crypto, addOnly: boolean) => void;
  onToggleFavorite: (crypto: Crypto) => void;
  onUpdateCryptos: (updatedCryptos: Crypto[]) => void;
  openCharts?: string[];
  currentChart?: string;
  onChangeChart?: (symbol: string) => void;
  onRemoveChart?: (symbol: string) => void;
  chartBackgroundUrl?: string | null;
  tradeHoverDirection?: "buy" | "sell" | null;
  debugLog?: (
    type: ChartEventType,
    message: string,
    data?: Record<string, unknown>,
  ) => void;
}

// =================== Componente ===================
export function StockChart({
  orders,
  entryMarkers,
  resultMarkers,
  onDismissResult,
  onCancelOrder,
  onPlaceOrder,
  onPriceUpdate,
  tradingPair,
  setTradingPair,
  cryptos,
  selectedCrypto,
  currentPrice,
  onCryptoSelect,
  onToggleFavorite,
  onUpdateCryptos,
  openCharts,
  currentChart,
  onChangeChart,
  onRemoveChart,
  chartBackgroundUrl,
  tradeHoverDirection = null,
  debugLog,
}: StockChartProps) {
  const t = useTranslations("StockChart");
  const playTick = useTickSound();
  const playDealWin = useTickSound("/sound_deal_win.ogg");
  const playDealLoss = useTickSound("/sound_deal_loose.ogg");
  const toast = useToast();
  const activeOperations = useAccountStore((state) => state.activeOperations);
  const selectedAccount = useAccountStore((state) => state.selectedAccount);
  const removeOperation = useAccountStore((state) => state.removeOperation);
  const addOperationResult = useAccountStore((state) => state.addOperationResult);
  const syncBalances = useAccountStore((state) => state.syncBalances);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const debugLogRef = useRef(debugLog);
  const rootRef = useRef<am5.Root | null>(null);
  const stockChartRef = useRef<am5stock.StockChart | null>(null);
  const mainPanelRef = useRef<am5stock.StockPanel | null>(null);
  const chartBackgroundRef = useRef<am5.Picture | null>(null);
  const currentPriceGlowRef = useRef<am5.Container | null>(null);
  const mainSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<am5xy.ColumnSeries | null>(null);
  const entryMarkerSeriesRef = useRef<am5xy.LineSeries | null>(null);
  const resultMarkerSeriesRef = useRef<am5xy.LineSeries | null>(null);
  const dateAxisRef = useRef<any>(null);
  const valueAxisRef = useRef<any>(null);
  const volumeYAxisRef = useRef<any>(null);
  const currentValueRangeRef = useRef<any>(null);
  const hoverValueRangeRef = useRef<any>(null);
  const drawingControlRef = useRef<any>(null);

  const indicatorsRef = useRef<{ [key: string]: any }>({});
  const orderRangesRef = useRef<Map<string, any>>(new Map());
  const currentPriceRef = useRef<number>(currentPrice);
  const chartColorsRef = useRef<ChartColors | null>(null);
  const dismissResultRef = useRef(onDismissResult);
  const chartRuntimeCleanupRef = useRef<(() => void) | null>(null);
  const drawingsByPairRef = useRef<Map<string, Array<unknown>>>(new Map());
  const activeDrawingPairRef = useRef(tradingPair);

  const generationRef = useRef(0);
  const isAtEndRef = useRef(true);
  const lastZoomTickRef = useRef(0);
  const pendingUpdateRef = useRef<{ price: number; raw: unknown } | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const toolDropdownRef = useRef<HTMLDivElement | null>(null);

  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  const [chartType, setChartType] = useState<ChartType>("candlestick");
  const [timeframe, setTimeframe] = useState<string>("1m");
  const [isSellingActiveOperations, setIsSellingActiveOperations] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [sellingOperationIds, setSellingOperationIds] = useState<string[]>([]);
  const [activeDrawingToolId, setActiveDrawingToolId] = useState<string | null>(
    null,
  );
  const [isEraserActive, setIsEraserActive] = useState(false);
  const [activeIndicators, setActiveIndicators] = useState<string[]>([]);
  const drawingColorOptions = useMemo(
    () => [
      { value: getCssVar("--platform-accent-color", "#3B82F6"), label: "Accent" },
      { value: getCssVar("--platform-success-color", "#10B981"), label: "Sucesso" },
      { value: getCssVar("--platform-danger-color", "#EF4444"), label: "Perigo" },
      { value: getCssVar("--platform-chart-price-tag-color", "#d88a31"), label: "Laranja" },
      { value: getCssVar("--platform-header-text-color", "#ffffff"), label: "Claro" },
    ],
    [],
  );
  const [currentDrawingColor, setCurrentDrawingColor] = useState(
    drawingColorOptions[0]?.value || "#3B82F6",
  );
  const isInitialLoadRef = useRef(true);
  const candlesMapRef = useRef<Map<string, CandleData[]>>(new Map());
  const updateChartDataRef = useRef<(() => Promise<unknown>) | null>(null);

  useEffect(() => {
    currentPriceRef.current = currentPrice;
  }, [currentPrice]);
  dismissResultRef.current = onDismissResult;

  useEffect(() => {
    const picture = chartBackgroundRef.current;
    if (!picture) return;
    picture.setAll({
      src: chartBackgroundUrl || "/world-map.png",
      opacity: 0.2,
      width: am5.percent(100),
      height: am5.percent(100),
      centerX: 0,
      centerY: 0,
      x: 0,
      y: 0,
      visible: true,
    });
  }, [chartBackgroundUrl]);

  debugLogRef.current = debugLog;
  const _dbg = useCallback(
    (type: ChartEventType, msg: string, data?: Record<string, unknown>) =>
      debugLogRef.current?.(type, msg, data),
    [],
  );

  const syncMarkerSeries = useCallback(() => {
    entryMarkerSeriesRef.current?.data.setAll(
      entryMarkers
        .filter((marker) => marker.pair === tradingPair)
        .map((marker) => ({
          valueX: chartService.getCandleStartTime(marker.createdAt, timeframe),
          valueY: marker.entryPrice,
          operationId: marker.operationId,
          pair: marker.pair,
          type: marker.type,
          entryPrice: marker.entryPrice,
          value: marker.value,
          timeframe: marker.timeframe,
        })),
    );

    resultMarkerSeriesRef.current?.data.setAll(
      resultMarkers
        .filter((marker) => marker.pair === tradingPair)
        .map((marker) => ({
          valueX: chartService.getCandleStartTime(marker.createdAt, timeframe),
          valueY: marker.entryPrice,
          operationId: marker.operationId,
          pair: marker.pair,
          type: marker.type,
          entryPrice: marker.entryPrice,
          value: marker.value,
          timeframe: marker.timeframe,
          result: marker.result,
          closePrice: marker.closePrice,
          profit: marker.profit,
        })),
    );
  }, [entryMarkers, resultMarkers, timeframe, tradingPair]);

  const drawingTools = useMemo(() => createTradingChartDrawingTools(t), [t]);
  const indicators = useMemo(() => createTradingChartIndicators(t), [t]);
  const timeframes = useMemo(() => TRADING_CHART_TIMEFRAMES, []);
  const chartTypes = useMemo(() => createTradingChartTypes(t), [t]);

  // =============== Y-axis auto-fit ===============
  // With strictMinMax on the ValueAxis, AmCharts will NOT auto-calculate
  // min/max from all data. We set min/max ourselves from visible candles only.
  // Smoothly lerps toward the target range for fluid transitions.
  const yTargetRef = useRef<{ min: number; max: number } | null>(null);
  const yCurrentRef = useRef<{ min: number; max: number } | null>(null);
  const yLerpRafRef = useRef<number | null>(null);

  const LERP_SPEED = 0.18; // 0-1, higher = faster convergence
  const getYAxisStep = useCallback((midpoint: number) => {
    if (midpoint >= 1000) return 5;
    if (midpoint >= 100) return 1;
    if (midpoint >= 10) return 0.5;
    if (midpoint >= 1) return 0.1;
    return 0.01;
  }, []);

  const updateTradeHoverVisuals = useCallback(() => {
    const root = rootRef.current;
    const valueAxis = valueAxisRef.current;
    const currentValueRange = currentValueRangeRef.current;
    const hoverValueRange = hoverValueRangeRef.current;
    const currentPriceGlow = currentPriceGlowRef.current;
    const mainPanel = mainPanelRef.current;
    const CHART_COLORS = chartColorsRef.current || getChartColors();

    if (!root || !valueAxis || !currentValueRange) {
      return;
    }

    const currentValue = Number(
      currentValueRange.get?.("value") ?? currentPriceRef.current,
    );
    const axisMin = Number(valueAxis.get?.("min"));
    const axisMax = Number(valueAxis.get?.("max"));
    const isBuyHover = tradeHoverDirection === "buy";
    const isSellHover = tradeHoverDirection === "sell";
    const isHoveringTrade = isBuyHover || isSellHover;
    const activeColor = isBuyHover
      ? CHART_COLORS.success
      : isSellHover
        ? CHART_COLORS.danger
        : CHART_COLORS.priceTag;

    const label = currentValueRange.get("label");
    const labelBackground = label?.get("background");

    label?.set(
      "fill",
      am5.Color.fromString(
        isHoveringTrade
          ? CHART_COLORS.text.primary
          : getCssVar("--platform-overlay-backdrop-color", "#0f172a"),
      ),
    );
    labelBackground?.setAll({
      fill: am5.Color.fromString(activeColor),
      fillOpacity: 1,
    });
    currentValueRange.get("grid")?.setAll({
      strokeOpacity: 0.85,
      stroke: am5.Color.fromString(activeColor),
      strokeWidth: 1,
    });

    if (
      !hoverValueRange ||
      !Number.isFinite(currentValue) ||
      !Number.isFinite(axisMin) ||
      !Number.isFinite(axisMax)
    ) {
      currentPriceGlow?.set("visible", false);
      return;
    }

    const axisFill = hoverValueRange.get("axisFill");

    if (!isHoveringTrade) {
      hoverValueRange.setAll({ value: currentValue, endValue: currentValue });
      axisFill?.setAll({
        visible: false,
        fillOpacity: 0,
      });
      currentPriceGlow?.set("visible", false);
      return;
    }

    const clampedValue = Math.min(Math.max(currentValue, axisMin), axisMax);
    const rangeStart = isBuyHover ? clampedValue : axisMin;
    const rangeEnd = isBuyHover ? axisMax : clampedValue;
    const hoverColor = am5.Color.fromString(activeColor);
    const fillStops = isBuyHover
      ? [
          { color: hoverColor, opacity: 0 },
          { color: hoverColor, opacity: 0.22 },
        ]
      : [
          { color: hoverColor, opacity: 0.22 },
          { color: hoverColor, opacity: 0 },
        ];

    hoverValueRange.setAll({
      value: rangeStart,
      endValue: rangeEnd,
    });
    axisFill?.setAll({
      visible: rangeEnd > rangeStart,
      fill: hoverColor,
      fillOpacity: 1,
      fillGradient: am5.LinearGradient.new(root, {
        rotation: 90,
        stops: fillStops,
      }),
    });

    if (currentPriceGlow && mainPanel) {
      const glowOuter = currentPriceGlow.children.getIndex(
        0,
      ) as am5.Circle | undefined;
      const glowInner = currentPriceGlow.children.getIndex(
        1,
      ) as am5.Circle | undefined;
      const position = valueAxis.valueToPosition(clampedValue);
      const coordinate = valueAxis.get("renderer").positionToCoordinate(position);
      const plotWidth =
        mainPanel.plotContainer.width?.() ??
        mainPanel.plotContainer.getPrivate?.("width") ??
        0;

      currentPriceGlow.setAll({
        visible: true,
        x: Math.max(18, plotWidth - 30),
        y: coordinate,
      });
      glowOuter?.setAll({
        fill: hoverColor,
        visible: true,
      });
      glowInner?.setAll({
        fill: hoverColor,
        visible: true,
      });
    }
  }, [tradeHoverDirection]);

  const fitYAxisToVisibleData = useCallback((instant = false) => {
    const series = mainSeriesRef.current;
    const dateAxis = dateAxisRef.current;
    const valueAxis = valueAxisRef.current;
    if (!series?.data || !dateAxis || !valueAxis) return;

    const n = series.data.length;
    if (n === 0) return;

    // GaplessDateAxis: start/end are 0-1 fractions mapping to data indices
    const s = dateAxis.get("start") ?? 0;
    const e = dateAxis.get("end") ?? 1;
    const iStart = Math.max(0, Math.floor(s * n));
    const iEnd = Math.min(n, Math.ceil(e * n));

    let lo = Infinity;
    let hi = -Infinity;
    for (let i = iStart; i < iEnd; i++) {
      const c = series.data.getIndex(i) as CandleData | undefined;
      if (!c) continue;
      if (c.Low < lo) lo = c.Low;
      if (c.High > hi) hi = c.High;
    }

    if (!Number.isFinite(lo) || !Number.isFinite(hi)) return;

    if (hi <= lo) {
      const fallbackStep = getYAxisStep(
        lo || hi || currentPriceRef.current || 1,
      );
      const epsilon = Math.max(
        fallbackStep * 0.6,
        Math.abs(lo || hi || 1) * 0.0008,
      );
      lo -= epsilon;
      hi += epsilon;
    }

    const range = hi - lo;
    const bottomPad = range * 0.18;
    const topPad = range * 0.14;
    const midpoint = (hi + lo) / 2;
    const yStep = getYAxisStep(midpoint);
    const targetMin = Math.floor((lo - bottomPad) / yStep) * yStep;
    const targetMax = Math.ceil((hi + topPad) / yStep) * yStep;
    yTargetRef.current = { min: targetMin, max: targetMax };

    // First call or explicit instant — jump directly and cancel any running lerp
    if (instant || !yCurrentRef.current) {
      if (yLerpRafRef.current !== null) {
        cancelAnimationFrame(yLerpRafRef.current);
        yLerpRafRef.current = null;
      }
      yCurrentRef.current = { min: targetMin, max: targetMax };
      valueAxis.set("min", targetMin);
      valueAxis.set("max", targetMax);
      updateTradeHoverVisuals();
      return;
    }

    // Start lerp loop if not already running
    if (yLerpRafRef.current !== null) return;

    const lerpStep = () => {
      const target = yTargetRef.current;
      const current = yCurrentRef.current;
      const va = valueAxisRef.current;
      if (!target || !current || !va) {
        yLerpRafRef.current = null;
        return;
      }

      current.min += (target.min - current.min) * LERP_SPEED;
      current.max += (target.max - current.max) * LERP_SPEED;

      va.set("min", current.min);
      va.set("max", current.max);
      updateTradeHoverVisuals();

      // Stop when close enough
      const range = target.max - target.min;
      const epsilon = range * 0.001;
      if (
        Math.abs(current.min - target.min) < epsilon &&
        Math.abs(current.max - target.max) < epsilon
      ) {
        current.min = target.min;
        current.max = target.max;
        va.set("min", target.min);
        va.set("max", target.max);
        updateTradeHoverVisuals();
        yLerpRafRef.current = null;
        return;
      }

      yLerpRafRef.current = requestAnimationFrame(lerpStep);
    };

    yLerpRafRef.current = requestAnimationFrame(lerpStep);
  }, [getYAxisStep, updateTradeHoverVisuals]);

  // =============== Live update ===============
  const applyLiveUpdateRef = useRef<
    ((price: number, raw?: unknown) => void) | null
  >(null);

  const _applyLiveUpdate = useCallback(
    (price: number, raw?: unknown) => {
      const root = rootRef.current;
      const stockChart = stockChartRef.current;
      const series = mainSeriesRef.current;
      const volumeSeries = volumeSeriesRef.current;
      const dateAxis = dateAxisRef.current;
      const cvdi = currentValueRangeRef.current;
      if (!root || !stockChart || !series || !dateAxis || !series.data) return;

      const { timeUnit, count } = timeframeToUnitCount(timeframe);
      const nowMs = getTickTimestampMs(raw);
      const newPrice = typeof price === "number" ? price : Number(price);
      if (!Number.isFinite(newPrice)) return;
      const rawRecord =
        raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;
      const rawVolume = rawRecord?.v;
      const volFromRaw =
        typeof rawVolume === "number" && Number.isFinite(rawVolume)
          ? rawVolume
          : undefined;

      const intervalMs =
        count *
        (timeUnit === "minute"
          ? 60000
          : timeUnit === "hour"
            ? 3600000
            : timeUnit === "day"
              ? 86400000
              : timeUnit === "week"
                ? 604800000
                : 60000);
      const currentCandleStart = Math.floor(nowMs / intervalMs) * intervalMs;

      const n = series.data.length;
      const last = (n > 0 ? series.data.getIndex(n - 1) : null) as
        | CandleData
        | null;
      const lastDateMs = last ? normalizeDateMs(last.Date) : 0;

      if (last && lastDateMs === currentCandleStart) {
        const updated: CandleData = {
          Date: last.Date,
          Open: last.Open,
          High: Math.max(last.High, newPrice),
          Low: Math.min(last.Low, newPrice),
          Close: newPrice,
          Volume:
            typeof volFromRaw === "number"
              ? last.Volume + volFromRaw
              : last.Volume,
        };
        series.data.setIndex(n - 1, updated);
        if (volumeSeries && !volumeSeries.get("forceHidden")) {
          volumeSeries.data.setIndex(volumeSeries.data.length - 1, updated);
        }
      } else {
        const nextOpen = last ? last.Close : newPrice;
        const seedRange = Math.max(
          getYAxisStep(newPrice) * 0.08,
          Math.abs(newPrice || 1) * 0.00015,
        );
        const newCandle: CandleData = {
          Date: currentCandleStart,
          Open: nextOpen,
          High: Math.max(nextOpen, newPrice) + seedRange,
          Low: Math.min(nextOpen, newPrice) - seedRange,
          Close: newPrice,
          Volume: volFromRaw || 0,
        };
        series.data.push(newCandle);
        if (volumeSeries) volumeSeries.data.push(newCandle);
        _dbg(
          "candle_new",
          `New @ ${new Date(currentCandleStart).toLocaleTimeString()} O:${newCandle.Open.toFixed(5)}`,
          { date: currentCandleStart, totalCandles: series.data.length },
        );

        if (series.data.length > MAX_CANDLES_IN_MEMORY) {
          series.data.removeIndex(0);
          volumeSeries?.data.removeIndex(0);
        }
      }

      // Price indicator
      if (currentPriceRef.current !== newPrice) {
        currentPriceRef.current = newPrice;
        onPriceUpdate(newPrice);
        cvdi?.set?.("value", newPrice);
        const label = cvdi?.get("label");
        label?.set("text", stockChart.getNumberFormatter().format(newPrice));
        updateTradeHoverVisuals();
      }

      // X-axis auto-follow (throttled every 10 ticks)
      // dateAxis.zoom triggers "rangechanged" which already refits Y-axis,
      // so we only refit Y manually when zoom is NOT triggered (view is static).
      const cnt = series.data.length;
      lastZoomTickRef.current += 1;
      let didZoom = false;
      if (lastZoomTickRef.current >= 20) {
        lastZoomTickRef.current = 0;
        if (dateAxis && cnt > VISIBLE_CANDLE_COUNT && isAtEndRef.current) {
          const startIndex = cnt - VISIBLE_CANDLE_COUNT;
          dateAxis.zoom(startIndex / cnt, 1, false);
          didZoom = true;
        }
      }

      // Only refit Y manually when no zoom happened (zoom already triggers refit via rangechanged)
      if (!didZoom) {
        fitYAxisToVisibleData();
      }
    },
    [onPriceUpdate, timeframe, fitYAxisToVisibleData, updateTradeHoverVisuals],
  );

  applyLiveUpdateRef.current = _applyLiveUpdate;

  const updateLiveDataFromQuote = useCallback((price: number, raw?: unknown) => {
    pendingUpdateRef.current = { price, raw };
    if (rafIdRef.current !== null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      const pending = pendingUpdateRef.current;
      pendingUpdateRef.current = null;
      if (pending) applyLiveUpdateRef.current?.(pending.price, pending.raw);
    });
  }, []);

  const saveDrawingsForPair = useCallback((pair: string) => {
    if (!pair) return;

    const control = drawingControlRef.current;
    if (!control) return;

    try {
      const serialized = control.serializeDrawings("object");
      if (Array.isArray(serialized) && serialized.length > 0) {
        drawingsByPairRef.current.set(pair, serialized);
      } else {
        drawingsByPairRef.current.delete(pair);
      }
    } catch {}
  }, []);

  const deactivateDrawingMode = useCallback(() => {
    const control = drawingControlRef.current;
    if (!control) return;

    control.set("active", false);
    control.setEraser(false);
    setActiveDrawingToolId(null);
    setIsEraserActive(false);
  }, []);

  const applyDrawingColor = useCallback((color: string) => {
    const control = drawingControlRef.current;
    setCurrentDrawingColor(color);
    control?.setAll({
      strokeColor: am5.Color.fromString(color),
      fillColor: am5.Color.fromString(color),
      labelFill: am5.Color.fromString(color),
    });
  }, []);

  // =============== Data loading ===============
  const updateChartData = useCallback(async () => {
    const CHART_COLORS = chartColorsRef.current || getChartColors();
    const root = rootRef.current;
    const stockChart = stockChartRef.current;
    const mainPanel = mainPanelRef.current;
    const valueAxis = valueAxisRef.current;
    const dateAxis = dateAxisRef.current;
    if (!root || !stockChart || !mainPanel || !valueAxis || !dateAxis) {
      setError(t("chartNotReady"));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const myGen = ++generationRef.current;
      saveDrawingsForPair(activeDrawingPairRef.current);
      drawingControlRef.current?.clearDrawings();
      chartRuntimeCleanupRef.current?.();
      chartRuntimeCleanupRef.current = null;
      mainSeriesRef.current?.data?.clear?.();
      volumeSeriesRef.current?.data?.clear?.();
      entryMarkerSeriesRef.current?.data?.clear?.();
      resultMarkerSeriesRef.current?.data?.clear?.();
      mainSeriesRef.current?.dispose();
      volumeSeriesRef.current?.dispose();
      entryMarkerSeriesRef.current?.dispose();
      resultMarkerSeriesRef.current?.dispose();
      mainSeriesRef.current = null;
      volumeSeriesRef.current = null;
      entryMarkerSeriesRef.current = null;
      resultMarkerSeriesRef.current = null;

      Object.values(indicatorsRef.current).forEach((ind: any) =>
        ind.dispose?.(),
      );
      indicatorsRef.current = {};
      setActiveIndicators([]);
      mainPanel.series.clear();

      const cacheKey = `${tradingPair}_${timeframe}`;
      let dataToLoad: CandleData[] = candlesMapRef.current.get(cacheKey) || [];
      const cached = dataToLoad.length > 0;
      if (!cached) {
        _dbg("data_load", `Fetching ${tradingPair} ${timeframe}...`);
        dataToLoad = await chartService.fetchCandles(
          tradingPair,
          timeframe,
          INITIAL_FETCH_CANDLES,
        );
        candlesMapRef.current.set(cacheKey, dataToLoad);
      }

      const isStaleRun =
        generationRef.current !== myGen ||
        rootRef.current !== root ||
        stockChartRef.current !== stockChart ||
        mainPanelRef.current !== mainPanel ||
        isAm5Disposed(root) ||
        isAm5Disposed(mainPanel) ||
        isAm5Disposed(dateAxis) ||
        isAm5Disposed(valueAxis);
      if (isStaleRun) {
        return;
      }

      _dbg(
        "data_load",
        `${tradingPair} ${timeframe}: ${dataToLoad.length} candles ${cached ? "(cache)" : "(fetched)"}`,
        { pair: tradingPair, timeframe, candles: dataToLoad.length, cached },
      );

      const { timeUnit, count } = timeframeToUnitCount(timeframe);
      dateAxis.set("baseInterval", { timeUnit, count });

      let newMainSeries: any;
      switch (chartType) {
        case "line":
          newMainSeries = mainPanel.series.push(
            am5xy.LineSeries.new(root, {
              name: tradingPair,
              valueXField: "Date",
              valueYField: "Close",
              xAxis: dateAxis,
              yAxis: valueAxis,
              stroke: am5.color(CHART_COLORS.candle.up),
              tooltip: am5.Tooltip.new(root, {
                pointerOrientation: "horizontal",
                labelText: "[bold]{name}[/]\nPrice: {valueY}",
              }),
            }),
          );
          break;
        default: {
          const SeriesType =
            chartType === "ohlc" ? am5xy.OHLCSeries : am5xy.CandlestickSeries;
          newMainSeries = mainPanel.series.push(
            SeriesType.new(root, {
              name: tradingPair,
              valueXField: "Date",
              openValueYField: "Open",
              highValueYField: "High",
              lowValueYField: "Low",
              valueYField: "Close",
              xAxis: dateAxis,
              yAxis: valueAxis,
            }),
          );
          if (
            chartType === "candlestick" &&
            newMainSeries instanceof am5xy.CandlestickSeries
          ) {
            const candleUpColor = am5.color(CHART_COLORS.candle.up);
            const candleDownColor = am5.color(CHART_COLORS.candle.down);
            newMainSeries.columns.template.setAll({
              cornerRadiusTL: 1,
              cornerRadiusTR: 1,
              strokeOpacity: 1,
              width: am5.percent(115),
              fillOpacity: 0.8,
              strokeWidth: 1,
            });
            newMainSeries.columns.template.adapters.add(
              "fill",
              (_fill: any, target: any) =>
                target.dataItem?.get("valueY", 0) >=
                target.dataItem?.get("openValueY", 0)
                  ? candleUpColor
                  : candleDownColor,
            );
            newMainSeries.columns.template.adapters.add(
              "stroke",
              (_stroke: any, target: any) =>
                target.dataItem?.get("valueY", 0) >=
                target.dataItem?.get("openValueY", 0)
                  ? candleUpColor
                  : candleDownColor,
            );
          }
          break;
        }
      }
      mainSeriesRef.current = newMainSeries;
      stockChart.set("stockSeries", newMainSeries);

      const newVolumeSeries = mainPanel.series.push(
        am5xy.ColumnSeries.new(root, {
          name: "Volume",
          valueXField: "Date",
          valueYField: "Volume",
          xAxis: dateAxis,
          yAxis: volumeYAxisRef.current!,
          forceHidden: true,
        }),
      );
      newVolumeSeries.columns.template.setAll({
        cornerRadiusTL: 2,
        cornerRadiusTR: 2,
        strokeOpacity: 0,
      });
      const volUpColor = am5.color(CHART_COLORS.volume.up);
      const volDownColor = am5.color(CHART_COLORS.volume.down);
      newVolumeSeries.columns.template.adapters.add("fill", (_fill, target) => {
        const idx = target.dataItem?.get("index" as any);
        if (idx == null) return volDownColor;
        const priceDataItem = newMainSeries.dataItems[idx];
        return priceDataItem &&
          priceDataItem.get("valueY", 0) >= priceDataItem.get("openValueY", 0)
          ? volUpColor
          : volDownColor;
      });
      volumeSeriesRef.current = newVolumeSeries;
      stockChart.set("volumeSeries", newVolumeSeries);

      const newEntryMarkerSeries = mainPanel.series.push(
        am5xy.LineSeries.new(root, {
          name: "Entry markers",
          valueXField: "valueX",
          valueYField: "valueY",
          xAxis: dateAxis,
          yAxis: valueAxis,
          maskBullets: false,
          connect: false,
        }),
      );
      newEntryMarkerSeries.strokes.template.setAll({
        strokeOpacity: 0,
        visible: false,
      });
      newEntryMarkerSeries.fills.template.setAll({
        fillOpacity: 0,
        visible: false,
      });
      newEntryMarkerSeries.bullets.push((_root, _series, dataItem) =>
        am5.Bullet.new(root, {
          sprite: createEntryMarkerSprite(
            root,
            dataItem.dataContext as ChartMarkerDatum,
            CHART_COLORS,
          ),
        }),
      );
      entryMarkerSeriesRef.current = newEntryMarkerSeries;

      const newResultMarkerSeries = mainPanel.series.push(
        am5xy.LineSeries.new(root, {
          name: "Result markers",
          valueXField: "valueX",
          valueYField: "valueY",
          xAxis: dateAxis,
          yAxis: valueAxis,
          maskBullets: false,
          connect: false,
        }),
      );
      newResultMarkerSeries.strokes.template.setAll({
        strokeOpacity: 0,
        visible: false,
      });
      newResultMarkerSeries.fills.template.setAll({
        fillOpacity: 0,
        visible: false,
      });
      newResultMarkerSeries.bullets.push((_root, _series, dataItem) =>
        am5.Bullet.new(root, {
          sprite: createResultMarkerSprite(
            root,
            dataItem.dataContext as ResultMarkerDatum,
            CHART_COLORS,
            (operationId) => dismissResultRef.current(operationId),
          ),
        }),
      );
      resultMarkerSeriesRef.current = newResultMarkerSeries;

      newMainSeries.data.setAll(dataToLoad);
      newVolumeSeries.data.setAll(dataToLoad);
      syncMarkerSeries();

      const serializedDrawings = drawingsByPairRef.current.get(tradingPair);
      if (serializedDrawings?.length) {
        drawingControlRef.current?.unserializeDrawings(serializedDrawings);
      }

      if (dataToLoad.length > 0) {
        const lastCandle = dataToLoad[dataToLoad.length - 1];
        onPriceUpdate(lastCandle.Close);
        currentValueRangeRef.current?.set?.("value", lastCandle.Close);
        currentValueRangeRef.current
          ?.get?.("label")
          ?.set(
            "text",
            stockChart.getNumberFormatter().format(lastCandle.Close),
          );
        updateTradeHoverVisuals();

        // Initial X-axis zoom (once, after first data validation)
        newMainSeries.events.once?.("datavalidated", () => {
          const len = newMainSeries.data.length;
          const startIndex = Math.max(0, len - VISIBLE_CANDLE_COUNT);
          const start = len > 0 ? startIndex / len : 0;
          dateAxis.zoom(start, 1, false);
          isAtEndRef.current = true;
          fitYAxisToVisibleData(true);
        });
      }

      // Refit Y when the user scrolls/zooms the X-axis (instant for direct user action)
      // Also track whether the view is pinned to the end for auto-follow
      const yFitOnScroll = dateAxis.events.on("rangechanged" as any, () => {
        const end = dateAxis.get("end") ?? 1;
        isAtEndRef.current = end > 0.98;
        fitYAxisToVisibleData(true);
      });

      const priceCb = (p: number, raw?: unknown) => {
        if (
          generationRef.current !== myGen ||
          rootRef.current !== root ||
          isAm5Disposed(root)
        ) {
          return;
        }
        updateLiveDataFromQuote(p, raw);
      };
      subscribeToPriceUpdates(tradingPair, priceCb);
      chartRuntimeCleanupRef.current = () => {
        try {
          unsubscribeFromPriceUpdates(tradingPair, priceCb);
        } catch {}
        try {
          yFitOnScroll?.dispose();
        } catch {}
      };

      setLoading(false);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update chart.";

      if (errorMessage.includes("EventDispatcher is disposed")) {
        return;
      }
      setError(`Load failed: ${errorMessage}`);
      setLoading(false);
    }
  }, [
    saveDrawingsForPair,
    tradingPair,
    timeframe,
    chartType,
    onPriceUpdate,
    updateLiveDataFromQuote,
    fitYAxisToVisibleData,
    syncMarkerSeries,
    updateTradeHoverVisuals,
  ]);

  useEffect(() => {
    updateChartDataRef.current = updateChartData;
  }, [updateChartData]);

  useEffect(() => {
    if (activeDrawingPairRef.current === tradingPair) {
      return;
    }

    saveDrawingsForPair(activeDrawingPairRef.current);
    activeDrawingPairRef.current = tradingPair;
  }, [tradingPair, saveDrawingsForPair]);

  useEffect(() => {
    syncMarkerSeries();
  }, [syncMarkerSeries]);

  useEffect(() => {
    updateTradeHoverVisuals();
  }, [updateTradeHoverVisuals]);

  // Dynamic number format
  useEffect(() => {
    const valueAxis = valueAxisRef.current;
    if (valueAxis) {
      valueAxis.set(
        "numberFormat",
        currentPrice > 100 ? "#,###.00" : "#,###.#####",
      );
      valueAxis.set("extraTooltipPrecision", currentPrice > 100 ? 2 : 5);
    }
  }, [currentPrice]);

  // Pair/timeframe/type changes
  useEffect(() => {
    if (isInitialLoadRef.current) return;
    _dbg(
      "pair_change",
      `Switching to ${tradingPair} ${timeframe} ${chartType}`,
    );
    updateChartData().catch((err) =>
      setError(err.message || t("failedToUpdateChart")),
    );
  }, [tradingPair, timeframe, chartType, updateChartData, t, _dbg]);

  // Order ranges
  useEffect(() => {
    const valueAxis = valueAxisRef.current;
    if (!valueAxis) return;
    const CHART_COLORS = chartColorsRef.current || getChartColors();

    const currentOrderIds = new Set(orders.map((o) => o.id));
    const newOrderRanges = new Map<string, any>();

    orderRangesRef.current.forEach((range, orderId) => {
      if (!currentOrderIds.has(orderId)) {
        valueAxis.axisRanges.removeValue(range);
      } else {
        newOrderRanges.set(orderId, range);
      }
    });

    orders.forEach((order) => {
      if (!newOrderRanges.has(order.id)) {
        const range = valueAxis.createAxisRange(
          valueAxis.makeDataItem({ value: order.price }),
        );
        const orderColor =
          order.type === "buy" ? CHART_COLORS.success : CHART_COLORS.danger;
        range.get("grid")?.setAll({
          stroke: am5.color(orderColor),
          strokeDasharray: [4, 4],
          strokeOpacity: 0.85,
          strokeWidth: 1,
          visible: true,
        });
        range.get("label")?.setAll({ forceHidden: true, visible: false });
        newOrderRanges.set(order.id, range);
      }
    });

    orderRangesRef.current = newOrderRanges;
  }, [orders]);

  // =============== Mount ===============
  useEffect(() => {
    if (!chartRef.current) return;

    const CHART_COLORS = getChartColors();
    chartColorsRef.current = CHART_COLORS;
    const root = am5.Root.new(chartRef.current!);
    rootRef.current = root;
    disposeAm5Logo(root);
    root.numberFormatter.set("numberFormat", "#,###.#####");
    root.fps = 60;

    const myTheme = am5.Theme.new(root);
    myTheme
      .rule("Grid")
      .setAll({
        stroke: am5.color(CHART_COLORS.grid),
        strokeOpacity: 0.2,
        strokeWidth: 1,
      });
    myTheme
      .rule("Label")
      .setAll({
        fill: am5.color(CHART_COLORS.text.secondary),
        fontSize: 11,
        fontFamily: "Inter, system-ui, sans-serif",
      });
    root.setThemes([am5themes_Dark.new(root), myTheme]);

    const stockChart = root.container.children.push(
      am5stock.StockChart.new(root, {
        paddingRight: 0,
        paddingLeft: 0,
        paddingTop: 0,
        paddingBottom: 0,
        background: am5.Rectangle.new(root, {
          fill: am5.color(CHART_COLORS.background),
          fillOpacity: 0.32,
        }),
      }),
    );
    stockChartRef.current = stockChart;

    const mainPanel = stockChart.panels.push(
      am5stock.StockPanel.new(root, {
        wheelY: "zoomX",
        wheelX: "none",
        panX: true,
        panY: false,
        pinchZoomX: true,
        pinchZoomY: false,
        height: am5.percent(100),
        width: am5.percent(100),
        background: am5.Rectangle.new(root, {
          fill: am5.color(CHART_COLORS.panel),
          fillOpacity: 0.14,
          stroke: am5.color(CHART_COLORS.grid),
          strokeOpacity: 0.1,
        }),
      }),
    );
    mainPanelRef.current = mainPanel;

    chartBackgroundRef.current = mainPanel.plotContainer.children.unshift(
      am5.Picture.new(root, {
        width: am5.percent(100),
        height: am5.percent(100),
        centerX: 0,
        centerY: 0,
        x: 0,
        y: 0,
        isMeasured: false,
        src: chartBackgroundUrl || "/world-map.png",
        opacity: 0.2,
        interactive: false,
      }),
    );
    currentPriceGlowRef.current = mainPanel.plotContainer.children.push(
      am5.Container.new(root, {
        isMeasured: false,
        width: 36,
        height: 36,
        centerX: am5.p50,
        centerY: am5.p50,
        visible: false,
        interactive: false,
      }),
    );
    currentPriceGlowRef.current.children.push(
      am5.Circle.new(root, {
        radius: 16,
        centerX: am5.p50,
        centerY: am5.p50,
        fillOpacity: 0.22,
        strokeOpacity: 0,
        visible: false,
      }),
    );
    currentPriceGlowRef.current.children.push(
      am5.Circle.new(root, {
        radius: 4,
        centerX: am5.p50,
        centerY: am5.p50,
        fillOpacity: 0.95,
        strokeOpacity: 0,
        visible: false,
      }),
    );

    const valueAxis = mainPanel.yAxes.push(
      am5xy.ValueAxis.new(root, {
        strictMinMax: true,
        renderer: am5xy.AxisRendererY.new(root, {
          inside: true,
          opposite: true,
          minGridDistance: 76,
        }),
        tooltip: am5.Tooltip.new(root, { pointerOrientation: "left" }),
        numberFormat: "#,###.#####",
        extraTooltipPrecision: 5,
      }),
    );
    valueAxis
      .get("renderer")
      .labels.template.setAll({
        fill: am5.color(CHART_COLORS.text.secondary),
        fontSize: 12,
        fontWeight: "500",
        paddingRight: 15,
      });
    valueAxis
      .get("renderer")
      .grid.template.setAll({
        stroke: am5.color(CHART_COLORS.grid),
        strokeOpacity: 0.1,
      });
    valueAxisRef.current = valueAxis;

    const dateAxis = mainPanel.xAxes.push(
      am5xy.GaplessDateAxis.new(root, {
        extraMax: 0.03,
        baseInterval: { timeUnit: "minute", count: 1 },
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 500,
          minorGridEnabled: true,
        }),
        tooltip: am5.Tooltip.new(root, {}),
      }),
    );
    dateAxis
      .get("renderer")
      .labels.template.setAll({
        fill: am5.color(CHART_COLORS.text.secondary),
        fontSize: 12,
        fontWeight: "500",
        paddingTop: 15,
      });
    dateAxis
      .get("renderer")
      .grid.template.setAll({
        stroke: am5.color(CHART_COLORS.grid),
        strokeOpacity: 0.2,
      });
    dateAxisRef.current = dateAxis;

    // isAtEndRef tracking is done inside updateChartData's rangechanged listener

    // Current price indicator — initialize without a value (will be set on first data load)
    const cvdi = valueAxis.createAxisRange(
      valueAxis.makeDataItem({ value: 0 }),
    );
    currentValueRangeRef.current = cvdi;
    cvdi.get("label")?.setAll({
      text: "",
      fill: am5.Color.fromString(
        getCssVar("--platform-overlay-backdrop-color", "#0f172a"),
      ),
      background: am5.PointedRectangle.new(root, {
        fill: am5.Color.fromString(CHART_COLORS.priceTag),
        fillOpacity: 1,
        strokeOpacity: 0,
        pointerBaseWidth: 16,
        pointerLength: 10,
        pointerX: 0,
        pointerY: 17,
        cornerRadius: 0,
      }),
      paddingLeft: 16,
      paddingRight: 14,
      paddingTop: 6,
      paddingBottom: 6,
      fontSize: 12,
      fontWeight: "700",
      fontFamily: "monospace",
      location: 1,
    });
    cvdi.get("grid")?.setAll({
      strokeOpacity: 0.85,
      stroke: am5.Color.fromString(CHART_COLORS.priceTag),
      strokeWidth: 1,
    });

    const hoverRange = valueAxis.createAxisRange(
      valueAxis.makeDataItem({ value: 0, endValue: 0 }),
    );
    hoverValueRangeRef.current = hoverRange;
    hoverRange.get("grid")?.setAll({
      forceHidden: true,
      visible: false,
      strokeOpacity: 0,
    });
    hoverRange.get("label")?.setAll({
      forceHidden: true,
      visible: false,
    });
    hoverRange.get("axisFill")?.setAll({
      visible: false,
      fillOpacity: 0,
      strokeOpacity: 0,
    });

    const volYAxis = mainPanel.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
        forceHidden: true,
      }),
    );
    volYAxis.get("renderer").labels.template.setAll({ forceHidden: true });
    volYAxis.get("renderer").grid.template.setAll({ forceHidden: true });
    volumeYAxisRef.current = volYAxis;

    const cursor = mainPanel.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        yAxis: valueAxis,
        xAxis: dateAxis,
        behavior: "none",
      }),
    );
    cursor.lineX.setAll({
      stroke: am5.color(CHART_COLORS.text.muted),
      strokeOpacity: 0.5,
      strokeDasharray: [2, 2],
    });
    cursor.lineY.setAll({
      stroke: am5.color(CHART_COLORS.text.muted),
      strokeOpacity: 0.5,
      strokeDasharray: [2, 2],
    });

    drawingControlRef.current = am5stock.DrawingControl.new(root, {
      stockChart,
      tools: [
        "Trend Line",
        "Horizontal Line",
        "Horizontal Ray",
        "Vertical Line",
        "Label",
        "Callout",
        "Rectangle",
        "Fibonacci",
        "Doodle",
      ] as any,
      scrollable: true,
      snapToData: true,
      strokeColor: am5.Color.fromString(CHART_COLORS.accent),
      strokeWidth: 2,
      strokeWidths: [1, 2, 3, 5],
      strokeDasharrays: [[], [6, 4], [2, 2]],
      fillColor: am5.Color.fromString(CHART_COLORS.accent),
      fillOpacity: 0.08,
      labelFill: am5.Color.fromString(CHART_COLORS.text.primary),
      labelFontSize: 12,
      toolSettings: {
        "Trend Line": { showExtension: false },
        "Horizontal Line": { showExtension: false },
        "Horizontal Ray": { showExtension: true },
        Label: { labelFontSize: 12, labelFontWeight: "600" },
        Callout: { labelFontSize: 12, fillOpacity: 0.12 },
        Rectangle: { fillOpacity: 0.08 },
        Fibonacci: { fillOpacity: 0.05 },
      },
    });

    updateChartDataRef
      .current?.()
      .then(() => (isInitialLoadRef.current = false))
      .catch((err) =>
        setError(err.message || "Failed to initialize chart data."),
      );

    return () => {
      saveDrawingsForPair(activeDrawingPairRef.current);
      generationRef.current++;
      chartRuntimeCleanupRef.current?.();
      chartRuntimeCleanupRef.current = null;
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      if (yLerpRafRef.current !== null) {
        cancelAnimationFrame(yLerpRafRef.current);
        yLerpRafRef.current = null;
      }
      drawingControlRef.current = null;
      rootRef.current?.dispose();
      rootRef.current = null;
      chartBackgroundRef.current = null;
      currentPriceGlowRef.current = null;
      hoverValueRangeRef.current = null;
      orderRangesRef.current.clear();
    };
  }, [saveDrawingsForPair]);

  // =============== Controls ===============
  const toggleDropdown = useCallback(
    (dropdown: DropdownType) =>
      setActiveDropdown((prev) => (prev === dropdown ? null : dropdown)),
    [],
  );
  const closeAllDropdowns = useCallback(() => setActiveDropdown(null), []);

  const changeTimeframe = useCallback(
    (newTimeframe: string) => {
      if (timeframe !== newTimeframe) {
        setTimeframe(newTimeframe);
        _dbg("timeframe_change", `${timeframe} → ${newTimeframe}`);
      }
      closeAllDropdowns();
    },
    [timeframe, _dbg, closeAllDropdowns],
  );

  const changeChartType = useCallback(
    (type: ChartType) => {
      if (chartType !== type) {
        setChartType(type);
        _dbg("chart_type_change", `${chartType} → ${type}`);
      }
      closeAllDropdowns();
    },
    [chartType, _dbg, closeAllDropdowns],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        activeDropdown &&
        !(event.target as Element).closest(".dropdown-container")
      )
        closeAllDropdowns();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown, closeAllDropdowns]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeDrawingToolId || isEraserActive) {
          deactivateDrawingMode();
        }
        if (activeDropdown) {
          closeAllDropdowns();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeDropdown,
    activeDrawingToolId,
    closeAllDropdowns,
    deactivateDrawingMode,
    isEraserActive,
  ]);

  const activateDrawingTool = useCallback(
    (toolId: string) => {
      const control = drawingControlRef.current;
      if (!control) return;
      if (activeDrawingToolId === toolId && !isEraserActive) {
        control.set("active", false);
        setActiveDrawingToolId(null);
      } else {
        if (isEraserActive) {
          control.setEraser(false);
          setIsEraserActive(false);
        }
        control.setAll({
          active: true,
          tool: toolId,
          snapToData: true,
          strokeColor: am5.Color.fromString(currentDrawingColor),
          fillColor: am5.Color.fromString(currentDrawingColor),
          labelFill: am5.Color.fromString(currentDrawingColor),
        });
        setActiveDrawingToolId(toolId);
      }
      closeAllDropdowns();
    },
    [activeDrawingToolId, closeAllDropdowns, currentDrawingColor, isEraserActive],
  );

  const toggleDrawingEraser = useCallback(() => {
    const control = drawingControlRef.current;
    if (!control) return;
    if (isEraserActive) {
      control.setEraser(false);
      setIsEraserActive(false);
    } else {
      if (activeDrawingToolId) {
        control.set("active", false);
        setActiveDrawingToolId(null);
      }
      control.setEraser(true);
      setIsEraserActive(true);
    }
    closeAllDropdowns();
  }, [isEraserActive, activeDrawingToolId, closeAllDropdowns]);

  const clearAllChartDrawings = useCallback(() => {
    drawingControlRef.current?.clearDrawings();
    drawingsByPairRef.current.delete(tradingPair);
    setActiveDrawingToolId(null);
    setIsEraserActive(false);
    drawingControlRef.current?.set("active", false);
    closeAllDropdowns();
  }, [closeAllDropdowns, tradingPair]);

  const addIndicator = useCallback(
    (indicatorId: string) => {
      const root = rootRef.current;
      const stockChart = stockChartRef.current;
      const mainSeries = mainSeriesRef.current;
      const CHART_COLORS = chartColorsRef.current || getChartColors();
      if (!root || !stockChart || !mainSeries) return;

      if (activeIndicators.includes(indicatorId)) {
        const indicatorEntry = indicatorsRef.current[indicatorId];
        if (indicatorEntry) {
          if (indicatorEntry.panel)
            stockChart.panels.removeValue(indicatorEntry.panel);
          indicatorEntry.dispose?.();
          delete indicatorsRef.current[indicatorId];
        }
        _dbg("indicator_remove", indicatorId);
        setActiveIndicators((prev) => prev.filter((id) => id !== indicatorId));
        closeAllDropdowns();
        return;
      }

      if (activeIndicators.length >= 2 && indicatorId !== "Volume") return;

      const commonSettings = {
        stockChart,
        stockSeries: mainSeries,
        legend: undefined as any,
      };
      let indicatorInstance: any;
      let panelInstance: am5stock.StockPanel | undefined;

      switch (indicatorId) {
        case "MovingAverage":
          indicatorInstance = am5stock.MovingAverage.new(root, {
            ...commonSettings,
            period: 20,
            field: "Close",
            seriesColor: am5.Color.fromString(CHART_COLORS.accent),
          });
          break;
        case "BollingerBands":
          indicatorInstance = am5stock.BollingerBands.new(root, {
            ...commonSettings,
            period: 20,
            field: "Close",
            upperColor: am5.Color.fromString(CHART_COLORS.text.secondary),
            lowerColor: am5.Color.fromString(CHART_COLORS.text.secondary),
            middleColor: am5.Color.fromString(CHART_COLORS.accent),
          });
          break;
        case "Volume":
          if (!volumeSeriesRef.current) return;
          panelInstance = stockChart.panels.push(
            am5stock.StockPanel.new(root, {
              height: am5.percent(30),
              wheelY: "zoomX",
              panX: true,
              panY: true,
              marginTop: 5,
              background: am5.Rectangle.new(root, {
                fill: am5.color(CHART_COLORS.panel),
                fillOpacity: 0.8,
              }),
            }),
          );
          indicatorInstance = am5stock.Volume.new(root, {
            ...commonSettings,
            volumeSeries: volumeSeriesRef.current!,
            panel: panelInstance,
            increasingColor: am5.color(CHART_COLORS.volume.up),
            decreasingColor: am5.color(CHART_COLORS.volume.down),
          });
          volumeSeriesRef.current!.set("forceHidden", false);
          break;
        case "RelativeStrengthIndex":
          panelInstance = stockChart.panels.push(
            am5stock.StockPanel.new(root, {
              height: am5.percent(30),
              wheelY: "zoomX",
              panX: true,
              panY: true,
              marginTop: 5,
              background: am5.Rectangle.new(root, {
                fill: am5.color(CHART_COLORS.panel),
                fillOpacity: 0.8,
              }),
            }),
          );
          indicatorInstance = am5stock.RelativeStrengthIndex.new(root, {
            ...commonSettings,
            period: 14,
            field: "Close",
            seriesColor: am5.Color.fromString(CHART_COLORS.accent),
            panel: panelInstance,
          });
          break;
        case "MACD":
          panelInstance = stockChart.panels.push(
            am5stock.StockPanel.new(root, {
              height: am5.percent(30),
              wheelY: "zoomX",
              panX: true,
              panY: true,
              marginTop: 5,
              background: am5.Rectangle.new(root, {
                fill: am5.color(CHART_COLORS.panel),
                fillOpacity: 0.8,
              }),
            }),
          );
          indicatorInstance = am5stock.MACD.new(root, {
            ...commonSettings,
            period: 12,
            longPeriod: 26,
            signalPeriod: 9,
            field: "Close",
            seriesColor: am5.Color.fromString(CHART_COLORS.accent),
            signalColor: am5.Color.fromString(CHART_COLORS.danger),
            panel: panelInstance,
          });
          break;
      }

      if (indicatorInstance) {
        _dbg("indicator_add", indicatorId);
        stockChart.indicators.push(indicatorInstance);
        indicatorsRef.current[indicatorId] = {
          indicator: indicatorInstance,
          panel: panelInstance,
          dispose: () => {
            if (
              panelInstance &&
              stockChart.panels.indexOf(panelInstance) !== -1
            )
              stockChart.panels.removeValue(panelInstance);
            stockChart.indicators.removeValue(indicatorInstance);
            if (indicatorId === "Volume" && volumeSeriesRef.current)
              volumeSeriesRef.current.set("forceHidden", true);
          },
        };
        setActiveIndicators((prev) => [...prev, indicatorId]);
      }

      closeAllDropdowns();
    },
    [activeIndicators, closeAllDropdowns],
  );

  const zoomChart = useCallback((factor: number) => {
    const dateAxis = dateAxisRef.current;
    if (!dateAxis) return;

    const currentStart = dateAxis.get("start") ?? 0;
    const currentEnd = dateAxis.get("end") ?? 1;
    const currentRange = Math.max(0.05, currentEnd - currentStart);
    const nextRange = Math.min(1, Math.max(0.05, currentRange * factor));
    const center = (currentStart + currentEnd) / 2;
    const nextStart = Math.max(0, Math.min(1 - nextRange, center - nextRange / 2));
    const nextEnd = nextStart + nextRange;

    dateAxis.zoom(nextStart, nextEnd, false);
    isAtEndRef.current = nextEnd > 0.98;
  }, []);

  const focusLatestCandle = useCallback(() => {
    const dateAxis = dateAxisRef.current;
    const series = mainSeriesRef.current;
    const count = series?.data?.length ?? 0;

    if (!dateAxis) return;

    if (count <= VISIBLE_CANDLE_COUNT) {
      dateAxis.zoom(0, 1, false);
    } else {
      const start = Math.max(0, (count - VISIBLE_CANDLE_COUNT) / count);
      dateAxis.zoom(start, 1, false);
    }

    isAtEndRef.current = true;
  }, []);

  const loadingAssetLabel = tradingPair.includes("/")
    ? tradingPair
    : `${tradingPair.slice(0, 3)}/${tradingPair.slice(3)}`;
  const formatUsd = useCallback((value: number) => {
    const absolute = Math.abs(value);
    return absolute.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []);
  const formattedCurrentPrice = useMemo(() => {
    const price = currentPrice || selectedCrypto?.basePrice || 0;
    return price.toLocaleString("en-US", {
      minimumFractionDigits: price >= 100 ? 2 : 5,
      maximumFractionDigits: price >= 100 ? 2 : 5,
    });
  }, [currentPrice, selectedCrypto?.basePrice]);
  const priceChangePercent = selectedCrypto?.priceChangePercent || 0;
  const priceChangeText = `${priceChangePercent >= 0 ? "+" : ""}${priceChangePercent.toFixed(2)}%`;
  const currentAssetOperations = useMemo(
    () =>
      activeOperations.filter(
        (operation) =>
          operation.asset === tradingPair &&
          (!operation.accountType || operation.accountType === selectedAccount),
      ),
    [activeOperations, tradingPair, selectedAccount],
  );
  const activeOperationsSummary = useMemo(() => {
    if (currentAssetOperations.length === 0) {
      return null;
    }

    const livePrice =
      currentPrice ||
      selectedCrypto?.basePrice ||
      currentAssetOperations[0]?.entryPrice ||
      0;
    const totalInvested = currentAssetOperations.reduce(
      (sum, operation) => sum + operation.value,
      0,
    );
    const expectedProfit = currentAssetOperations.reduce(
      (sum, operation) => sum + operation.expectedProfit,
      0,
    );
    const sellSnapshot = currentAssetOperations.reduce(
      (acc, operation) => {
        const snapshot = calculateLiveOperationSellSnapshot({
          type: operation.type,
          value: operation.value,
          entryPrice: operation.entryPrice,
          expectedProfit: operation.expectedProfit,
          livePrice,
        });

        acc.exitValue += snapshot.exitValue;
        acc.pnl += snapshot.pnl;
        return acc;
      },
      { exitValue: 0, pnl: 0 },
    );
    const remainingMs = currentAssetOperations.reduce(
      (min, operation) => Math.min(min, getOperationRemainingMs(operation)),
      Number.POSITIVE_INFINITY,
    );
    const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const remainingLabel = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;

    return {
      count: currentAssetOperations.length,
      operationIds: currentAssetOperations.map((operation) => operation.id),
      totalInvestedValue: totalInvested,
      totalInvested: formatUsd(totalInvested),
      expectedProfitValue: expectedProfit,
      expectedProfit: `+${formatUsd(expectedProfit)}`,
      sellPnLValue: sellSnapshot.pnl,
      sellPnL: `${sellSnapshot.pnl >= 0 ? "+" : "-"}${formatUsd(
        sellSnapshot.pnl,
      )}`,
      sellPnLPositive: sellSnapshot.pnl >= 0,
      remainingLabel,
    };
  }, [
    currentAssetOperations,
    currentPrice,
    formatUsd,
    selectedCrypto?.basePrice,
  ]);
  const activeDrawingTool = useMemo<TradingChartDrawingTool | null>(
    () => drawingTools.find((tool) => tool.id === activeDrawingToolId) || null,
    [drawingTools, activeDrawingToolId],
  );
  const activeOperationRows = useMemo(() => {
    if (currentAssetOperations.length === 0) {
      return [];
    }

    const livePrice =
      currentPrice ||
      selectedCrypto?.basePrice ||
      currentAssetOperations[0]?.entryPrice ||
      0;

    return currentAssetOperations.map((operation) => {
      const snapshot = calculateLiveOperationSellSnapshot({
        type: operation.type,
        value: operation.value,
        entryPrice: operation.entryPrice,
        expectedProfit: operation.expectedProfit,
        livePrice,
      });

      return {
        id: operation.id,
        invested: formatUsd(operation.value),
        expectedProfit: `+${formatUsd(operation.expectedProfit)}`,
        sellPnL: `${snapshot.pnl >= 0 ? "+" : "-"}${formatUsd(snapshot.pnl)}`,
        sellPnLPositive: snapshot.pnl >= 0,
      };
    });
  }, [currentAssetOperations, currentPrice, formatUsd, selectedCrypto?.basePrice]);

  const playSettlementOutcomeSound = useCallback(
    (results: Array<{ result: string }>) => {
      const normalizedResults = new Set(
        results
          .map((item) => item.result)
          .filter((result) => result === "win" || result === "loss"),
      );

      if (normalizedResults.size !== 1) {
        return;
      }

      if (normalizedResults.has("win")) {
        playDealWin();
        return;
      }

      if (normalizedResults.has("loss")) {
        playDealLoss();
      }
    },
    [playDealLoss, playDealWin],
  );

  const sellOperations = useCallback(async (operationIds: string[]) => {
    if (operationIds.length === 0) {
      return [];
    }

    const response = await fetch("/api/account/operations/sell", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operationIds }),
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(payload?.error || "Falha ao vender as operações ativas.");
    }

    return Array.isArray(payload?.operations) ? payload.operations : [];
  }, []);

  const handleSellOneOperation = useCallback(
    async (operationId: string) => {
      if (sellingOperationIds.includes(operationId) || isSellingActiveOperations) {
        return;
      }

      setSellingOperationIds((current) => [...current, operationId]);

      try {
        const soldOperations = await sellOperations([operationId]);

        for (const operation of soldOperations) {
          removeOperation(operation.id);
          addOperationResult({
            id: operation.id,
            asset: operation.asset,
            type: operation.type,
            value: operation.value,
            timeframe: operation.timeframe,
            entryTime: new Date(operation.entryTime).toLocaleString("en-US"),
            expiryTime: operation.expiryTime
              ? new Date(operation.expiryTime).toLocaleString("en-US")
              : "",
            openPrice: Number(operation.entryPrice).toFixed(4),
            closePrice: Number(operation.closePrice).toFixed(4),
            result: operation.result,
            profit: Number(operation.profit) || 0,
          });
        }

        await syncBalances();
        playSettlementOutcomeSound(soldOperations);

        toast.open({
          variant: "success",
          title: t("sellSuccess"),
          description: t("sellSuccessOne"),
          duration: 3500,
        });
      } catch (error) {
        toast.open({
          variant: "error",
          title: t("sellError"),
          description:
            error instanceof Error ? error.message : t("sellErrorDescription"),
          duration: 4000,
        });
      } finally {
        setSellingOperationIds((current) =>
          current.filter((id) => id !== operationId),
        );
      }
    },
    [
      addOperationResult,
      isSellingActiveOperations,
      removeOperation,
      sellOperations,
      sellingOperationIds,
      syncBalances,
      t,
      toast,
      playSettlementOutcomeSound,
    ],
  );

  const handleSellActiveOperations = useCallback(async () => {
    if (!activeOperationsSummary || isSellingActiveOperations) {
      return;
    }

    setIsSellingActiveOperations(true);

    try {
      const soldOperations = await sellOperations(
        activeOperationsSummary.operationIds,
      );

      for (const operation of soldOperations) {
        removeOperation(operation.id);
        addOperationResult({
          id: operation.id,
          asset: operation.asset,
          type: operation.type,
          value: operation.value,
          timeframe: operation.timeframe,
          entryTime: new Date(operation.entryTime).toLocaleString("en-US"),
          expiryTime: operation.expiryTime
            ? new Date(operation.expiryTime).toLocaleString("en-US")
            : "",
          openPrice: Number(operation.entryPrice).toFixed(4),
          closePrice: Number(operation.closePrice).toFixed(4),
          result: operation.result,
          profit: Number(operation.profit) || 0,
        });
      }

      await syncBalances();
      playSettlementOutcomeSound(soldOperations);

      toast.open({
        variant: "success",
        title: t("sellSuccess"),
        description:
          soldOperations.length > 1
            ? t("sellSuccessMany")
            : t("sellSuccessOne"),
        duration: 3500,
      });

      setIsSellModalOpen(false);
    } catch (error) {
      toast.open({
        variant: "error",
        title: t("sellError"),
        description:
          error instanceof Error ? error.message : t("sellErrorDescription"),
        duration: 4000,
      });
    } finally {
      setIsSellingActiveOperations(false);
    }
  }, [
    activeOperationsSummary,
    addOperationResult,
    isSellingActiveOperations,
    removeOperation,
    sellOperations,
    syncBalances,
    t,
    toast,
    playSettlementOutcomeSound,
  ]);

  // ================= Render =================
  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="relative flex-1 w-full h-full">
        <div
          ref={chartRef}
          className={`h-full w-full transition-opacity duration-200 ${
            loading ? "opacity-0" : "opacity-100"
          }`}
        />

        <TradingChartControls
          activeDropdown={activeDropdown}
          timeframe={timeframe}
          chartType={chartType}
          activeDrawingToolId={activeDrawingToolId}
          isEraserActive={isEraserActive}
          activeIndicators={activeIndicators}
          drawingColorOptions={drawingColorOptions}
          currentDrawingColor={currentDrawingColor}
          drawingTools={drawingTools}
          indicators={indicators}
          timeframes={timeframes}
          chartTypes={chartTypes}
          activeDrawingTool={activeDrawingTool}
          toolDropdownRef={toolDropdownRef}
          selectedCrypto={selectedCrypto}
          tradingPair={tradingPair}
          currentPrice={currentPrice}
          loadingAssetLabel={loadingAssetLabel}
          formattedCurrentPrice={formattedCurrentPrice}
          priceChangePercent={priceChangePercent}
          priceChangeText={priceChangeText}
          activeOperationsSummary={activeOperationsSummary}
          isSellingActiveOperations={isSellingActiveOperations}
          cryptos={cryptos}
          openCharts={openCharts}
          currentChart={currentChart}
          onToggleDropdown={toggleDropdown}
          onCloseAllDropdowns={closeAllDropdowns}
          onChangeTimeframe={changeTimeframe}
          onChangeChartType={changeChartType}
          onActivateDrawingTool={activateDrawingTool}
          onToggleDrawingEraser={toggleDrawingEraser}
          onDeactivateDrawingMode={deactivateDrawingMode}
          onClearAllChartDrawings={clearAllChartDrawings}
          onApplyDrawingColor={applyDrawingColor}
          onAddIndicator={addIndicator}
          onCryptoSelect={onCryptoSelect}
          onToggleFavorite={onToggleFavorite}
          onUpdateCryptos={onUpdateCryptos}
          onChangeChart={onChangeChart}
          onRemoveChart={onRemoveChart}
          onSellActiveOperations={() => setIsSellModalOpen(true)}
          onZoomChart={zoomChart}
          onFocusLatestCandle={focusLatestCandle}
          onPlayTick={playTick}
          t={t}
        />

        <TradingActiveOperationsModal
          open={isSellModalOpen && activeOperationRows.length > 0}
          operationCount={activeOperationRows.length}
          totalInvested={activeOperationsSummary?.totalInvested ?? formatUsd(0)}
          expectedProfit={activeOperationsSummary?.expectedProfit ?? `+${formatUsd(0)}`}
          sellPnL={activeOperationsSummary?.sellPnL ?? `+${formatUsd(0)}`}
          sellPnLPositive={activeOperationsSummary?.sellPnLPositive ?? true}
          items={activeOperationRows}
          sellingAll={isSellingActiveOperations}
          sellingOperationIds={sellingOperationIds}
          onClose={() => setIsSellModalOpen(false)}
          onSellAll={handleSellActiveOperations}
          onSellOne={handleSellOneOperation}
          onPlayTick={playTick}
          t={t}
        />
      </div>

      {loading && <TradingChartLoader />}

      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-platform-danger/20 border border-platform-danger/30 text-platform-danger px-4 py-3 rounded-xl backdrop-blur-sm flex items-center gap-2">
            <span>⚠️ {error}</span>
            <button
              onClick={() => setError(null)}
              className="text-platform-danger hover:text-platform-text transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
