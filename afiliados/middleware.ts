import { NextResponse, NextRequest } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { hasActiveSessionCookie } from '@shared/auth/session-core';

const locales = ['pt', 'en', 'es'];
const defaultLocale = 'pt';

function getLocale(request: NextRequest): string {
  const headers = { 'accept-language': request.headers.get('accept-language') || '' };
  const languages = new Negotiator({ headers }).languages();
  return match(languages, locales, defaultLocale);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  // Extract locale from path
  const locale = pathname.split('/')[1] || defaultLocale;
  const adjustedPathname = pathname.replace(`/${locale}`, '') || '/';

  const token = request.cookies.get('session')?.value;
  const hasValidSession = hasActiveSessionCookie(token);

  // Protect dashboard routes
  if (adjustedPathname.startsWith('/dashboard')) {
    if (!hasValidSession) {
      request.nextUrl.pathname = `/${locale}/`;
      return NextResponse.redirect(request.nextUrl);
    }
  }

  // Redirect authenticated users from login to dashboard
  if (adjustedPathname === '/') {
    if (!hasValidSession) {
      return NextResponse.next();
    }
    request.nextUrl.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(request.nextUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|api|favicon.ico|manifest.json|apple-touch-icon.png).*)',
  ],
};
