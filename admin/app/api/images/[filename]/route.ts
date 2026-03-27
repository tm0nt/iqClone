/**
 * GET /api/images/[filename]
 *
 * Public, no-auth endpoint that serves uploaded images from public/uploads/.
 * Used by both admin and trading apps to display logos and platform images
 * via absolute URLs stored in the shared database.
 */
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  ico: "image/x-icon",
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename } = await context.params;

  // Security: strip any path traversal attempts
  const safe = path.basename(filename);
  if (!safe || safe.startsWith(".")) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "public", "uploads", safe);

  try {
    const data = await readFile(filePath);
    const ext = path.extname(safe).slice(1).toLowerCase();
    const contentType = MIME[ext] ?? "application/octet-stream";

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        // Allow cross-origin access so the trading app can load images
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
      },
    });
  } catch {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }
}
