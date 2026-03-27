import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const auth = await requireAdmin("SUPER_ADMIN", "ADMIN");
  if (auth.error) return auth.error;
  return NextResponse.json([]);
}

export async function POST(_request: NextRequest) {
  const auth = await requireAdmin("SUPER_ADMIN");
  if (auth.error) return auth.error;

  return NextResponse.json(
    { error: "Gateways de pagamento estão desabilitados nesta instalação." },
    { status: 410 },
  );
}
