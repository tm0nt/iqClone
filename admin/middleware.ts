// middleware.ts
import { NextResponse, NextRequest } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { readSessionFromCookieValue, isSessionExpired } from '@shared/auth/session-core';

function hasValidJwtSession(token: string | undefined): boolean {
  if (!token) return false;
  let decoded: string;
  try { decoded = decodeURIComponent(token); } catch { return false; }
  if (decoded.split('.').length !== 3) return false;
  const payload = readSessionFromCookieValue(token, { allowLegacyJson: false });
  if (!payload) return false;
  return !isSessionExpired(payload);
}

const locales = ['pt', 'en', 'es'];
const defaultLocale = 'pt';

// Função getLocale exatamente como na documentação
function getLocale(request: NextRequest): string {
  const headers = { 'accept-language': request.headers.get('accept-language') || '' };
  const languages = new Negotiator({ headers: headers }).languages();
  return match(languages, locales, defaultLocale);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificação de locale exatamente como na documentação
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    // Continua para a lógica de auth
  } else {
    // Redirect se não tiver locale
    const locale = getLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  // Extrai locale da path
  const locale = pathname.split('/')[1] || defaultLocale;

  // Lógica de autenticação adaptada (remove prefixo locale para checks)
  const adjustedPathname = pathname.replace(`/${locale}`, '') || '/';

  const token = request.cookies.get('session')?.value;
  const hasValidSession = hasValidJwtSession(token);

  if (adjustedPathname.startsWith('/dashboard')) {
    if (!hasValidSession) {
      request.nextUrl.pathname = `/${locale}/`;
      return NextResponse.redirect(request.nextUrl);
    }
  }

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
    // Matcher exatamente como na documentação, com adições para skip assets/API
    '/((?!_next/static|_next/image|api|favicon.ico|manifest.json|apple-touch-icon.png).*)',
  ],
};
