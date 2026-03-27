import { format, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { api } from "@/lib/api/client";
import { ADMIN_ENDPOINTS } from "@/lib/api/endpoints";
import type { AdminTransactionsResponse } from "@/lib/types/transactions.types";

interface TransactionsListParams {
  page: number;
  limit: number;
  dateRange: DateRange;
  statusFilter?: string;
  typeFilter?: string;
  searchTerm?: string;
}

export const transactionsService = {
  async list({
    page,
    limit,
    dateRange,
    statusFilter,
    typeFilter,
    searchTerm,
  }: TransactionsListParams): Promise<AdminTransactionsResponse> {
    const startDate = dateRange?.from
      ? format(dateRange.from, "yyyy-MM-dd")
      : format(subDays(new Date(), 30), "yyyy-MM-dd");
    const endDate = dateRange?.to
      ? format(dateRange.to, "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd");

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      startDate,
      endDate,
    });

    if (statusFilter && statusFilter !== "all") {
      params.set("status", statusFilter);
    }

    if (typeFilter && typeFilter !== "all") {
      params.set("type", typeFilter);
    }

    if (searchTerm) {
      params.set("search", searchTerm);
    }

    return api.get<AdminTransactionsResponse>(
      ADMIN_ENDPOINTS.transactions.list(params),
    );
  },
};
