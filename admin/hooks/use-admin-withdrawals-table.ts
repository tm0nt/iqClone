"use client";

import { useCallback, useMemo, useState } from "react";
import { subDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useToast } from "@/components/ui/use-toast";
import { useAsync } from "@/hooks/use-async";
import { withdrawalsService } from "@/lib/services/withdrawals.service";
import type { AdminWithdrawal } from "@/lib/types/withdrawals.types";

export type { AdminWithdrawal };

const ITEMS_PER_PAGE = 10;

export function useAdminWithdrawalsTable() {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<AdminWithdrawal | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const { data, loading, refetch } = useAsync(
    () => withdrawalsService.list(currentPage, ITEMS_PER_PAGE, dateRange),
    [currentPage, dateRange?.from, dateRange?.to],
  );

  const withdrawals = data?.withdrawals ?? [];
  const totalItems = data?.total ?? 0;
  const totalPaid = data?.totalPaid ?? 0;
  const totalPending = data?.totalPending ?? 0;
  const totalPaidValue = data?.totalPaidValue ?? 0;
  const totalPendingValue = data?.totalPendingValue ?? 0;
  const totalValue = data?.totalValue ?? 0;
  const totalPages = useMemo(
    () => Math.ceil(totalItems / ITEMS_PER_PAGE),
    [totalItems],
  );

  const filteredWithdrawals = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();
    return withdrawals.filter((w) => {
      const matchSearch =
        !normalizedSearch ||
        w.nomeCliente.toLowerCase().includes(normalizedSearch) ||
        w.email.toLowerCase().includes(normalizedSearch) ||
        w.chave.includes(searchTerm);
      const matchStatus =
        statusFilter === "all" || w.status === statusFilter;
      const matchType = typeFilter === "all" || w.tipo === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [withdrawals, searchTerm, statusFilter, typeFilter]);

  const handleViewDetails = useCallback(
    async (withdrawal: AdminWithdrawal) => {
      try {
        const detail = await withdrawalsService.getById(withdrawal.id);
        setSelected(detail);
        setDetailOpen(true);
      } catch (e) {
        toast({
          title: "Erro",
          description:
            e instanceof Error
              ? e.message
              : "Não foi possível carregar os detalhes do saque",
          variant: "destructive",
        });
      }
    },
    [toast],
  );

  const handleApprove = useCallback(
    async (id: string) => {
      try {
        await withdrawalsService.approve(id);
        toast({ title: "Sucesso", description: "Saque aprovado com sucesso" });
        await refetch();
      } catch (e) {
        toast({
          title: "Erro",
          description:
            e instanceof Error
              ? e.message
              : "Não foi possível aprovar o saque",
          variant: "destructive",
        });
      }
    },
    [refetch, toast],
  );

  const handleReject = useCallback(
    async (id: string) => {
      try {
        await withdrawalsService.reject(id);
        toast({ title: "Sucesso", description: "Saque rejeitado com sucesso" });
        await refetch();
      } catch (e) {
        toast({
          title: "Erro",
          description:
            e instanceof Error
              ? e.message
              : "Não foi possível rejeitar o saque",
          variant: "destructive",
        });
      }
    },
    [refetch, toast],
  );

  return {
    currentPage,
    dateRange,
    detailOpen,
    filteredWithdrawals,
    loading,
    searchTerm,
    selected,
    statusFilter,
    totalItems,
    totalPages,
    totalPaid,
    totalPaidValue,
    totalPending,
    totalPendingValue,
    totalValue,
    typeFilter,
    fetchWithdrawals: refetch,
    handleApprove,
    handleReject,
    handleViewDetails,
    setCurrentPage,
    setDateRange,
    setDetailOpen,
    setSearchTerm,
    setSelected,
    setStatusFilter,
    setTypeFilter,
  };
}
