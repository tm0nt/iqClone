"use client";

import { useEffect, useCallback, useRef } from "react";
import { useAccountStore } from "@/store/account-store";

const POLL_MS = 5_000;

export interface SyncedPendingOperation {
  id: string;
  asset: string;
  type: "buy" | "sell";
  accountType: "demo" | "real";
  value: number;
  timeframe: string;
  entryTime: string;
  openedAt: number;
  expiryTime: number;
  progress: number;
  entryPrice: number;
  expectedProfit: number;
}

export interface SyncedSettledOperation extends SyncedPendingOperation {
  result: "win" | "loss";
  closePrice: number;
  profit: number;
}

interface UseActiveOperationsOptions {
  onSettle?: (operation: SyncedSettledOperation) => void;
  onSyncPending?: (operations: SyncedPendingOperation[]) => void;
}

/** Raw operation shape returned by /api/account/operations/pending */
interface RawOperation {
  id: string;
  resultado: "ganho" | "perda" | "pendente";
  ativo: string;
  previsao: string;
  valor: number;
  receita: number;
  abertura: number;
  fechamento: number | null;
  tempo: string;
  data: string;
  tipo: "demo" | "real";
  expiresAt: string | null;
  resolvedAt: string | null;
  payoutRateSnapshot: number;
}

/** Maps raw API fields to the common SyncedPendingOperation shape. */
function toSyncedOperation(op: RawOperation): SyncedPendingOperation {
  return {
    id: op.id,
    asset: op.ativo,
    type: op.previsao === "call" ? "buy" : "sell",
    accountType: op.tipo,
    value: op.valor,
    timeframe: op.tempo,
    entryTime: new Date(op.data).toLocaleString("en-US"),
    openedAt: new Date(op.data).getTime(),
    expiryTime: op.expiresAt
      ? new Date(op.expiresAt).getTime()
      : new Date(op.resolvedAt ?? op.data).getTime(),
    progress: 100,
    entryPrice: op.abertura,
    expectedProfit: op.valor * (op.payoutRateSnapshot || 0),
  };
}

/**
 * Polls the server for pending operations and syncs them with
 * the Zustand store. When an operation is settled server-side
 * (by the settlement worker), this hook removes it from
 * activeOperations and triggers a single balance sync.
 */
export function useActiveOperations(options: UseActiveOperationsOptions = {}) {
  const syncBalances = useAccountStore((s) => s.syncBalances);
  const removeOperation = useAccountStore((s) => s.removeOperation);
  const addOperationResult = useAccountStore((s) => s.addOperationResult);
  const syncActiveOperations = useAccountStore((s) => s.syncActiveOperations);
  const handledSettlementsRef = useRef<Set<string>>(new Set());

  const onSettleRef = useRef(options.onSettle);
  onSettleRef.current = options.onSettle;

  const onSyncPendingRef = useRef(options.onSyncPending);
  onSyncPendingRef.current = options.onSyncPending;

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/account/operations/pending", {
        credentials: "include",
      });
      if (!res.ok) return;

      const operations: RawOperation[] = await res.json();

      const pendingOperations: SyncedPendingOperation[] = operations
        .filter((op) => op.resultado === "pendente" && op.expiresAt)
        .map(toSyncedOperation);

      syncActiveOperations(pendingOperations);
      onSyncPendingRef.current?.(pendingOperations);

      let didSettle = false;

      for (const op of operations) {
        if (op.resultado !== "ganho" && op.resultado !== "perda") {
          continue;
        }
        if (handledSettlementsRef.current.has(op.id)) {
          continue;
        }

        const result = op.resultado === "ganho" ? "win" : "loss";
        const closePrice = op.fechamento ?? 0;
        const profit = op.resultado === "ganho" ? op.receita : 0;
        const base = toSyncedOperation(op);
        const settledOperation: SyncedSettledOperation = {
          ...base,
          progress: 0,
          result,
          closePrice,
          profit,
        };

        removeOperation(op.id);
        addOperationResult({
          id: base.id,
          asset: base.asset,
          type: base.type,
          value: base.value,
          timeframe: base.timeframe,
          entryTime: base.entryTime,
          expiryTime: "",
          openPrice: op.abertura.toFixed(4),
          closePrice: closePrice.toFixed(4),
          result,
          profit,
        });

        onSettleRef.current?.(settledOperation);
        handledSettlementsRef.current.add(op.id);
        didSettle = true;
      }

      // Prune handled set to prevent unbounded memory growth
      if (handledSettlementsRef.current.size > 500) {
        const entries = [...handledSettlementsRef.current];
        handledSettlementsRef.current = new Set(entries.slice(-200));
      }

      if (didSettle) {
        syncBalances();
      }
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[useActiveOperations] poll error:", err);
      }
    }
  }, [addOperationResult, removeOperation, syncActiveOperations, syncBalances]);

  useEffect(() => {
    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => clearInterval(interval);
  }, [poll]);
}
