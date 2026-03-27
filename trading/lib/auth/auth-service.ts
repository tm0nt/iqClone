"use client";

import { getProviders, getSession, signIn, signOut } from "next-auth/react";

export async function registerUser(
  name: string,
  email: string,
  password: string,
) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Erro ao registrar");
  }

  return data;
}

export async function loginUser(
  email: string,
  password: string,
  callbackUrl = "/trading",
) {
  const result = await signIn("credentials", {
    email,
    password,
    redirect: false,
    callbackUrl,
  });

  if (!result || result.error || !result.ok) {
    throw new Error(result?.error || "Erro ao fazer login");
  }

  return result;
}

export async function loginWithGoogle(callbackUrl = "/trading") {
  const providers = await getProviders();

  if (!providers?.google) {
    throw new Error("GOOGLE_PROVIDER_UNAVAILABLE");
  }

  return signIn("google", { callbackUrl });
}

export async function getAvailableAuthProviders() {
  return ((await getProviders()) ?? {}) as Record<
    string,
    { id: string; name: string }
  >;
}

export async function logoutUser(redirectTo = "/auth") {
  await signOut({
    redirect: false,
    redirectTo,
  });

  if (typeof window !== "undefined") {
    window.location.href = redirectTo;
  }

  return true;
}

export async function isAuthenticated() {
  const session = await getSession();
  return Boolean(session?.user?.id);
}
