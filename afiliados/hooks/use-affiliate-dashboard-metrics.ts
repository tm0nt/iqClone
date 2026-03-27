"use client";

import { useAsync } from "@/hooks/use-async";
import { accountService } from "@/lib/services/account.service";
import type { AffiliateDashboardMetricsData } from "@/lib/types/account.types";

export type { AffiliateDashboardMetricsData };

interface AffiliateDashboardDateRange {
  from: Date;
  to: Date;
}

export function useAffiliateDashboardMetrics(
  dateRange: AffiliateDashboardDateRange,
) {
  const { data, loading, error, refetch } = useAsync(
    () =>
      accountService.getDashboardMetrics(
        dateRange.from.toISOString(),
        dateRange.to.toISOString(),
      ),
    [dateRange.from, dateRange.to],
  );

  return { data, loading, error, refetch };
}
