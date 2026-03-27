"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAsync } from "@/hooks/use-async";
import { paymentsService } from "@/lib/services/payments.service";
import type { AffiliatePayment } from "@/lib/types/account.types";

export type { AffiliatePayment };

export function useAffiliatePaymentsTable(initialSearchQuery = "") {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredStatus, setFilteredStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  const { data, loading } = useAsync(
    () =>
      paymentsService.list({
        searchQuery,
        startDate,
        endDate,
        status: filteredStatus,
      }),
    [searchQuery, startDate, endDate, filteredStatus],
  );

  const payments = data ?? [];

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
