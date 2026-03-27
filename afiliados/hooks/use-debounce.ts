"use client";

import { useEffect, useState } from "react";

/**
 * Retorna uma versão debounced do valor fornecido.
 * Útil para evitar chamadas de API a cada keystroke.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
