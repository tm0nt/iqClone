import type React from "react";

// Interface para ordens
export interface Order {
  id: string;
  type: "buy" | "sell";
  amount: number;
  price: number;
  createdAt: number;
  expirationTime: number;
  lineId: string;
}

export interface Crypto {
  symbol: string;
  name: string;
  logo: string;
  image: string;
  color: string;
  basePrice: number;
  change: string;
  priceChangePercent: number;
  favorite?: boolean;
}

export interface CandleData {
  Date: number;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
  color?: string;
}

export type ChartType = "line" | "candlestick" | "ohlc" | "area";
export type DropdownType =
  | "cryptoList"
  | "chartTypes"
  | "timeframes"
  | "drawingTools"
  | "indicators"
  | null;

// Drawing tools available in AmCharts
export interface DrawingTool {
  id: string;
  name: string;
  icon: React.ReactNode;
}

// Technical indicators available in AmCharts
export interface Indicator {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

// Interface para o OrderForm
export interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  currentPrice: number;
  onPlaceOrder: (
    type: "buy" | "sell",
    amount: number,
    expirationMinutes: number,
  ) => void;
  tradingPair: string;
}

// Interface para o StockChart
export interface StockChartProps {
  orders: Order[];
  onCancelOrder: (id: string) => void;
  onPlaceOrder: (
    orderType: "buy" | "sell",
    amount: number,
    expirationMinutes: number,
  ) => void;
  onPriceUpdate: (price: number) => void;
  setIsOrderFormOpen: (isOpen: boolean) => void;
  tradingPair: string;
  setTradingPair: (pair: string) => void;
}
