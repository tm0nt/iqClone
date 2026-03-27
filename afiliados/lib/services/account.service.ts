import { api } from "@/lib/api/client";
import { AFFILIATE_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  AffiliateAccountData,
  AffiliateDashboardMetricsData,
} from "@/lib/types/account.types";

export const accountService = {
  async getInfo(): Promise<AffiliateAccountData> {
    return api.get<AffiliateAccountData>(AFFILIATE_ENDPOINTS.account.info);
  },

  async getDashboardMetrics(
    startDate: string,
    endDate: string,
  ): Promise<AffiliateDashboardMetricsData> {
    return api.get<AffiliateDashboardMetricsData>(
      AFFILIATE_ENDPOINTS.account.general(startDate, endDate),
    );
  },
};
