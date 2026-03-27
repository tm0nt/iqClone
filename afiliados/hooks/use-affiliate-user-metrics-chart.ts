"use client";

import { useState } from "react";
import { useAsync } from "@/hooks/use-async";
import { usersService } from "@/lib/services/users.service";
import type { AffiliateUserMetricsPoint } from "@/lib/types/account.types";

export type { AffiliateUserMetricsPoint };

export function useAffiliateUserMetricsChart() {
  const [startDate, setStartDate] = useState("2020-01-01");
  const [endDate, setEndDate] = useState(
    () => new Date().toISOString().split("T")[0] ?? "",
  );

  const { data, loading } = useAsync(
    () => {
      if (!startDate || !endDate) return Promise.resolve(null);
      return usersService.getMetricsChart(startDate, endDate);
    },
    [startDate, endDate],
  );

  return {
    data: data ?? [],
    startDate,
    endDate,
    loading,
    setStartDate,
    setEndDate,
  };
}
