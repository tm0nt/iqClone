/**
 * Componente de entrada de formulário reutilizável
 *
 * Fornece um campo de entrada estilizado com ícone, validação e feedback visual.
 * Usado em formulários de autenticação para manter consistência visual.
 *
 * @param id - ID único do campo
 * @param label - Rótulo do campo
 * @param type - Tipo de entrada (text, email, etc.)
 * @param value - Valor atual do campo
 * @param onChange - Função de callback para mudanças no campo
 * @param placeholder - Texto de placeholder
 * @param icon - Nome do ícone a ser exibido (mail, user, etc.)
 * @param isValid - Estado de validação do campo (true, false ou null)
 * @param errorMessage - Mensagem de erro para exibir quando inválido
 * @param required - Se o campo é obrigatório
 */

"use client";

import type React from "react";

import { Mail, User, AlertCircle, Check } from "lucide-react";
import { motion } from "framer-motion";

interface FormInputProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon: "mail" | "user" | string;
  isValid?: boolean | null;
  errorMessage?: string;
  required?: boolean;
}

export default function FormInput({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  isValid,
  errorMessage,
  required,
}: FormInputProps) {
  // Função para renderizar o ícone apropriado
  const renderIcon = () => {
    switch (icon) {
      case "mail":
        return (
          <Mail
            size={16}
            className="text-platform-input-subtle transition-colors duration-300 group-focus-within:text-platform-positive"
          />
        );
      case "user":
        return (
          <User
            size={16}
            className="text-platform-input-subtle transition-colors duration-300 group-focus-within:text-platform-positive"
          />
        );
      default:
        return (
          <Mail
            size={16}
            className="text-platform-input-subtle transition-colors duration-300 group-focus-within:text-platform-positive"
          />
        );
    }
  };

  return (
    <div className="mb-6 group">
      <label
        htmlFor={id}
        className="block text-sm text-platform-input-label mb-2 transition-colors duration-300 group-focus-within:text-platform-positive"
      >
        {label}
      </label>
      <div className="relative">
        {/* Ícone à esquerda */}
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          {renderIcon()}
        </div>

        {/* Campo de entrada */}
        <input
          id={id}
          type={type}
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

        {/* Indicador de validação à direita */}
        {isValid !== null && (
          <div className="absolute inset-y-0 right-3 flex items-center">
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

      {/* Mensagem de erro */}
      <AnimatedErrorMessage show={isValid === false} message={errorMessage} />
    </div>
  );
}

// Componente para animar a mensagem de erro
function AnimatedErrorMessage({
  show,
  message,
}: {
  show: boolean;
  message?: string;
}) {
  return (
    <div className="h-5 mt-1 overflow-hidden">
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: show ? 1 : 0, y: show ? 0 : -10 }}
        transition={{ duration: 0.2 }}
        className="text-xs text-platform-negative"
      >
        {message}
      </motion.p>
    </div>
  );
}
