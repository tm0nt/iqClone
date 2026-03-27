"use client";

import { useCallback, useEffect, useState } from "react";

export interface AffiliateDashboardMetricsData {
  receitaTotal: number;
  usuariosAtivos: {
    totalUsuarios: number;
    crescimento: number;
  };
  conversoes: number;
  saldoDisponivel: number;
}

interface AffiliateDashboardDateRange {
  from: Date;
  to: Date;
}

export function useAffiliateDashboardMetrics(
  dateRange: AffiliateDashboardDateRange,
) {
  const [data, setData] = useState<AffiliateDashboardMetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
      });

      const res = await fetch(`/api/account/general?${params.toString()}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Erro ao buscar métricas.");
      }

      const json = await res.json();
      setData(json);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Erro ao buscar métricas.",
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [dateRange.from, dateRange.to]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
