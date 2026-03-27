import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAuditLogs } from "@/db/queries";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin("SUPER_ADMIN", "ADMIN");
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = (page - 1) * limit;

  try {
    const logs = await getAuditLogs({ take: limit, offset });

    return NextResponse.json({ auditLogs: logs, total: logs.length });
  } catch (err) {
    console.error("Erro ao buscar logs de auditoria:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor ao buscar logs de auditoria" },
      { status: 500 },
    );
  }
}
