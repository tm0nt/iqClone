import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [{ locale }, session] = await Promise.all([params, auth()]);
  redirect(`/${locale}/${session?.user?.id ? "trading" : "auth"}`);
}
