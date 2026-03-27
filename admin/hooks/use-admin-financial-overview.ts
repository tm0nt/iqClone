"use client";

import { useMemo, useState } from "react";
import { useAsync } from "@/hooks/use-async";
import { dashboardService } from "@/lib/services/dashboard.service";
import {
  ADMIN_FINANCIAL_INTERVALS,
  type AdminFinancialChartPoint,
  type AdminFinancialInterval,
} from "@/lib/types/dashboard.types";

export type { AdminFinancialChartPoint, AdminFinancialInterval };
export { ADMIN_FINANCIAL_INTERVALS };

export function useAdminFinancialOverview(
  initialInterval: AdminFinancialInterval = "6m",
) {
  const [interval, setInterval] =
    useState<AdminFinancialInterval>(initialInterval);

  const { data, loading, refetch } = useAsync(
    () => dashboardService.getFinancialTimeSeries(interval),
    [interval],
  );

  const chartData = data ?? [];

  const totals = useMemo(() => {
    const totalDeposits = chartData.reduce(
      (sum, item) => sum + item.depositos,
      0,
    );
    const totalWithdrawals = chartData.reduce(
      (sum, item) => sum + item.saques,
      0,
    );
    return {
      totalDeposits,
      totalWithdrawals,
      netRevenue: totalDeposits - totalWithdrawals,
      isEmpty: chartData.every(
        (item) => item.depositos === 0 && item.saques === 0,
      ),
    };
  }, [chartData]);

  return { interval, setInterval, chartData, loading, ...totals, refetch };
}
