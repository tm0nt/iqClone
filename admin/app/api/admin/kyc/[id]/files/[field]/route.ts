import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { kycs } from "@/db/schema";

const PRIVATE_KYC_STORAGE_DIR = path.join(process.cwd(), "private", "kyc");
const MIME_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
};

function normalizeStoredPath(value: string) {
  const normalized = path.posix.normalize(value.replace(/\\/g, "/"));
  if (
    !normalized ||
    normalized === "." ||
    normalized === ".." ||
    normalized.startsWith("../") ||
    normalized.includes("/../")
  ) {
    return null;
  }

  return normalized;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string; field: string }> },
) {
  const auth = await requireAdmin("SUPER_ADMIN", "ADMIN");
  if (auth.error) return auth.error;

  try {
    const { id, field } = await context.params;
    if (!["front", "back", "selfie"].includes(field)) {
      return NextResponse.json({ error: "Arquivo inválido" }, { status: 400 });
    }

    const [kyc] = await db
      .select({ paths: kycs.paths })
      .from(kycs)
      .where(eq(kycs.id, id))
      .limit(1);

    const rawPath = (kyc?.paths as Record<string, unknown> | null)?.[field];
    if (typeof rawPath !== "string" || rawPath.trim().length === 0) {
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
    }

    if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
      const upstream = await fetch(rawPath, { cache: "no-store" });
      if (!upstream.ok) {
        return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
      }

      const contentType =
        upstream.headers.get("content-type") ?? "application/octet-stream";

      return new NextResponse(upstream.body, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "private, no-store",
          "Content-Disposition": `inline; filename="${field}"`,
          "X-Robots-Tag": "noindex, nofollow",
        },
      });
    }

    const safeRelativePath = normalizeStoredPath(rawPath);
    if (!safeRelativePath) {
      return NextResponse.json({ error: "Arquivo inválido" }, { status: 400 });
    }

    const filePath = path.join(PRIVATE_KYC_STORAGE_DIR, safeRelativePath);
    const storageRoot = path.resolve(PRIVATE_KYC_STORAGE_DIR);
    const resolvedFilePath = path.resolve(filePath);
    if (!resolvedFilePath.startsWith(storageRoot + path.sep) && resolvedFilePath !== storageRoot) {
      return NextResponse.json({ error: "Arquivo inválido" }, { status: 400 });
    }

    const file = await readFile(resolvedFilePath);
    const ext = path.extname(safeRelativePath).slice(1).toLowerCase();
    const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
        "Content-Disposition": `inline; filename="${path.basename(safeRelativePath)}"`,
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch (error) {
    console.error("Erro ao carregar arquivo de KYC:", error);
    return NextResponse.json(
      { error: "Erro ao carregar arquivo de KYC" },
      { status: 500 },
    );
  }
}
