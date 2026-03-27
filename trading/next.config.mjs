// next.config.mjs
import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // =================== Performance ===================
  reactStrictMode: true,

  // Configuração de imagens com domínios conhecidos
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.itick.org" },
      { protocol: "https", hostname: "**.binance.com" },
      { protocol: "https", hostname: "flagcdn.com" },
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
    ],
  },

  // =================== Build ===================
  typescript: {
    // TODO: Remover quando todos os erros de tipo forem corrigidos
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // =================== Bundle Optimization ===================
  // Externaliza pacotes pesados do server bundle
  serverExternalPackages: ["@prisma/client", "bcryptjs", "sharp"],

  // Redirects úteis
  async redirects() {
    return [
      {
        source: "/",
        destination: "/pt/trading",
        permanent: false,
      },
    ];
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
