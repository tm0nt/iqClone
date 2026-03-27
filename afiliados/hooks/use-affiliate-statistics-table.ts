"use client";

import { useCallback, useMemo, useState } from "react";
import { useAsync } from "@/hooks/use-async";
import { statisticsService } from "@/lib/services/statistics.service";
import type { AffiliateStatisticsRow } from "@/lib/types/account.types";

export type { AffiliateStatisticsRow };

const ITEMS_PER_PAGE = 10;

const getDefaultDates = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  return {
    startDate: start.toISOString().split("T")[0] ?? "",
    endDate: end.toISOString().split("T")[0] ?? "",
  };
};

const defaults = getDefaultDates();

export function useAffiliateStatisticsTable() {
  const [startDate, setStartDate] = useState<string>(defaults.startDate);
  const [endDate, setEndDate] = useState<string>(defaults.endDate);
  const [currentPage, setCurrentPage] = useState(1);

  const { data, loading } = useAsync(
    () => {
      if (!startDate || !endDate) return Promise.resolve(null);
      return statisticsService.list(startDate, endDate, currentPage);
    },
    [startDate, endDate, currentPage],
  );

  const rows = data ?? [];
  const totalItems = rows.length;

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE)),
    [totalItems],
  );

  const paginatedRows = useMemo(
    () =>
      rows.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      ),
    [currentPage, rows],
  );

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
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
