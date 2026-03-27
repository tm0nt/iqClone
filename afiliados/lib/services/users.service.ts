import { api } from "@/lib/api/client";
import { AFFILIATE_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  AffiliateUser,
  AffiliateUserAnalyticsMetrics,
  AffiliateUserMetricsPoint,
} from "@/lib/types/account.types";

interface UsersListResponse {
  users: AffiliateUser[];
}

interface RawMetricsPoint {
  date: string;
  newUsers?: number;
  "Novos Usuários"?: number;
  activeUsers?: number;
  "Usuários Ativos"?: number;
  churnRate?: number;
  Churn?: number;
}

export const usersService = {
  async list(): Promise<AffiliateUser[]> {
    const data = await api.get<UsersListResponse>(
      AFFILIATE_ENDPOINTS.affiliate.list,
    );
    return data.users;
  },

  async getAnalyticsMetrics(): Promise<AffiliateUserAnalyticsMetrics> {
    return api.get<AffiliateUserAnalyticsMetrics>(
      AFFILIATE_ENDPOINTS.affiliate.general,
    );
  },

  async getMetricsChart(
    startDate: string,
    endDate: string,
  ): Promise<AffiliateUserMetricsPoint[]> {
    const data = await api.get<RawMetricsPoint[]>(
      AFFILIATE_ENDPOINTS.affiliate.metrics(startDate, endDate),
    );

    return data.map((item) => ({
      date: item.date,
      "Novos Usuários": item.newUsers ?? item["Novos Usuários"] ?? 0,
      "Usuários Ativos": item.activeUsers ?? item["Usuários Ativos"] ?? 0,
      Churn: item.churnRate ?? item.Churn ?? 0,
    }));
  },
};
