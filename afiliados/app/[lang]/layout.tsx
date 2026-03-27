import type React from "react"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { DynamicThemeProvider } from "@/components/dynamic-theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import "../globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata = {
  title: "Afiliados | Dashboard",
}

export async function generateStaticParams() {
  return [{ lang: "pt" }, { lang: "en" }, { lang: "es" }]
}

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: string }
}) {
  const lang = params.lang

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <DynamicThemeProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </DynamicThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
