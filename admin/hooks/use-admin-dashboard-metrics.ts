"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

export interface AdminGeneralDashboardData {
  totalDepositoValor: number;
  totalSaquesComTaxa: number;
  crescimentoClientes: number;
  saquesPendentesCount: number;
  totalSaquesPendentes: number;
  totalClientes: number;
}

export interface AdminDashboardMetrics {
  totalDeposits: number;
  totalWithdrawals: number;
  netRevenue: number;
  clientGrowth: number;
  pendingCount: number;
  pendingValue: number;
  totalClients: number;
  conversionRate: number | null;
}

export function useAdminDashboardMetrics(dateRange: DateRange | undefined) {
  const [data, setData] = useState<AdminGeneralDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (startDate: Date, endDate: Date) => {
    setLoading(true);
    setError(null);

    try {
      const url = `/api/admin/general?startDate=${format(
        startDate,
        "yyyy-MM-dd",
      )}&endDate=${format(endDate, "yyyy-MM-dd")}`;
      const res = await fetch(url, { cache: "no-store" });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.error || "Failed to fetch admin metrics.");
      }

      setData(result);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to fetch admin metrics.",
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!dateRange?.from || !dateRange?.to) return;
    void fetchData(dateRange.from, dateRange.to);
  }, [dateRange?.from, dateRange?.to, fetchData]);

  const metrics = useMemo<AdminDashboardMetrics>(() => {
    const totalDeposits = data?.totalDepositoValor ?? 0;
    const totalWithdrawals = data?.totalSaquesComTaxa ?? 0;
    const totalClients = data?.totalClientes ?? 0;

    return {
      totalDeposits,
      totalWithdrawals,
      netRevenue: totalDeposits - totalWithdrawals,
      clientGrowth: data?.crescimentoClientes ?? 0,
      pendingCount: data?.saquesPendentesCount ?? 0,
      pendingValue: data?.totalSaquesPendentes ?? 0,
      totalClients,
      conversionRate:
        totalDeposits > 0
          ? (totalDeposits / (totalDeposits + (totalClients || 1))) * 100
          : null,
    };
  }, [data]);

  return {
    data,
    loading,
    error,
    metrics,
    refetch: fetchData,
  };
}
