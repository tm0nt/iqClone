import { runSettlementBatch } from "@/lib/services/operation-settlement-service";

const SETTLEMENT_WORKER_POLL_MS = 5_000;

type SettlementWorkerState = {
  timer: NodeJS.Timeout | null;
  running: boolean;
  lastTickAt: number | null;
  lastSuccessAt: number | null;
};

declare global {
  // eslint-disable-next-line no-var
  var __SETTLEMENT_WORKER_STATE__: SettlementWorkerState | undefined;
}

const workerState: SettlementWorkerState =
  globalThis.__SETTLEMENT_WORKER_STATE__ ?? {
    timer: null,
    running: false,
    lastTickAt: null,
    lastSuccessAt: null,
  };

if (!globalThis.__SETTLEMENT_WORKER_STATE__) {
  globalThis.__SETTLEMENT_WORKER_STATE__ = workerState;
}

async function tickSettlementWorker() {
  if (workerState.running) {
    return;
  }

  workerState.running = true;
  workerState.lastTickAt = Date.now();

  try {
    await runSettlementBatch();
    workerState.lastSuccessAt = Date.now();
  } catch (error) {
    console.error("[settlement-worker] tick failed:", error);
  } finally {
    workerState.running = false;
  }
}

export function ensureSettlementWorkerLoop() {
  if (workerState.timer) {
    return;
  }

  workerState.timer = setInterval(() => {
    void tickSettlementWorker();
  }, SETTLEMENT_WORKER_POLL_MS);
  void tickSettlementWorker();
}
