export interface ChartSettings {
  showOrders: boolean;
  showPosition?: boolean;
  orderLineColor: string;
  positionLineColor?: string;
  orderTextColor: string;
  orderFontSize?: number;
  orderDisplayDuration?: number;
  buyOrderColor?: number;
  sellOrderColor?: number;
  orderStrokeWidth?: number;
  orderStrokeOpacity?: number;
  orderLabelBgOpacity?: number;
  amountPrecision?: number;
}

export interface Order {
  id: string;
  type: "buy" | "sell";
  price: number;
  amount: number;
  total: number;
  timestamp: number;
  status: "active" | "cancelled" | "filled";
  text?: string;
  expiresAt?: number;
}

export interface OrderVisualization {
  orderId: string;
  range: any; // Tipo específico do amCharts
  expirationTimeout?: NodeJS.Timeout;
  updateInterval?: NodeJS.Timeout;
}
