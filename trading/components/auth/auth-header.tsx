"use client";

/**
 * Cabeçalho para as páginas de autenticação
 *
 * Exibe o logo da plataforma e o título da seção de autenticação.
 * Mantém a consistência visual com o restante da plataforma.
 */

import { motion } from "framer-motion";
import { Logo } from "@/components/logo";

export default function AuthHeader() {
  return (
    <motion.div
      className="flex justify-center mb-10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex flex-col items-center">
        {/* Logo animado da plataforma */}
        <div className="relative mb-2">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute inset-0 rounded-full bg-gradient-to-r from-[rgba(1,219,151,0.2)] to-transparent blur-md"
          />
          <Logo width={200} variant="dark" />
        </div>
      </div>
    </motion.div>
  );
}
