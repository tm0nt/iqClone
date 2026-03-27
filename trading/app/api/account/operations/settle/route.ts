import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRuntimeConfig } from "@/lib/config/runtime-config";
import { ensureSettlementWorkerLoop } from "@/lib/services/settlement-worker";
import { runSettlementBatch } from "@/lib/services/operation-settlement-service";

export const runtime = "nodejs";

ensureSettlementWorkerLoop();

/**
 * POST /api/account/operations/settle
 *
 * Server-side settlement worker trigger.
 * Can be called by internal heartbeat, but settlement also runs continuously
 * in-process on the backend while the Node server is alive.
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("x-settle-secret");
    const { settleSecret } = await getRuntimeConfig();
    if (settleSecret && authHeader !== settleSecret) {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    return NextResponse.json(await runSettlementBatch());
  } catch (error) {
    console.error("[settle] Worker error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
