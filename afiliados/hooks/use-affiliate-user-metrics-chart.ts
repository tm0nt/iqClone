"use client";

import { useCallback, useEffect, useState } from "react";

export interface AffiliateUserMetricsPoint {
  date: string;
  "Novos Usuários": number;
  "Usuários Ativos": number;
  Churn: number;
}

export function useAffiliateUserMetricsChart() {
  const [data, setData] = useState<AffiliateUserMetricsPoint[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialStartDate = "2020-01-01";
    const today = new Date().toISOString().split("T")[0];
    setStartDate(initialStartDate);
    setEndDate(today);
  }, []);

  const fetchMetrics = useCallback(async (rangeStart: string, rangeEnd: string) => {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/account/affiliate/metrics?startDate=${rangeStart}&endDate=${rangeEnd}`,
        { cache: "no-store" },
      );
      const payload = await response.json();

      if (!response.ok || payload.error || !Array.isArray(payload)) {
        throw new Error(payload?.error || "Erro ao buscar métricas.");
      }

      setData(
        payload.map((item: any) => ({
          date: item.date,
          "Novos Usuários": item.newUsers ?? item["Novos Usuários"] ?? 0,
          "Usuários Ativos": item.activeUsers ?? item["Usuários Ativos"] ?? 0,
          Churn: item.churnRate ?? item.Churn ?? 0,
        })),
      );
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Erro ao buscar métricas:", error);
      }
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!startDate || !endDate) return;
    void fetchMetrics(startDate, endDate);
  }, [endDate, fetchMetrics, startDate]);

  return {
    data,
    startDate,
    endDate,
    loading,
    setStartDate,
    setEndDate,
  };
}
