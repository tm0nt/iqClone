// utils/formatters.ts
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatUsd } from "@shared/platform/branding";

export function formatCPF(value: string) {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }
  
  export function formatCNPJ(value: string) {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
  }
  
  export function formatPhoneNumber(value: string) {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3")
  }
  
  export function formatCurrencyBRL(value: number) {
    return formatUsd(value);
  }
  export function formatDate(date: string | Date): string {
    const parsedDate = new Date(date);
  
    // Verifica se a data é válida
    if (isNaN(parsedDate.getTime())) {
      throw new Error("Invalid time value");
    }
  
    return format(parsedDate, "dd MMM yyyy", { locale: ptBR }); // Formato: "15 Jan 2023"
  }
