"use client";

import { useMemo, useState } from "react";
import { subDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useAsync } from "@/hooks/use-async";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { transactionsService } from "@/lib/services/transactions.service";
import type { AdminTransaction, AdminTransactionsResponse, TransactionStatus, TransactionType } from "@/lib/types/transactions.types";

export type { AdminTransaction, AdminTransactionsResponse, TransactionStatus, TransactionType };

const ITEMS_PER_PAGE = 10;

export function useAdminTransactionsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<AdminTransaction | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  // Debounce no search para evitar chamadas a cada keystroke
  const debouncedSearch = useDebouncedValue(searchTerm, 500);

  const { data, loading } = useAsync(
    () =>
      transactionsService.list({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        dateRange,
        statusFilter,
        typeFilter,
        searchTerm: debouncedSearch,
      }),
    [currentPage, dateRange?.from, dateRange?.to, statusFilter, typeFilter, debouncedSearch],
  );

  const filteredTransactions = useMemo(() => {
    if (!data) return [];

    const transactions =
      typeFilter === "deposit"
        ? data.deposits
        : typeFilter === "withdrawal"
          ? data.withdrawals
          : [...data.deposits, ...data.withdrawals];

    return transactions.filter((transaction) => {
      const normalizedSearch = debouncedSearch.toLowerCase();
      const matchSearch =
        !normalizedSearch ||
        transaction.id.toLowerCase().includes(normalizedSearch) ||
        transaction.nomeCliente.toLowerCase().includes(normalizedSearch) ||
        transaction.email.toLowerCase().includes(normalizedSearch) ||
        transaction.chave?.includes(debouncedSearch);
      const matchStatus =
        statusFilter === "all" || transaction.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [data, debouncedSearch, statusFilter, typeFilter]);

  const totalItems = useMemo(
    () =>
      data
        ? (data.totals.deposits?.total ?? 0) +
          (data.totals.withdrawals?.total ?? 0)
        : 0,
    [data],
  );

  const totalPages = useMemo(
    () => Math.ceil(totalItems / ITEMS_PER_PAGE),
    [totalItems],
  );

  return {
    currentPage,
    data,
    dateRange,
    detailOpen,
    filteredTransactions,
    loading,
    searchTerm,
    selected,
    statusFilter,
    totalItems,
    totalPages,
    typeFilter,
    setCurrentPage,
    setDateRange,
    setDetailOpen,
    setSearchTerm,
    setSelected,
    setStatusFilter,
    setTypeFilter,
  };
}
