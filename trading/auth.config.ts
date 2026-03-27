import type { NextAuthConfig } from "next-auth";
import { getAuthSessionSecret } from "@/lib/auth/session-secret";

export const publicAuthPages = ["/auth"];

export const authCallbacks: NonNullable<NextAuthConfig["callbacks"]> = {
  async jwt({ token, user }) {
    if (user?.id) {
      token.id = user.id;
    }

    if (user?.email) {
      token.email = user.email;
    }

    if (user?.name) {
      token.name = user.name;
    }

    if (user?.image) {
      token.picture = user.image;
    }

    return token;
  },
  async session({ session, token }) {
    if (session.user) {
      session.user.id = String(token.id ?? token.sub ?? "");
      session.user.email = session.user.email ?? token.email ?? "";
      session.user.name = session.user.name ?? (typeof token.name === "string" ? token.name : null);
      session.user.image =
        session.user.image ?? (typeof token.picture === "string" ? token.picture : null);
    }

    return session;
  },
};

const authConfig = {
  secret: getAuthSessionSecret(),
  providers: [],
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  callbacks: authCallbacks,
} satisfies NextAuthConfig;

export default authConfig;
