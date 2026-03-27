import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import authConfig, { publicAuthPages } from "@/auth.config";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);
const { auth } = NextAuth(authConfig);
const authCookieNames = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "authjs.callback-url",
  "__Secure-authjs.callback-url",
  "authjs.csrf-token",
  "__Host-authjs.csrf-token",
] as const;

function hasAuthCookies(req: NextRequest) {
  return authCookieNames.some((name) => req.cookies.has(name));
}

function clearAuthCookies(response: NextResponse) {
  for (const cookieName of authCookieNames) {
    response.cookies.set(cookieName, "", {
      expires: new Date(0),
      path: "/",
    });
  }
}

function stripLocalePrefix(pathname: string) {
  const segs = pathname.split("/");
  const cand = segs[1];
  const isLocale = routing.locales.includes(cand as (typeof routing.locales)[number]);

  if (isLocale) {
    const rest = `/${segs.slice(2).join("/")}`;
    return { locale: cand, pathNoLocale: rest === "//" ? "/" : rest };
  }

  return { locale: routing.defaultLocale, pathNoLocale: pathname };
}

export default auth((req) => {
  const i18nRes = handleI18nRouting(req);

  if (
    i18nRes.headers.get("location") ||
    i18nRes.headers.get("x-middleware-rewrite")
  ) {
    return i18nRes;
  }

  const { pathname, search } = req.nextUrl;
  const { locale, pathNoLocale } = stripLocalePrefix(pathname);
  const hasValidSession = Boolean(req.auth?.user?.id);

  const isAuth = pathNoLocale === "/auth" || pathNoLocale.startsWith("/auth/");
  const isRoot = pathNoLocale === "/";
  const withLocale = (path: string) => `/${locale}${path}`;

  if (hasValidSession && (isAuth || isRoot)) {
    const url = req.nextUrl.clone();
    url.pathname = withLocale("/trading");
    url.search = "";
    return NextResponse.redirect(url);
  }

  const isPublicUI = publicAuthPages.some(
    (page) => pathNoLocale === page || pathNoLocale.startsWith(`${page}/`),
  );

  if (!hasValidSession && !isPublicUI) {
    const url = req.nextUrl.clone();
    url.pathname = withLocale("/auth");

    const callbackUrl = `${pathname}${search}`;
    if (callbackUrl && callbackUrl !== "/") {
      url.searchParams.set("callbackUrl", callbackUrl);
    } else {
      url.search = "";
    }

    const response = NextResponse.redirect(url);

    if (hasAuthCookies(req)) {
      clearAuthCookies(response);
    }

    return response;
  }

  if (!hasValidSession && hasAuthCookies(req)) {
    clearAuthCookies(i18nRes);
  }

  return i18nRes;
});

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
