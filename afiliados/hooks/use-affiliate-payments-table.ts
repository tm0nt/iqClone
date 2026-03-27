"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export interface AffiliatePayment {
  id: string;
  tipo: string;
  valor: number;
  status: "concluido" | "pendente" | "cancelado";
  metodo: string;
  dataPedido?: string;
}

export function useAffiliatePaymentsTable(initialSearchQuery = "") {
  const { toast } = useToast();
  const [payments, setPayments] = useState<AffiliatePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredStatus, setFilteredStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  const fetchPayments = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        searchQuery,
        startDate,
        endDate,
        status: filteredStatus,
      });

      const response = await fetch(`/api/account/withdraw?${params.toString()}`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Erro ao buscar pagamentos.");
      }

      setPayments(data.withdrawals || []);
    } catch (error) {
      setPayments([]);
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os pagamentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [endDate, filteredStatus, searchQuery, startDate, toast]);

  useEffect(() => {
    void fetchPayments();
  }, [fetchPayments]);

  const filteredPayments = useMemo(() => {
    const normalizedSearch = searchQuery.toLowerCase();

    return payments.filter(
      (payment) =>
        payment.id.toLowerCase().includes(normalizedSearch) ||
        payment.status.toLowerCase().includes(normalizedSearch),
    );
  }, [payments, searchQuery]);

  const handleExport = useCallback(() => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Referência", "Valor", "Status", "Método", "Data"].join(",") +
      "\n" +
      payments
        .map((payment) =>
          [
            payment.id,
            payment.valor.toFixed(2),
            payment.status,
            "pix",
            payment.dataPedido,
          ].join(","),
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "pagamentos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [payments]);

  return {
    endDate,
    filteredPayments,
    filteredStatus,
    loading,
    searchQuery,
    setEndDate,
    setFilteredStatus,
    setSearchQuery,
    setStartDate,
    startDate,
    handleExport,
  };
}
