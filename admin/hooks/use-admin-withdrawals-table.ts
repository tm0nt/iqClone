"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useToast } from "@/components/ui/use-toast";

export interface AdminWithdrawal {
  id: string;
  status: string;
  tipo: string;
  valor: number;
  chave: string;
  tipoChave: string;
  email: string;
  dataPedido: string;
  dataPagamento: string | null;
  nomeCliente: string;
  user: {
    nome?: string | null;
    email?: string | null;
  } | null;
  taxa: number;
  idCliente: string;
  userId?: string;
}

interface WithdrawalsResponse {
  withdrawals: AdminWithdrawal[];
  total: number;
  totalPaid: number;
  totalPending: number;
  totalPaidValue: number;
  totalPendingValue: number;
  totalValue: number;
}

const ITEMS_PER_PAGE = 10;

export function useAdminWithdrawalsTable() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<AdminWithdrawal | null>(null);
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [totalPendingValue, setTotalPendingValue] = useState(0);
  const [totalPaidValue, setTotalPaidValue] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const fetchWithdrawals = useCallback(async (page = currentPage) => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(ITEMS_PER_PAGE),
      });

      if (dateRange?.from) {
        params.set("startDate", format(dateRange.from, "yyyy-MM-dd"));
      }

      if (dateRange?.to) {
        params.set("endDate", format(dateRange.to, "yyyy-MM-dd"));
      }

      const response = await fetch(`/api/admin/withdrawals?${params.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar saques");
      }

      const data: WithdrawalsResponse = await response.json();
      setWithdrawals(data.withdrawals);
      setTotalItems(data.total);
      setTotalPaid(data.totalPaid);
      setTotalPending(data.totalPending);
      setTotalPaidValue(data.totalPaidValue);
      setTotalPendingValue(data.totalPendingValue);
      setTotalValue(data.totalValue);
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os saques",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, dateRange, toast]);

  useEffect(() => {
    void fetchWithdrawals(currentPage);
  }, [currentPage, dateRange?.from, dateRange?.to, fetchWithdrawals]);

  const filteredWithdrawals = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return withdrawals.filter((withdrawal) => {
      const matchSearch =
        !normalizedSearch ||
        withdrawal.nomeCliente.toLowerCase().includes(normalizedSearch) ||
        withdrawal.email.toLowerCase().includes(normalizedSearch) ||
        withdrawal.chave.includes(searchTerm);
      const matchStatus =
        statusFilter === "all" || withdrawal.status === statusFilter;
      const matchType =
        typeFilter === "all" || withdrawal.tipo === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [searchTerm, statusFilter, typeFilter, withdrawals]);

  const handleViewDetails = useCallback(async (withdrawal: AdminWithdrawal) => {
    try {
      const response = await fetch(`/api/admin/withdrawals/${withdrawal.id}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar detalhes");
      }

      setSelected(await response.json());
      setDetailOpen(true);
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes do saque",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleApprove = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/withdrawals/${id}/approve`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Erro ao aprovar");
      }

      toast({
        title: "Sucesso",
        description: "Saque aprovado com sucesso",
      });
      await fetchWithdrawals(currentPage);
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível aprovar o saque",
        variant: "destructive",
      });
    }
  }, [currentPage, fetchWithdrawals, toast]);

  const handleReject = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/withdrawals/${id}/reject`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Erro ao rejeitar");
      }

      toast({
        title: "Sucesso",
        description: "Saque rejeitado com sucesso",
      });
      await fetchWithdrawals(currentPage);
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar o saque",
        variant: "destructive",
      });
    }
  }, [currentPage, fetchWithdrawals, toast]);

  const totalPages = useMemo(
    () => Math.ceil(totalItems / ITEMS_PER_PAGE),
    [totalItems],
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
    fetchWithdrawals,
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
