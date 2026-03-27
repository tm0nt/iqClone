import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin("SUPER_ADMIN");
  if (auth.error) return auth.error;

  const { id } = await context.params;
  return NextResponse.json(
    { error: `Gateway ${id} indisponível nesta instalação.` },
    { status: 410 },
  );
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  return PATCH(request, context);
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin("SUPER_ADMIN");
  if (auth.error) return auth.error;

  const { id } = await context.params;
  return NextResponse.json(
    { error: `Gateway ${id} indisponível nesta instalação.` },
    { status: 410 },
  );
}
