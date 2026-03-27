"use client";

import type React from "react";
import {
  Activity,
  BarChart,
  BarChart2,
  LineChart,
  PenTool,
  TrendingUp,
} from "lucide-react";

export type TradingChartType = "line" | "candlestick" | "ohlc";

export interface TradingChartDrawingTool {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  hint: string;
}

export interface TradingChartIndicator {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

export interface TradingChartTimeframeOption {
  label: string;
  value: string;
}

export interface TradingChartTypeOption {
  type: TradingChartType;
  name: string;
  icon: React.ReactNode;
}

interface Translator {
  (key: string): string;
}

export const TRADING_CHART_TIMEFRAMES: TradingChartTimeframeOption[] = [
  { label: "1m", value: "1m" },
  { label: "5m", value: "5m" },
  { label: "15m", value: "15m" },
  { label: "30m", value: "30m" },
  { label: "1h", value: "1h" },
  { label: "2h", value: "2h" },
  { label: "4h", value: "4h" },
  { label: "1d", value: "1d" },
  { label: "1w", value: "1w" },
];

export function createTradingChartDrawingTools(
  t: Translator,
): TradingChartDrawingTool[] {
  return [
    {
      id: "Doodle",
      name: t("freeDrawing"),
      icon: <PenTool className="h-4 w-4" />,
      description: "Desenho livre para marcar zonas rapidamente.",
      hint: "Clique e arraste no grafico para desenhar livremente.",
    },
    {
      id: "Trend Line",
      name: t("trendLine"),
      icon: <span className="text-sm">↗</span>,
      description: "Linha de tendencia ancorada em dois pontos.",
      hint: "Clique no ponto inicial e clique novamente no ponto final.",
    },
    {
      id: "Horizontal Line",
      name: t("horizontalLine"),
      icon: <span className="text-sm">┈</span>,
      description: "Nivel horizontal para suporte e resistencia.",
      hint: "Clique uma vez no preco desejado para adicionar a linha.",
    },
    {
      id: "Horizontal Ray",
      name: "Horizontal Ray",
      icon: <span className="text-sm">⟶</span>,
      description: "Linha horizontal estendida para a direita.",
      hint: "Clique no ponto base para projetar o nivel no grafico.",
    },
    {
      id: "Vertical Line",
      name: t("verticalLine"),
      icon: <span className="text-sm">┆</span>,
      description: "Marca um momento especifico do tempo.",
      hint: "Clique sobre a vela que deseja destacar.",
    },
    {
      id: "Label",
      name: "Texto",
      icon: <span className="text-sm font-semibold">T</span>,
      description: "Insere uma anotacao curta direto no grafico.",
      hint: "Clique onde deseja posicionar a anotacao.",
    },
    {
      id: "Callout",
      name: "Callout",
      icon: <span className="text-sm">⌁</span>,
      description: "Destaca um ponto importante com caixa e ponteiro.",
      hint: "Clique no ponto e depois ajuste a caixa de destaque.",
    },
    {
      id: "Fibonacci",
      name: t("fibonacciRetracement"),
      icon: <TrendingUp className="h-4 w-4" />,
      description: "Retracao de Fibonacci entre dois pontos.",
      hint: "Clique no inicio do movimento e depois no final.",
    },
    {
      id: "Rectangle",
      name: t("rectangle"),
      icon: <BarChart2 className="h-4 w-4" />,
      description: "Destaca uma zona importante no grafico.",
      hint: "Clique e arraste para criar uma area destacada.",
    },
  ];
}

export function createTradingChartIndicators(
  t: Translator,
): TradingChartIndicator[] {
  return [
    {
      id: "MovingAverage",
      name: t("movingAverage"),
      icon: <Activity className="h-4 w-4" />,
      description: t("priceAverage"),
    },
    {
      id: "BollingerBands",
      name: t("bollingerBands"),
      icon: <BarChart className="h-4 w-4" />,
      description: t("volatility"),
    },
    {
      id: "Volume",
      name: t("volume"),
      icon: <BarChart className="h-4 w-4" />,
      description: t("tradingVolume"),
    },
    {
      id: "RelativeStrengthIndex",
      name: t("rsi"),
      icon: <TrendingUp className="h-4 w-4" />,
      description: t("relativeStrengthIndex"),
    },
    {
      id: "MACD",
      name: t("macd"),
      icon: <LineChart className="h-4 w-4" />,
      description: t("convergenceDivergence"),
    },
  ];
}

export function createTradingChartTypes(
  t: Translator,
): TradingChartTypeOption[] {
  return [
    {
      type: "candlestick",
      name: t("candlestick"),
      icon: <BarChart2 className="h-4 w-4" />,
    },
    {
      type: "line",
      name: t("line"),
      icon: <LineChart className="h-4 w-4" />,
    },
    {
      type: "ohlc",
      name: t("ohlc"),
      icon: <BarChart className="h-4 w-4" />,
    },
  ];
}
