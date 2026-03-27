"use client";

import { useState, useEffect } from "react";
import { validaCPF } from "@/lib/utils";

export function useCpfMask(initialValue = "") {
  const [value, setValue] = useState(initialValue);
  const [maskedValue, setMaskedValue] = useState("");
  const [isValid, setIsValid] = useState(false);

  // Função para aplicar a máscara de CPF (XXX.XXX.XXX-XX)
  const applyMask = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numericValue = value.replace(/\D/g, "");

    // Limita a 11 dígitos
    const limitedValue = numericValue.slice(0, 11);

    // Verifica se o CPF é válido
    const cpfIsValid =
      limitedValue.length === 11 ? validaCPF(limitedValue) : false;
    setIsValid(cpfIsValid);

    // Aplica a máscara
    let maskedValue = "";

    if (limitedValue.length > 0) {
      maskedValue = limitedValue.slice(0, 3);

      if (limitedValue.length > 3) {
        maskedValue += "." + limitedValue.slice(3, 6);
      }

      if (limitedValue.length > 6) {
        maskedValue += "." + limitedValue.slice(6, 9);
      }

      if (limitedValue.length > 9) {
        maskedValue += "-" + limitedValue.slice(9, 11);
      }
    }

    return { numericValue: limitedValue, maskedValue, isValid: cpfIsValid };
  };

  // Atualiza o valor e a máscara quando o valor muda
  const handleChange = (newValue: string) => {
    const { numericValue, maskedValue, isValid } = applyMask(newValue);
    setValue(numericValue);
    setMaskedValue(maskedValue);
    setIsValid(isValid);
    return { value: numericValue, maskedValue, isValid };
  };

  // Aplica a máscara ao valor inicial
  useEffect(() => {
    if (initialValue) {
      handleChange(initialValue);
    }
  }, [initialValue]);

  return { value, maskedValue, isValid, handleChange };
}
