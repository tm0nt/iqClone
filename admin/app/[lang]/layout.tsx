export const dynamic = 'force-dynamic';

import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { getAdminSiteConfig } from "@/lib/site-config";
import {
  buildAdminThemeCssVariables,
  buildBrandingCssVariables,
} from "@shared/platform/branding";
import "../globals.css"; // Movido para app/globals.css, import relativo ajustado

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

function resolveMetadataBase(urls: Array<string | null | undefined>) {
  for (const candidate of urls) {
    if (!candidate) continue;

    try {
      return new URL(candidate);
    } catch {
      try {
        return new URL(`https://${candidate}`);
      } catch {
        continue;
      }
    }
  }

  return new URL("http://localhost:3000");
}

export async function generateMetadata(): Promise<Metadata> {
  const config = await getAdminSiteConfig();

  return {
    metadataBase: resolveMetadataBase([config.urlSite]),
    title: `${config.nomeSite} Admin`,
  };
}

export async function generateStaticParams() {
  return [{ lang: 'pt' }, { lang: 'en' }, { lang: 'es' }];
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const config = await getAdminSiteConfig();
  const themeConfig =
    config as unknown as Record<string, string | number | null | undefined>;
  const brandingCssVars = buildBrandingCssVariables(themeConfig);
  const adminThemeCssVars = buildAdminThemeCssVariables(themeConfig);

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      style={{ ...brandingCssVars, ...adminThemeCssVars }}
    >
      <head>
        {config.faviconUrl ? (
          <link rel="icon" href={config.faviconUrl} sizes="any" />
        ) : (
          <>
            <link rel="icon" href="/favicon.ico" sizes="any" />
            <link rel="icon" href="/favicon.png" type="image/svg+xml" />
          </>
        )}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
