"use client";

import { useAsync } from "@/hooks/use-async";
import { usersService } from "@/lib/services/users.service";
import type { AffiliateUserAnalyticsMetrics } from "@/lib/types/account.types";

export type { AffiliateUserAnalyticsMetrics };

export function useAffiliateUserAnalytics() {
  const { data: metrics, loading, error, refetch } = useAsync(
    () => usersService.getAnalyticsMetrics(),
    [],
  );

  return { metrics, loading, error, refetch };
}
