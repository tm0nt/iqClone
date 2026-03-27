"use server";

import { cookies } from "next/headers";

export async function setAffCookie(aff: string) {
  const cookieStore = await cookies();
  cookieStore.set("aff", aff, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
}
