/**
 * Card principal para os formulários de autenticação
 *
 * Fornece um container consistente para os formulários de login e registro,
 * com estilo visual alinhado à plataforma principal.
 *
 * @param title - Título do card
 * @param subtitle - Subtítulo descritivo
 * @param children - Conteúdo do card (formulários)
 */

import type React from "react";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="relative">
      {/* Cabeçalho do card */}
      <div className="px-8 pb-4 pt-8">
        <h1 className="text-2xl font-bold text-black">
          {title}
        </h1>
        <p className="mt-2 text-sm text-black/55">{subtitle}</p>
      </div>

      {/* Corpo do card */}
      <div className="px-8 pb-8 pt-2">{children}</div>
    </div>
  );
}
