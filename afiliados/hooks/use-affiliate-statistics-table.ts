"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

interface AffiliateStatisticsRow {
  date: string;
  uniqueVisitors: number;
  registrations: number;
  firstDeposits: number;
  revenue: number;
}

const ITEMS_PER_PAGE = 10;

const getDefaultDates = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);

  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
};

export function useAffiliateStatisticsTable() {
  const [data, setData] = useState<AffiliateStatisticsRow[]>([]);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const defaults = getDefaultDates();
    setStartDate(defaults.startDate);
    setEndDate(defaults.endDate);
  }, []);

  const fetchData = useCallback(async () => {
    if (!startDate || !endDate) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/account/metrics/general?startDate=${startDate}&endDate=${endDate}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`,
        { cache: "no-store" },
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Erro ao buscar dados.");
      }

      setData(result);
      setTotalItems(result.length);
    } catch {
      setData([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, endDate, startDate]);

  useEffect(() => {
    if (!startDate || !endDate) {
      return;
    }

    void fetchData();
  }, [endDate, fetchData, startDate]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE)),
    [totalItems],
  );

  const paginatedRows = useMemo(
    () =>
      data.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      ),
    [currentPage, data],
  );

  const nextPage = useCallback(() => {
    setCurrentPage((previousPage) => Math.min(previousPage + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((previousPage) => Math.max(previousPage - 1, 1));
  }, []);

  return {
    currentPage,
    endDate,
    loading,
    paginatedRows,
    startDate,
    totalPages,
    setEndDate,
    setStartDate,
    nextPage,
    prevPage,
  };
}
