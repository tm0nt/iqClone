/**
 * Componente de alternância entre formulários de autenticação
 *
 * Fornece um link para alternar entre os modos de login e registro.
 *
 * @param message - Mensagem a ser exibida antes do link
 * @param linkText - Texto do link de alternância
 * @param onToggle - Função de callback para alternar o modo
 */

"use client";

import { motion } from "framer-motion";

interface AuthToggleProps {
  message: string;
  linkText: string;
  onToggle: () => void;
}

export default function AuthToggle({
  message,
  linkText,
  onToggle,
}: AuthToggleProps) {
  return (
    <div className="mt-4 text-center">
      <p className="text-sm text-black/65">
        {message}{" "}
        <motion.button
          onClick={onToggle}
          className="relative font-medium text-black transition-colors duration-300 hover:text-black/70"
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {linkText}
          <motion.div
            className="absolute -bottom-1 left-0 right-0 h-[1px] bg-black"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
          />
        </motion.button>
      </p>
    </div>
  );
}
