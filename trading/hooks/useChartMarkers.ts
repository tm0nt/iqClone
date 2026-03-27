"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export interface EntryMarker {
  id: string;
  operationId: string;
  pair: string;
  type: "buy" | "sell";
  entryPrice: number;
  value: number;
  timeframe: string;
  createdAt: number;
}

export interface ResultMarker {
  id: string;
  operationId: string;
  pair: string;
  type: "buy" | "sell";
  result: "win" | "loss";
  entryPrice: number;
  closePrice: number;
  value: number;
  profit: number;
  timeframe: string;
  createdAt: number;
}

interface PendingMarkerSyncItem {
  operationId: string;
  pair: string;
  type: "buy" | "sell";
  entryPrice: number;
  value: number;
  timeframe: string;
  createdAt: number;
}

interface SettleMarkerMeta {
  pair: string;
  type: "buy" | "sell";
  entryPrice: number;
  value: number;
  timeframe: string;
  createdAt: number;
}

/**
 * Manages the lifecycle of entry markers (Tips) and result popups
 * on the trading chart.
 */
export function useChartMarkers() {
  const [entryMarkers, setEntryMarkers] = useState<EntryMarker[]>([]);
  const [resultMarkers, setResultMarkers] = useState<ResultMarker[]>([]);
  const dismissTimersRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});

  const clearDismissTimer = useCallback((operationId: string) => {
    const timer = dismissTimersRef.current[operationId];
    if (timer) {
      clearTimeout(timer);
      delete dismissTimersRef.current[operationId];
    }
  }, []);

  const dismissResult = useCallback(
    (operationId: string) => {
      clearDismissTimer(operationId);
      setResultMarkers((prev) =>
        prev.filter((m) => m.operationId !== operationId),
      );
    },
    [clearDismissTimer],
  );

  /**
   * Add an entry marker when an order is placed.
   */
  const addEntryMarker = useCallback(
    (marker: Omit<EntryMarker, "id" | "createdAt">) => {
      const id = `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setEntryMarkers((prev) => [
        ...prev,
        { ...marker, id, createdAt: Date.now() },
      ]);
      return id;
    },
    [],
  );

  /**
   * Remove an entry marker (e.g., when the order expires).
   */
  const removeEntryMarker = useCallback((operationId: string) => {
    setEntryMarkers((prev) =>
      prev.filter((m) => m.operationId !== operationId),
    );
  }, []);

  const syncPendingMarkers = useCallback((markers: PendingMarkerSyncItem[]) => {
    setEntryMarkers((prev) => {
      const localOnlyMarkers = prev.filter((marker) =>
        marker.operationId.startsWith("order-"),
      );
      const syncedMarkers = markers.map((marker) => {
        const existing = prev.find(
          (item) => item.operationId === marker.operationId,
        );

        return existing
          ? { ...existing, ...marker }
          : {
              id: `entry-${marker.operationId}`,
              ...marker,
            };
      });

      return [...localOnlyMarkers, ...syncedMarkers];
    });
  }, []);

  /**
   * Convert an entry marker into a result popup.
   * Called when an operation settles.
   */
  const settleMarker = useCallback(
    (
      operationId: string,
      result: "win" | "loss",
      closePrice: number,
      profit: number,
      meta?: SettleMarkerMeta,
    ) => {
      setEntryMarkers((prev) => {
        const entry = prev.find((m) => m.operationId === operationId);
        const source = entry
          ? {
              pair: entry.pair,
              type: entry.type,
              entryPrice: entry.entryPrice,
              value: entry.value,
              timeframe: entry.timeframe,
              createdAt: entry.createdAt,
            }
          : meta;

        if (!source) {
          return prev.filter((m) => m.operationId !== operationId);
        }

        if (entry) {
          const resultId = `result-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          setResultMarkers((rPrev) => [
            ...rPrev,
            {
              id: resultId,
              operationId,
              pair: source.pair,
              type: source.type,
              result,
              entryPrice: source.entryPrice,
              closePrice,
              value: source.value,
              profit,
              timeframe: source.timeframe,
              createdAt: source.createdAt,
            },
          ]);
        }

        if (!entry) {
          const resultId = `result-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          setResultMarkers((rPrev) => [
            ...rPrev.filter((marker) => marker.operationId !== operationId),
            {
              id: resultId,
              operationId,
              pair: source.pair,
              type: source.type,
              result,
              entryPrice: source.entryPrice,
              closePrice,
              value: source.value,
              profit,
              timeframe: source.timeframe,
              createdAt: source.createdAt,
            },
          ]);
        }

        clearDismissTimer(operationId);
        dismissTimersRef.current[operationId] = setTimeout(() => {
          setResultMarkers((rPrev) =>
            rPrev.filter((marker) => marker.operationId !== operationId),
          );
          delete dismissTimersRef.current[operationId];
        }, 8000);

        return prev.filter((m) => m.operationId !== operationId);
      });
    },
    [clearDismissTimer],
  );

  /**
   * Update the operationId of an entry marker after the server confirms
   * the operation (replaces local temp ID with server UUID).
   */
  const updateMarkerOperationId = useCallback(
    (localId: string, serverId: string) => {
      setEntryMarkers((prev) =>
        prev.map((m) =>
          m.operationId === localId ? { ...m, operationId: serverId } : m,
        ),
      );
    },
    [],
  );

  useEffect(
    () => () => {
      Object.values(dismissTimersRef.current).forEach(clearTimeout);
      dismissTimersRef.current = {};
    },
    [],
  );

  return {
    entryMarkers,
    resultMarkers,
    addEntryMarker,
    removeEntryMarker,
    syncPendingMarkers,
    updateMarkerOperationId,
    settleMarker,
    dismissResult,
  };
}
