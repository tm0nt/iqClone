"use client";

import { useEffect, useRef } from "react";

const SETTLE_INTERVAL_MS = 5_000;

/**
 * Client-side heartbeat that triggers the server-side settlement worker.
 * This ensures expired operations are settled even if the original
 * client that placed the trade has disconnected.
 *
 * The actual settlement logic runs server-side — this hook just pings it.
 */
export function useSettlementWorker() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const settle = async () => {
      try {
        await fetch("/api/account/operations/settle", {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          keepalive: true,
        });
      } catch {
        // Silent — next tick will retry
      }
    };

    // Run immediately on mount
    void settle();

    const handleWake = () => {
      void settle();
    };

    intervalRef.current = setInterval(settle, SETTLE_INTERVAL_MS);
    window.addEventListener("focus", handleWake);
    document.addEventListener("visibilitychange", handleWake);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("focus", handleWake);
      document.removeEventListener("visibilitychange", handleWake);
    };
  }, []);
}
