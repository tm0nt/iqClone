import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { kycs, users } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const auth = await requireAdmin("SUPER_ADMIN", "ADMIN");
  if (auth.error) return auth.error;

  try {
    const result = await db.query.kycs.findMany({
      with: {
        user: {
          columns: {
            id: true,
            nome: true,
            email: true,
            cpf: true,
            telefone: true,
            kyc: true,
          },
        },
      },
      orderBy: [desc(kycs.updatedAt), desc(kycs.createdAt)],
      limit: 200,
    });

    const withSecureLinks = result.map((item) => {
      const entries = Object.entries(
        (item.paths as Record<string, unknown> | null) ?? {},
      ).filter(([, value]) => typeof value === "string");

      return {
        ...item,
        paths: Object.fromEntries(
          entries.map(([label]) => [
            label,
            `/api/admin/kyc/${item.id}/files/${label}`,
          ]),
        ),
      };
    });

    return NextResponse.json(withSecureLinks);
  } catch (error) {
    console.error("Erro ao carregar KYC:", error);
    return NextResponse.json(
      { error: "Erro ao carregar KYC" },
      { status: 500 },
    );
  }
}
