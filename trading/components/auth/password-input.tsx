/**
 * Componente de entrada de senha
 *
 * Fornece um campo de senha estilizado com toggle de visibilidade,
 * validação e feedback visual.
 *
 * @param id - ID único do campo
 * @param label - Rótulo do campo
 * @param value - Valor atual do campo
 * @param onChange - Função de callback para mudanças no campo
 * @param placeholder - Texto de placeholder
 * @param isValid - Estado de validação do campo (true, false ou null)
 * @param errorMessage - Mensagem de erro para exibir quando inválido
 * @param required - Se o campo é obrigatório
 */

"use client";

import type React from "react";

import { useState } from "react";
import { Lock, Eye, EyeOff, AlertCircle, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  isValid?: boolean | null;
  errorMessage?: string;
  required?: boolean;
}

export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  isValid,
  errorMessage,
  required,
}: PasswordInputProps) {
  // Estado para controlar a visibilidade da senha
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mb-6 group">
      <label
        htmlFor={id}
        className="block text-sm text-platform-input-label mb-2 transition-colors duration-300 group-focus-within:text-platform-positive"
      >
        {label}
      </label>
      <div className="relative">
        {/* Ícone de cadeado à esquerda */}
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Lock
            size={16}
            className="text-platform-input-subtle transition-colors duration-300 group-focus-within:text-platform-positive"
          />
        </div>

        {/* Campo de senha */}
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          className={`w-full bg-platform-input-bg/80 backdrop-blur-sm border-2 rounded-xl py-3 pl-10 pr-10 text-white focus:outline-none transition-all duration-300 ${
            isValid === true
              ? "border-platform-positive"
              : isValid === false
                ? "border-platform-negative"
                : "border-platform-input-border/80 group-focus-within:border-platform-positive/70"
          } focus:shadow-[0_0_15px_rgba(1,219,151,0.15)]`}
          placeholder={placeholder}
          required={required}
        />

        {/* Botão de toggle de visibilidade */}
        <button
          type="button"
          className="absolute inset-y-0 right-3 flex items-center"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={showPassword ? "visible" : "hidden"}
              initial={{ opacity: 0, rotate: -10 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 10 }}
              transition={{ duration: 0.2 }}
            >
              {showPassword ? (
                <EyeOff
                  size={18}
                  className="text-platform-input-subtle hover:text-white transition-colors"
                />
              ) : (
                <Eye
                  size={18}
                  className="text-platform-input-subtle hover:text-white transition-colors"
                />
              )}
            </motion.div>
          </AnimatePresence>
        </button>

        {/* Indicador de validação (exibido apenas quando isValid não é null) */}
        {isValid !== null && (
          <div className="absolute inset-y-0 right-10 flex items-center">
            {isValid ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <Check size={18} className="text-platform-positive" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <AlertCircle size={18} className="text-platform-negative" />
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Mensagem de erro - exibida apenas quando isValid é false */}
      <div className="h-5 mt-1 overflow-hidden">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{
            opacity: isValid === false ? 1 : 0,
            y: isValid === false ? 0 : -10,
          }}
          transition={{ duration: 0.2 }}
          className="text-xs text-platform-negative"
        >
          {errorMessage}
        </motion.p>
      </div>
    </div>
  );
}
