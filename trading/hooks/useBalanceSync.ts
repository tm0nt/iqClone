"use client";

import { useEffect, useRef } from "react";
import { useAccountStore } from "@/store/account-store";

const SYNC_INTERVAL_MS = 15_000; // sync every 15 seconds (operations also trigger sync on settle)

/**
 * Periodically syncs the user's balance from the database (via API)
 * into the Zustand store, ensuring the UI always reflects the
 * authoritative Prisma state.
 *
 * Also syncs immediately on mount.
 */
export function useBalanceSync() {
  const syncBalances = useAccountStore((s) => s.syncBalances);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Immediate sync on mount
    syncBalances();

    intervalRef.current = setInterval(() => {
      syncBalances();
    }, SYNC_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [syncBalances]);
}
