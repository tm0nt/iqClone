import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getSessionSecretValue } from "@shared/auth/session-core";

export interface AffiliateSession {
  userId: string;
  email?: string;
}

export async function getAffiliateSession(): Promise<AffiliateSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(
      decodeURIComponent(token),
      new TextEncoder().encode(
        getSessionSecretValue({
          envNames: ["JWT_SECRET_KEY", "SESSION_SECRET"],
          fallback: "Qw3RtY77$",
        }),
      ),
    );

    const userId = payload.userId ?? payload.sub;

    if (!userId) {
      return null;
    }

    return {
      userId: String(userId),
      email: payload.email ? String(payload.email) : undefined,
    };
  } catch {
    return null;
  }
}

export async function requireAffiliateAuth(): Promise<
  | { session: AffiliateSession; error: null }
  | { session: null; error: NextResponse }
> {
  const session = await getAffiliateSession();
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "Não autenticado" }, { status: 401 }),
    };
  }

  return { session, error: null };
}
