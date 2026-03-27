import type * as am5 from "@amcharts/amcharts5";

export const INITIAL_FETCH_CANDLES = 500;
export const MAX_CANDLES_IN_MEMORY = 500;
export const VISIBLE_CANDLE_COUNT = 30;

export interface CandleData {
  Date: number;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
}

export interface ChartMarkerDatum {
  valueX: number;
  valueY: number;
  operationId: string;
  pair: string;
  type: "buy" | "sell";
  entryPrice: number;
  value: number;
  timeframe: string;
}

export interface ResultMarkerDatum extends ChartMarkerDatum {
  result: "win" | "loss";
  closePrice: number;
  profit: number;
}

export interface ChartColors {
  background: string;
  panel: string;
  grid: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  candle: {
    up: string;
    down: string;
  };
  volume: {
    up: string;
    down: string;
  };
  accent: string;
  success: string;
  danger: string;
  priceTag: string;
}

export function getCssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") {
    return fallback;
  }

  return (
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
    fallback
  );
}

export function hexToRgba(hex: string, alpha: number): string {
  const sanitized = hex.replace("#", "");
  const full =
    sanitized.length === 3
      ? sanitized
          .split("")
          .map((char) => char + char)
          .join("")
      : sanitized;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return `rgba(0, 0, 0, ${alpha})`;
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getChartColors(): ChartColors {
  const background = getCssVar("--platform-background-color", "#252b3b");
  const grid = getCssVar("--platform-chart-grid-color", "#666666");
  const mutedText = getCssVar("--platform-muted-text-color", "#a0a0a0");
  const headerText = getCssVar("--platform-header-text-color", "#ffffff");
  const candleUp = getCssVar("--platform-candle-up-color", "#00ab34");
  const candleDown = getCssVar("--platform-candle-down-color", "#d21a2a");
  const success = getCssVar("--platform-success-color", "#10B981");
  const danger = getCssVar("--platform-danger-color", "#EF4444");
  const accent = getCssVar("--platform-accent-color", "#3B82F6");
  const priceTag = getCssVar("--platform-chart-price-tag-color", "#d88a31");

  return {
    background,
    panel: background,
    grid,
    text: {
      primary: headerText,
      secondary: mutedText,
      muted: mutedText,
    },
    candle: {
      up: candleUp,
      down: candleDown,
    },
    volume: {
      up: hexToRgba(candleUp, 0.3),
      down: hexToRgba(candleDown, 0.3),
    },
    accent,
    success,
    danger,
    priceTag,
  };
}

export function timeframeToUnitCount(
  timeframe: string,
): { timeUnit: "minute" | "hour" | "day" | "week"; count: number } {
  const unit = timeframe.slice(-1);
  const count = Number.parseInt(timeframe.slice(0, -1), 10) || 1;

  switch (unit) {
    case "m":
      return { timeUnit: "minute", count };
    case "h":
      return { timeUnit: "hour", count };
    case "d":
      return { timeUnit: "day", count };
    case "w":
      return { timeUnit: "week", count };
    default:
      return { timeUnit: "minute", count: 1 };
  }
}

function getRecordValue(record: Record<string, unknown>, key: string): unknown {
  return key in record ? record[key] : undefined;
}

export function getTickTimestampMs(raw: unknown): number {
  const record =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  const candidates = [
    getRecordValue(record, "T"),
    getRecordValue(record, "E"),
    getRecordValue(record, "ts"),
  ];

  let timestamp: number | undefined;

  for (const candidate of candidates) {
    if (typeof candidate === "number" && candidate > 0) {
      timestamp = candidate;
      break;
    }
  }

  if (timestamp == null) {
    const fallbackTimestamp = getRecordValue(record, "t");
    const eventName = getRecordValue(record, "e");

    if (
      typeof fallbackTimestamp === "number" &&
      fallbackTimestamp > 0 &&
      eventName !== "trade"
    ) {
      timestamp = fallbackTimestamp;
    }
  }

  if (timestamp == null) {
    return Date.now();
  }

  return timestamp < 1e11 ? timestamp * 1000 : timestamp;
}

export function normalizeDateMs(value: number): number {
  return value > 0 && value < 1e11 ? value * 1000 : value;
}

export function isAm5Disposed(candidate: unknown): boolean {
  const maybeDisposable =
    candidate && typeof candidate === "object"
      ? (candidate as { isDisposed?: () => boolean })
      : null;

  return Boolean(maybeDisposable?.isDisposed?.());
}

export function disposeAm5Logo(root: am5.Root | null): void {
  const maybeRoot = root as am5.Root & {
    _logo?: { dispose?: () => void };
  };

  maybeRoot?._logo?.dispose?.();
}
