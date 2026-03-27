import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      error: "WebSocket proxy disabled",
      message:
        "The platform now uses internal /api/market routes and same-origin polling instead of exposing vendor WebSocket endpoints to the browser.",
    },
    { status: 410 },
  );
}
