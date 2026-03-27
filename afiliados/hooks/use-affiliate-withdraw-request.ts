"use client";

import { useCallback, useMemo, useState } from "react";
import { formatCPF, formatCNPJ } from "@/utils/formatters";

interface UseAffiliateWithdrawRequestOptions {
  availableBalance: number;
  fee: number;
  onSuccess?: () => void | Promise<void>;
  toast: (input: {
    variant?: "default" | "destructive" | "success" | "warning" | "info";
    title: string;
    description: string;
  }) => void;
}

export function useAffiliateWithdrawRequest({
  availableBalance,
  fee,
  onSuccess,
  toast,
}: UseAffiliateWithdrawRequestOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState("");
  const [document, setDocument] = useState("");
  const [pixKeyType, setPixKeyType] = useState("");
  const [pixKey, setPixKey] = useState("");

  const resetForm = useCallback(() => {
    setAmount("");
    setDocument("");
    setPixKeyType("");
    setPixKey("");
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    resetForm();
  }, [resetForm]);

  const formattedDocument = useMemo(() => {
    if (!document) return "";
    return document.length <= 14 ? formatCPF(document) : formatCNPJ(document);
  }, [document]);

  const setFormattedDocument = useCallback((value: string) => {
    if (value.length <= 14) {
      setDocument(formatCPF(value));
      return;
    }
    setDocument(formatCNPJ(value));
  }, []);

  const submit = useCallback(async () => {
    const numericAmount = Number.parseFloat(amount);

    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "O valor do saque deve ser maior que zero!",
      });
      return false;
    }

    if (numericAmount > availableBalance) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Saldo insuficiente para o saque!",
      });
      return false;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/account/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          valor: numericAmount,
          tipoChave: pixKeyType,
          chave: pixKey,
          tipo: "afiliado",
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data?.error || "Erro ao processar o saque");
      }

      toast({
        variant: "success",
        title: "Saque solicitado",
        description: "Seu saque foi solicitado com sucesso!",
      });

      await onSuccess?.();
      close();
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Ocorreu um erro ao tentar solicitar o saque. Tente novamente.",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [
    amount,
    availableBalance,
    close,
    onSuccess,
    pixKey,
    pixKeyType,
    toast,
  ]);

  return {
    amount,
    availableBalance,
    close,
    document: formattedDocument,
    fee,
    isOpen,
    isSubmitting,
    open,
    pixKey,
    pixKeyType,
    setAmount,
    setDocument: setFormattedDocument,
    setPixKey,
    setPixKeyType,
    submit,
  };
}
