"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useToast } from "@/components/ui/use-toast";

export type TransactionStatus =
  | "pendente"
  | "processando"
  | "concluido"
  | "cancelado";
export type TransactionType = "deposit" | "withdrawal";
type DepositType = "pix" | "boleto" | "ted" | "cartao";
type WithdrawalType = "usuario" | "afiliado";
type PixKeyType = "cpf" | "cnpj" | "email" | "telefone" | "aleatoria";

export interface AdminTransaction {
  id: string;
  transactionId?: string;
  type: TransactionType;
  status: TransactionStatus;
  tipo: DepositType | WithdrawalType;
  valor: number;
  data: string;
  dataPagamento: string | null;
  email: string;
  nomeCliente: string;
  idCliente: string;
  chave?: string;
  tipoChave?: PixKeyType;
}

export interface AdminTransactionsResponse {
  deposits: AdminTransaction[];
  withdrawals: AdminTransaction[];
  totals: {
    deposits: {
      total: number;
      totalProcessing: number;
      totalCompleted: number;
      totalPending: number;
      totalCanceled: number;
      totalProcessingValue: number;
      totalCompletedValue: number;
      totalPendingValue: number;
      totalCanceledValue: number;
      totalValue: number;
    } | null;
    withdrawals: {
      total: number;
      totalProcessing: number;
      totalCompleted: number;
      totalPending: number;
      totalCanceled: number;
      totalProcessingValue: number;
      totalCompletedValue: number;
      totalPendingValue: number;
      totalCanceledValue: number;
      totalValue: number;
    } | null;
  };
  startDate: string;
  endDate: string;
}

const ITEMS_PER_PAGE = 10;

export function useAdminTransactionsTable() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<AdminTransaction | null>(null);
  const [data, setData] = useState<AdminTransactionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const fetchTransactions = useCallback(async (page = currentPage) => {
    setLoading(true);

    try {
      const startDate = dateRange?.from
        ? format(dateRange.from, "yyyy-MM-dd")
        : format(subDays(new Date(), 30), "yyyy-MM-dd");
      const endDate = dateRange?.to
        ? format(dateRange.to, "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd");

      const params = new URLSearchParams({
        page: String(page),
        limit: String(ITEMS_PER_PAGE),
        startDate,
        endDate,
      });

      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      if (typeFilter !== "all") {
        params.set("type", typeFilter);
      }

      if (searchTerm) {
        params.set("search", searchTerm);
      }

      const response = await fetch(`/api/admin/transactions?${params.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar transações");
      }

      setData(await response.json());
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as transações",
        variant: "destructive",
      });
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [currentPage, dateRange, searchTerm, statusFilter, toast, typeFilter]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        void fetchTransactions(currentPage);
      },
      searchTerm ? 500 : 0,
    );

    return () => window.clearTimeout(timer);
  }, [
    currentPage,
    dateRange?.from,
    dateRange?.to,
    fetchTransactions,
    searchTerm,
    statusFilter,
    typeFilter,
  ]);

  const filteredTransactions = useMemo(() => {
    if (!data) {
      return [];
    }

    const transactions =
      typeFilter === "deposit"
        ? data.deposits
        : typeFilter === "withdrawal"
          ? data.withdrawals
          : [...data.deposits, ...data.withdrawals];

    return transactions.filter((transaction) => {
      const normalizedSearch = searchTerm.toLowerCase();
      const matchSearch =
        !normalizedSearch ||
        transaction.id.toLowerCase().includes(normalizedSearch) ||
        transaction.nomeCliente.toLowerCase().includes(normalizedSearch) ||
        transaction.email.toLowerCase().includes(normalizedSearch) ||
        transaction.chave?.includes(searchTerm);
      const matchStatus =
        statusFilter === "all" || transaction.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [data, searchTerm, statusFilter, typeFilter]);

  const totalItems = useMemo(
    () =>
      data
        ? (data.totals.deposits?.total || 0) +
          (data.totals.withdrawals?.total || 0)
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
    fetchTransactions,
    setCurrentPage,
    setDateRange,
    setDetailOpen,
    setSearchTerm,
    setSelected,
    setStatusFilter,
    setTypeFilter,
  };
}
