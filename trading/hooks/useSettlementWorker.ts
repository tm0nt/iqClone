"use client";

/**
 * Server-side settlement loop handles settlement automatically via
 * ensureSettlementWorkerLoop() — started when any API route is first hit.
 * The useActiveOperations hook polls /pending every 5s, which triggers the
 * server-side loop startup. No client-side heartbeat needed.
 */
export function useSettlementWorker() {
  // No-op: server-side settlement worker handles this.
}
