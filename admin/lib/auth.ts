import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { eq } from "drizzle-orm";
import { jwtVerify } from "jose";
import { getAdminRuntimeConfig } from "@/lib/runtime-config";

/**
 * Extrai o adminId do cookie de sessão.
 * Retorna null se não autenticado.
 */
export async function getAdminIdFromSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  try {
    const runtimeConfig = await getAdminRuntimeConfig();
    const { payload } = await jwtVerify(
      decodeURIComponent(token),
      new TextEncoder().encode(runtimeConfig.adminSessionSecret),
    );
    const userId = payload.userId ?? payload.sub;
    return userId ? String(userId) : null;
  } catch {
    return null;
  }
}

type Role = "SUPER_ADMIN" | "ADMIN" | "ASSISTANT_ADMIN";

/**
 * Verifica se o admin autenticado possui um dos níveis requeridos.
 * Retorna o adminId se autorizado, ou um NextResponse de erro.
 */
export async function requireAdmin(
  ...requiredRoles: Role[]
): Promise<
  | { adminId: string; error: null }
  | { adminId: null; error: NextResponse }
> {
  const adminId = await getAdminIdFromSession();
  if (!adminId) {
    return {
      adminId: null,
      error: NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
    };
  }

  const admin = await db
    .select({ nivel: admins.nivel })
    .from(admins)
    .where(eq(admins.id, adminId))
    .limit(1);

  if (!admin[0]) {
    return {
      adminId: null,
      error: NextResponse.json({ error: "Admin não encontrado" }, { status: 401 }),
    };
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(admin[0].nivel)) {
    return {
      adminId: null,
      error: NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 }),
    };
  }

  return { adminId, error: null };
}
