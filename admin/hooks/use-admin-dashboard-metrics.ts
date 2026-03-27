"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useAsync } from "@/hooks/use-async";
import { dashboardService } from "@/lib/services/dashboard.service";
import type {
  AdminDashboardMetrics,
  AdminGeneralDashboardData,
} from "@/lib/types/dashboard.types";

export type { AdminDashboardMetrics, AdminGeneralDashboardData };

export function useAdminDashboardMetrics(dateRange: DateRange | undefined) {
  const { data, loading, error, refetch } = useAsync(
    () => {
      if (!dateRange?.from || !dateRange?.to) return Promise.resolve(null);
      return dashboardService.getGeneralMetrics(
        format(dateRange.from, "yyyy-MM-dd"),
        format(dateRange.to, "yyyy-MM-dd"),
      );
    },
    [dateRange?.from, dateRange?.to],
  );

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

  return { data, loading, error, metrics, refetch };
}
