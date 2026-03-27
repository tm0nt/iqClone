import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { api } from "@/lib/api/client";
import { ADMIN_ENDPOINTS } from "@/lib/api/endpoints";
import type { AdminWithdrawal, WithdrawalsResponse } from "@/lib/types/withdrawals.types";

export const withdrawalsService = {
  async list(
    page: number,
    limit: number,
    dateRange?: DateRange,
  ): Promise<WithdrawalsResponse> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (dateRange?.from) {
      params.set("startDate", format(dateRange.from, "yyyy-MM-dd"));
    }

    if (dateRange?.to) {
      params.set("endDate", format(dateRange.to, "yyyy-MM-dd"));
    }

    return api.get<WithdrawalsResponse>(ADMIN_ENDPOINTS.withdrawals.list(params));
  },

  async getById(id: string): Promise<AdminWithdrawal> {
    return api.get<AdminWithdrawal>(ADMIN_ENDPOINTS.withdrawals.detail(id));
  },

  async approve(id: string): Promise<void> {
    await api.put(ADMIN_ENDPOINTS.withdrawals.approve(id));
  },

  async reject(id: string): Promise<void> {
    await api.put(ADMIN_ENDPOINTS.withdrawals.reject(id));
  },
};
