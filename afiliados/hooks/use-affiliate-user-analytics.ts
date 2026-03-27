"use client";

import { useCallback, useEffect, useState } from "react";

export interface AffiliateUserAnalyticsMetrics {
  totalAffiliates: number;
  newAffiliates: number;
  activeUsers: number;
  churnRate: number;
  percentageChangeTotalAffiliates: number;
  percentageChangeNewAffiliates: number;
  percentageChangeChurnRate: number;
}

export function useAffiliateUserAnalytics() {
  const [metrics, setMetrics] = useState<AffiliateUserAnalyticsMetrics | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/account/affiliate/general", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data?.error || "Não foi possível carregar as métricas.");
      }

      setMetrics(data);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Não foi possível carregar as métricas.",
      );
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics,
  };
}
