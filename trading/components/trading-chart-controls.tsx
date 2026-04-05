"use client";

import type React from "react";
import {
  Activity,
  BarChart2,
  Clock,
  Eraser,
  LocateFixed,
  Menu,
  PenTool,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { CryptoSelector } from "@/components/crypto-selector";
import { TradingActiveOperationsStrip } from "@/components/trading-active-operations-strip";
import type { Crypto } from "@/lib/forex-data";
import type {
  TradingChartDrawingTool,
  TradingChartIndicator,
  TradingChartTimeframeOption,
  TradingChartType,
  TradingChartTypeOption,
} from "@/components/trading-chart-presets";

type DropdownType =
  | "chartTypes"
  | "timeframes"
  | "drawingTools"
  | "indicators"
  | null;

interface TradingChartControlsProps {
  activeDropdown: DropdownType;
  timeframe: string;
  chartType: TradingChartType;
  activeDrawingToolId: string | null;
  isEraserActive: boolean;
  activeIndicators: string[];
  drawingColorOptions: Array<{ value: string; label: string }>;
  currentDrawingColor: string;
  drawingTools: TradingChartDrawingTool[];
  indicators: TradingChartIndicator[];
  timeframes: TradingChartTimeframeOption[];
  chartTypes: TradingChartTypeOption[];
  activeDrawingTool: TradingChartDrawingTool | null;
  toolDropdownRef: React.RefObject<HTMLDivElement | null>;
  selectedCrypto: Crypto;
  tradingPair: string;
  currentPrice: number;
  loadingAssetLabel: string;
  formattedCurrentPrice: string;
  priceChangePercent: number;
  priceChangeText: string;
  payoutRate?: number;
  activeOperationsSummary?: {
    count: number;
    remainingLabel: string;
    totalInvested: string;
    expectedProfit: string;
    sellPnL: string;
    sellPnLPositive: boolean;
  } | null;
  isSellingActiveOperations: boolean;
  cryptos: Crypto[];
  openCharts?: string[];
  currentChart?: string;
  onToggleDropdown: (dropdown: Exclude<DropdownType, null>) => void;
  onCloseAllDropdowns: () => void;
  onChangeTimeframe: (timeframe: string) => void;
  onChangeChartType: (type: TradingChartType) => void;
  onActivateDrawingTool: (toolId: string) => void;
  onToggleDrawingEraser: () => void;
  onDeactivateDrawingMode: () => void;
  onClearAllChartDrawings: () => void;
  onApplyDrawingColor: (color: string) => void;
  onAddIndicator: (indicatorId: string) => void;
  onCryptoSelect: (crypto: Crypto, addOnly: boolean) => void;
  onToggleFavorite: (crypto: Crypto) => void;
  onUpdateCryptos: (updatedCryptos: Crypto[]) => void;
  onChangeChart?: (symbol: string) => void;
  onRemoveChart?: (symbol: string) => void;
  onSellActiveOperations: () => void;
  onZoomChart: (factor: number) => void;
  onFocusLatestCandle: () => void;
  onPlayTick: () => void;
  onOpenMobileMenu?: () => void;
  t: (key: string) => string;
}

export function TradingChartControls({
  activeDropdown,
  timeframe,
  chartType,
  activeDrawingToolId,
  isEraserActive,
  activeIndicators,
  drawingColorOptions,
  currentDrawingColor,
  drawingTools,
  indicators,
  timeframes,
  chartTypes,
  activeDrawingTool,
  toolDropdownRef,
  selectedCrypto,
  tradingPair,
  currentPrice,
  loadingAssetLabel,
  formattedCurrentPrice,
  priceChangePercent,
  priceChangeText,
  payoutRate,
  activeOperationsSummary,
  isSellingActiveOperations,
  cryptos,
  openCharts,
  currentChart,
  onToggleDropdown,
  onCloseAllDropdowns,
  onChangeTimeframe,
  onChangeChartType,
  onActivateDrawingTool,
  onToggleDrawingEraser,
  onDeactivateDrawingMode,
  onClearAllChartDrawings,
  onApplyDrawingColor,
  onAddIndicator,
  onCryptoSelect,
  onToggleFavorite,
  onUpdateCryptos,
  onChangeChart,
  onRemoveChart,
  onSellActiveOperations,
  onZoomChart,
  onFocusLatestCandle,
  onPlayTick,
  onOpenMobileMenu,
  t,
}: TradingChartControlsProps) {
  return (
    <>
      {activeOperationsSummary ? (
        <TradingActiveOperationsStrip
          operationCount={activeOperationsSummary.count}
          remainingLabel={activeOperationsSummary.remainingLabel}
          totalInvested={activeOperationsSummary.totalInvested}
          expectedProfit={activeOperationsSummary.expectedProfit}
          sellPnL={activeOperationsSummary.sellPnL}
          sellPnLPositive={activeOperationsSummary.sellPnLPositive}
          isSelling={isSellingActiveOperations}
          onSell={() => {
            onPlayTick();
            onSellActiveOperations();
          }}
          t={t}
        />
      ) : null}

      <div className="dropdown-container absolute bottom-12 left-4 z-20 flex flex-col gap-2">
        {onOpenMobileMenu && (
          <button
            className="bg-platform-overlay-surface/60 backdrop-blur-sm text-platform-text p-2 rounded-xl cursor-pointer hover:bg-platform-overlay-hover/70 transition-all duration-200 shadow-lg md:hidden"
            onClick={(event) => {
              event.stopPropagation();
              onPlayTick();
              onOpenMobileMenu();
            }}
            title="Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <button
          className="bg-platform-overlay-surface/60 backdrop-blur-sm text-platform-text p-2 rounded-xl cursor-pointer hover:bg-platform-overlay-hover/70 transition-all duration-200 shadow-lg"
          onClick={(event) => {
            event.stopPropagation();
            onPlayTick();
            onToggleDropdown("timeframes");
          }}
          title={t("timeframes")}
        >
          <Clock className="w-4 h-4" />
        </button>
        <button
          className="bg-platform-overlay-surface/60 backdrop-blur-sm text-platform-text p-2 rounded-xl cursor-pointer hover:bg-platform-overlay-hover/70 transition-all duration-200 shadow-lg"
          onClick={(event) => {
            event.stopPropagation();
            onPlayTick();
            onToggleDropdown("chartTypes");
          }}
          title={t("chartTypes")}
        >
          <BarChart2 className="w-4 h-4" />
        </button>
        <button
          className={`backdrop-blur-sm p-2 rounded-xl cursor-pointer transition-all duration-200 shadow-lg ${
            activeDrawingToolId || isEraserActive
              ? "bg-platform-positive/12 text-platform-text shadow-platform-positive/10"
              : "bg-platform-overlay-surface/60 text-platform-text hover:bg-platform-overlay-hover/70"
          }`}
          onClick={(event) => {
            event.stopPropagation();
            onPlayTick();
            onToggleDropdown("drawingTools");
          }}
          title={t("drawingTools")}
        >
          <PenTool className="w-4 h-4" />
        </button>
        <button
          className="bg-platform-overlay-surface/60 backdrop-blur-sm text-platform-text p-2 rounded-xl cursor-pointer hover:bg-platform-overlay-hover/70 transition-all duration-200 shadow-lg"
          onClick={(event) => {
            event.stopPropagation();
            onPlayTick();
            onToggleDropdown("indicators");
          }}
          title={t("indicators")}
        >
          <Activity className="w-4 h-4" />
        </button>
      </div>

      {activeDropdown && (
        <div
          ref={toolDropdownRef}
          className="dropdown-container absolute bottom-12 left-20 z-30 w-[320px] rounded-3xl border border-platform-chart-surface bg-platform-chart-deep-bg/96 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-center justify-between border-b border-platform-chart-surface-alt px-5 py-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-platform-muted">
              {activeDropdown === "chartTypes"
                ? t("chartTypes")
                : activeDropdown === "timeframes"
                  ? t("timeframes")
                  : activeDropdown === "drawingTools"
                    ? t("drawingTools")
                    : t("indicators")}
            </div>
            <button
              className="rounded-full p-1 text-platform-overlay-muted transition-colors hover:text-platform-text"
              onClick={() => {
                onPlayTick();
                onCloseAllDropdowns();
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto p-4">
            {activeDropdown === "timeframes" && (
              <div className="grid grid-cols-3 gap-3">
                {timeframes.map((option) => (
                  <button
                    key={option.value}
                    className={`rounded-2xl border px-3 py-4 text-sm font-medium transition-all ${
                      timeframe === option.value
                        ? "border-platform-positive bg-platform-positive/10 text-platform-text shadow-lg shadow-platform-positive/10"
                        : "border-platform-chart-surface bg-platform-chart-deep-bg text-platform-muted hover:border-platform-overlay-muted hover:text-platform-text"
                    }`}
                    onClick={() => {
                      onPlayTick();
                      onChangeTimeframe(option.value);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {activeDropdown === "chartTypes" && (
              <div className="space-y-3">
                {chartTypes.map((type) => (
                  <button
                    key={type.type}
                    className={`flex w-full items-center rounded-2xl border px-4 py-4 text-left transition-all ${
                      chartType === type.type
                        ? "border-platform-positive bg-platform-positive/10 text-platform-text shadow-lg shadow-platform-positive/10"
                        : "border-platform-chart-surface bg-platform-chart-deep-bg text-platform-muted hover:border-platform-overlay-muted hover:text-platform-text"
                    }`}
                    onClick={() => {
                      onPlayTick();
                      onChangeChartType(type.type);
                    }}
                  >
                    <div className="mr-4 rounded-xl bg-platform-chart-surface-alt p-2 text-white">
                      {type.icon}
                    </div>
                    <div>
                      <div className="font-medium">{type.name}</div>
                      <div className="mt-1 text-xs text-platform-overlay-muted">
                        {type.type === "line"
                          ? "Preco em linha continua"
                          : type.type === "candlestick"
                            ? "Candles classicos (OHLC)"
                            : "Barras OHLC tradicionais"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {activeDropdown === "drawingTools" && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <button
                    className={`flex items-center justify-center rounded-2xl border px-3 py-3 text-sm font-medium transition-all ${
                      !activeDrawingToolId && !isEraserActive
                        ? "border-platform-positive bg-platform-positive/10 text-platform-text shadow-lg shadow-platform-positive/10"
                        : "border-platform-chart-surface bg-platform-chart-deep-bg text-platform-muted hover:border-platform-overlay-muted hover:text-platform-text"
                    }`}
                    onClick={() => {
                      onPlayTick();
                      onDeactivateDrawingMode();
                      onCloseAllDropdowns();
                    }}
                  >
                    Selecionar
                  </button>
                  <button
                    className={`flex items-center justify-center rounded-2xl border px-3 py-3 text-sm font-medium transition-all ${
                      isEraserActive
                        ? "border-platform-positive bg-platform-positive/10 text-platform-text shadow-lg shadow-platform-positive/10"
                        : "border-platform-chart-surface bg-platform-chart-deep-bg text-platform-muted hover:border-platform-overlay-muted hover:text-platform-text"
                    }`}
                    onClick={() => {
                      onPlayTick();
                      onToggleDrawingEraser();
                    }}
                  >
                    <Eraser className="mr-2 h-4 w-4" />
                    {t("eraser")}
                  </button>
                  <button
                    className="flex items-center justify-center rounded-2xl border border-platform-chart-surface bg-platform-chart-deep-bg px-3 py-3 text-sm font-medium text-platform-muted transition-all hover:border-platform-overlay-muted hover:text-platform-text"
                    onClick={() => {
                      onPlayTick();
                      onClearAllChartDrawings();
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("clearAll")}
                  </button>
                </div>

                <div className="rounded-2xl border border-platform-chart-surface-alt bg-platform-chart-deep-bg px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-platform-overlay-muted">
                    Cor do desenho
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {drawingColorOptions.map((color) => (
                      <button
                        key={color.value}
                        className={`h-8 w-8 rounded-full border-2 transition-all ${
                          currentDrawingColor === color.value
                            ? "scale-110 border-white shadow-lg"
                            : "border-white/15"
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => {
                          onPlayTick();
                          onApplyDrawingColor(color.value);
                        }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                {drawingTools.map((tool) => (
                  <button
                    key={tool.id}
                    className={`flex w-full items-center rounded-2xl border px-4 py-3 text-left transition-all ${
                      activeDrawingToolId === tool.id
                        ? "border-platform-positive bg-platform-positive/10 text-platform-text shadow-lg shadow-platform-positive/10"
                        : "border-platform-chart-surface bg-platform-chart-deep-bg text-platform-muted hover:border-platform-overlay-muted hover:text-platform-text"
                    }`}
                    onClick={() => {
                      onPlayTick();
                      onActivateDrawingTool(tool.id);
                    }}
                  >
                    <div className="mr-3 rounded-xl bg-platform-chart-surface-alt p-2 text-white">
                      {tool.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{tool.name}</div>
                      <div className="mt-1 text-xs text-platform-overlay-muted">
                        {tool.description}
                      </div>
                    </div>
                    {activeDrawingToolId === tool.id ? (
                      <div className="ml-3 h-2.5 w-2.5 rounded-full bg-platform-positive" />
                    ) : null}
                  </button>
                ))}

                <div className="rounded-2xl border border-platform-chart-surface-alt bg-platform-chart-deep-bg px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-platform-overlay-muted">
                    {isEraserActive
                      ? "Borracha ativa"
                      : activeDrawingTool
                        ? `${activeDrawingTool.name} ativo`
                        : "Modo selecao"}
                  </div>
                  <div className="mt-2 text-xs leading-relaxed text-platform-muted">
                    {isEraserActive
                      ? "Clique em um desenho para remover. Pressione Esc para sair da borracha."
                      : activeDrawingTool
                        ? `${activeDrawingTool.hint} Pressione Esc para voltar ao cursor.`
                        : "Escolha uma ferramenta e clique no grafico para desenhar."}
                  </div>
                </div>
              </div>
            )}

            {activeDropdown === "indicators" && (
              <div className="space-y-3">
                {indicators.map((indicator) => (
                  <button
                    key={indicator.id}
                    className={`flex w-full items-center rounded-2xl border px-4 py-4 text-left transition-all ${
                      activeIndicators.includes(indicator.id)
                        ? "border-platform-positive bg-platform-positive/10 text-platform-text shadow-lg shadow-platform-positive/10"
                        : "border-platform-chart-surface bg-platform-chart-deep-bg text-platform-muted hover:border-platform-overlay-muted hover:text-platform-text"
                    }`}
                    onClick={() => {
                      onPlayTick();
                      onAddIndicator(indicator.id);
                    }}
                  >
                    <div className="mr-4 rounded-xl bg-platform-chart-surface-alt p-2 text-white">
                      {indicator.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{indicator.name}</div>
                      <div className="mt-1 text-xs text-platform-overlay-muted">
                        {indicator.description}
                      </div>
                    </div>
                    {activeIndicators.includes(indicator.id) && (
                      <div className="h-3 w-3 rounded-full bg-platform-positive" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {(activeDrawingToolId || isEraserActive) && (
        <div className="absolute bottom-12 left-20 z-20 hidden max-w-[340px] rounded-3xl border border-platform-chart-surface bg-platform-chart-deep-bg/92 px-4 py-4 shadow-2xl backdrop-blur-xl md:block">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-platform-overlay-muted">
                {isEraserActive
                  ? "Borracha"
                  : activeDrawingTool
                    ? `Desenho: ${activeDrawingTool.name}`
                    : "Desenho ativo"}
              </div>
              <div className="mt-2 text-sm text-white">
                {isEraserActive
                  ? "Clique em um desenho para apagar."
                  : activeDrawingTool?.hint || "Clique no grafico para desenhar."}
              </div>
              <div className="mt-1 text-xs text-platform-overlay-muted">
                Esc sai da ferramenta e volta para navegacao normal.
              </div>
            </div>
            <button
              className="rounded-full p-1 text-platform-overlay-muted transition-colors hover:text-platform-text"
              onClick={() => {
                onPlayTick();
                onDeactivateDrawingMode();
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="rounded-xl border border-platform-chart-surface bg-platform-chart-deep-bg px-3 py-2 text-xs font-medium text-platform-muted transition-all hover:border-platform-overlay-muted hover:text-platform-text"
              onClick={() => {
                onPlayTick();
                onDeactivateDrawingMode();
              }}
            >
              Cursor
            </button>
            <button
              className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                isEraserActive
                  ? "border-platform-positive bg-platform-positive/10 text-white"
                  : "border-platform-chart-surface bg-platform-chart-deep-bg text-platform-muted hover:border-platform-overlay-muted hover:text-platform-text"
              }`}
              onClick={() => {
                onPlayTick();
                onToggleDrawingEraser();
              }}
            >
              Borracha
            </button>
            <button
              className="rounded-xl border border-platform-chart-surface bg-platform-chart-deep-bg px-3 py-2 text-xs font-medium text-platform-muted transition-all hover:border-platform-overlay-muted hover:text-platform-text"
              onClick={() => {
                onPlayTick();
                onClearAllChartDrawings();
              }}
            >
              Limpar desenhos
            </button>
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <div className="block md:hidden">
          <CryptoSelector
            cryptos={cryptos}
            selectedCrypto={selectedCrypto}
            currentPrice={currentPrice}
            onSelect={onCryptoSelect}
            onToggleFavorite={onToggleFavorite}
            onUpdateCryptos={onUpdateCryptos}
            openCharts={openCharts}
            currentChart={currentChart}
            onChangeChart={onChangeChart}
            onRemoveChart={onRemoveChart}
            formattedCurrentPrice={formattedCurrentPrice}
            priceChangePercent={priceChangePercent}
            priceChangeText={priceChangeText}
            payoutRate={payoutRate}
          />
        </div>

        {activeDrawingToolId && (
          <div
            className="bg-platform-overlay-surface/60 backdrop-blur-sm text-platform-text p-2 rounded-xl cursor-pointer hover:bg-platform-overlay-hover/70 transition-all duration-200 shadow-lg"
            onClick={() => {
              onPlayTick();
              onClearAllChartDrawings();
            }}
            title={t("clearAllDrawings")}
          >
            <Trash2 className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-platform-overlay-backdrop/70 px-2 py-2 backdrop-blur-sm md:bottom-10">
        <button
          className="rounded-xl bg-platform-overlay-surface/70 p-2 text-platform-text transition-colors hover:bg-platform-overlay-hover/80"
          onClick={() => {
            onPlayTick();
            onZoomChart(0.8);
          }}
          title="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          className="rounded-xl bg-platform-overlay-surface/70 p-2 text-platform-text transition-colors hover:bg-platform-overlay-hover/80"
          onClick={() => {
            onPlayTick();
            onFocusLatestCandle();
          }}
          title="Ultima vela"
        >
          <LocateFixed className="h-4 w-4" />
        </button>
        <button
          className="rounded-xl bg-platform-overlay-surface/70 p-2 text-platform-text transition-colors hover:bg-platform-overlay-hover/80"
          onClick={() => {
            onPlayTick();
            onZoomChart(1.25);
          }}
          title="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}
