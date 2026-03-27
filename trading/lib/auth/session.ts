import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export interface Session {
  userId: string;
  email: string;
}

export async function getSession(): Promise<Session | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return {
    userId: session.user.id,
    email: session.user.email ?? "",
  };
}

export async function requireAuth(): Promise<
  | { session: Session; error: null }
  | { session: null; error: NextResponse }
> {
  const session = await getSession();

  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "Não autenticado" }, { status: 401 }),
    };
  }

  return { session, error: null };
}

export async function requirePageSession(locale: string): Promise<Session> {
  const session = await getSession();

  if (!session) {
    redirect(`/${locale || "pt"}/auth`);
  }

  return session;
}
