// app/[locale]/layout.tsx
import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import {
  PlatformTrackingNoScript,
  PlatformTrackingScripts,
} from "@/components/platform-tracking-scripts";
import "./globals.css";
import { ThemeProvider } from "@/contexts/theme-context";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import {
  getPlatformConfig,
  type PlatformConfigValue,
} from "@/lib/config/site-config";
import { buildBrandingCssVariables } from "@shared/platform/branding";

const inter = Inter({ subsets: ["latin"] });

function resolveMetadataBase(urls: Array<string | null | undefined>) {
  for (const candidate of urls) {
    if (!candidate) {
      continue;
    }

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

// (Opcional) Metadata dinâmica; pode permanecer aqui por locale
export async function generateMetadata(): Promise<Metadata> {
  const config = await getPlatformConfig();
  const siteName = config.nomeSite;

  return {
    metadataBase: resolveMetadataBase([
      config.urlSite,
    ]),
    title: siteName,
    description: `${siteName} - Plataforma completa para trading`,
    applicationName: siteName,
    keywords: [
      siteName,
      "trading",
      "binary options",
      "forex",
      "crypto",
      "market data",
    ],
    openGraph: {
      title: siteName,
      description: `${siteName} - Plataforma completa para trading`,
      siteName,
      images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: `${siteName} - Plataforma completa para trading`,
      images: ["/og-image.jpg"],
    },
  };
}

// Root layout por locale
export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Sinaliza o locale atual ao servidor (SSG/SSR e cache estático)
  setRequestLocale(locale);

  // Carrega mensagens do locale atual a partir do request config (src/i18n/request.ts)
  const messages = await getMessages();
  const config = (await getPlatformConfig()) as PlatformConfigValue;
  const brandingCssVars = buildBrandingCssVariables(
    config as unknown as Record<string, string | number | null | undefined>,
  );

  return (
    <html lang={locale} style={brandingCssVars}>
      <head>
        {/* Preconnect to admin asset origin so logo/images load faster */}
        {process.env.ADMIN_BASE_URL && (
          <link rel="preconnect" href={process.env.ADMIN_BASE_URL} />
        )}
        {config.faviconUrl ? (
          <link rel="icon" href={config.faviconUrl} />
        ) : (
          <>
            <link rel="icon" href="/favicon.ico" sizes="any" />
            <link rel="icon" href="/favicon.png" type="image/svg+xml" />
          </>
        )}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#000000" />
        <PlatformTrackingScripts
          googleAnalyticsId={config.googleAnalyticsId}
          googleTagManagerId={config.googleTagManagerId}
          facebookPixelId={config.facebookPixelId}
          trackRegisterEvents={config.trackRegisterEvents}
          trackDepositEvents={config.trackDepositEvents}
          trackWithdrawalEvents={config.trackWithdrawalEvents}
        />
      </head>
      <body className={`${inter.className} platform-body`}>
        <PlatformTrackingNoScript
          googleTagManagerId={config.googleTagManagerId}
          facebookPixelId={config.facebookPixelId}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
