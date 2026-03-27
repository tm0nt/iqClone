/** @type {import('next').NextConfig} */
const nextConfig = {
  // =================== Performance ===================
  reactStrictMode: true,

  // i18n via route segments [lang]
  // Removido i18n nativo — usa file-based routing com [lang]

  // Configuração de imagens
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "localhost" },
    ],
    // Desotimizado por enquanto — ativar quando tiver domínio de produção
    unoptimized: true,
  },

  // =================== Build ===================
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TODO: Remover quando todos os erros de tipo forem corrigidos
    ignoreBuildErrors: true,
  },

  // Externaliza pacotes pesados do server bundle
  serverExternalPackages: ["bcryptjs"],

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

export default nextConfig;
