import type React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const [{ locale }, session] = await Promise.all([params, auth()]);

  if (!session?.user?.id) {
    redirect(`/${locale}/auth`);
  }

  return children;
}
