"use client";

import { useState, useCallback, useRef } from "react";

// ─── Event types the debug panel can filter on ───
export type ChartEventType =
  | "candle_new"
  | "candle_update"
  | "price_tick"
  | "zoom"
  | "pan"
  | "timeframe_change"
  | "pair_change"
  | "chart_type_change"
  | "indicator_add"
  | "indicator_remove"
  | "order_placed"
  | "order_cancelled"
  | "data_load"
  | "ws_message"
  | "error";

export interface ChartDebugEntry {
  id: number;
  ts: number;
  type: ChartEventType;
  message: string;
  data?: Record<string, unknown>;
}

const MAX_ENTRIES = 500;

export function useChartDebugLog() {
  const [entries, setEntries] = useState<ChartDebugEntry[]>([]);
  const idRef = useRef(0);

  const log = useCallback(
    (type: ChartEventType, message: string, data?: Record<string, unknown>) => {
      const entry: ChartDebugEntry = {
        id: ++idRef.current,
        ts: Date.now(),
        type,
        message,
        data,
      };
      setEntries((prev) => {
        const next = [entry, ...prev];
        return next.length > MAX_ENTRIES ? next.slice(0, MAX_ENTRIES) : next;
      });
    },
    [],
  );

  const clear = useCallback(() => {
    setEntries([]);
    idRef.current = 0;
  }, []);

  return { entries, log, clear };
}
