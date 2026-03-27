"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export type AdminFinancialInterval = "3m" | "6m" | "12m";

export const ADMIN_FINANCIAL_INTERVALS: Array<{
  label: string;
  value: AdminFinancialInterval;
  months: number;
}> = [
  { label: "3M", value: "3m", months: 3 },
  { label: "6M", value: "6m", months: 6 },
  { label: "12M", value: "12m", months: 12 },
];

export interface AdminFinancialChartPoint {
  name: string;
  depositos: number;
  saques: number;
}

export function useAdminFinancialOverview(
  initialInterval: AdminFinancialInterval = "6m",
) {
  const [interval, setInterval] =
    useState<AdminFinancialInterval>(initialInterval);
  const [chartData, setChartData] = useState<AdminFinancialChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTimeSeries = useCallback(
    async (intervalValue: AdminFinancialInterval) => {
      setLoading(true);
      const months =
        ADMIN_FINANCIAL_INTERVALS.find((item) => item.value === intervalValue)
          ?.months ?? 6;
      const now = new Date();

      try {
        const requests = Array.from({ length: months }, (_, index) => {
          const date = subMonths(now, months - 1 - index);
          const start = format(startOfMonth(date), "yyyy-MM-dd");
          const end = format(endOfMonth(date), "yyyy-MM-dd");

          return fetch(
            `/api/admin/finance?startDate=${start}&endDate=${end}&interval=monthly`,
            { cache: "no-store" },
          )
            .then((response) => response.json())
            .then((data) => ({
              name: format(date, "MMM/yy", { locale: ptBR }),
              depositos: Number(data.totalDepositoValor) || 0,
              saques: Number(data.totalSaquesComTaxa) || 0,
            }));
        });

        const results = await Promise.all(requests);
        setChartData(results);
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Erro ao buscar dados financeiros", error);
        }
        setChartData([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchTimeSeries(interval);
  }, [fetchTimeSeries, interval]);

  const totals = useMemo(() => {
    const totalDeposits = chartData.reduce((sum, item) => sum + item.depositos, 0);
    const totalWithdrawals = chartData.reduce((sum, item) => sum + item.saques, 0);

    return {
      totalDeposits,
      totalWithdrawals,
      netRevenue: totalDeposits - totalWithdrawals,
      isEmpty: chartData.every(
        (item) => item.depositos === 0 && item.saques === 0,
      ),
    };
  }, [chartData]);

  return {
    interval,
    setInterval,
    chartData,
    loading,
    ...totals,
  };
}
