import { api } from "@/lib/api/client";
import { AFFILIATE_ENDPOINTS } from "@/lib/api/endpoints";
import type { AffiliateStatisticsRow } from "@/lib/types/account.types";

const ITEMS_PER_PAGE = 10;

export const statisticsService = {
  async list(
    startDate: string,
    endDate: string,
    page: number,
  ): Promise<AffiliateStatisticsRow[]> {
    return api.get<AffiliateStatisticsRow[]>(
      AFFILIATE_ENDPOINTS.statistics.general(
        startDate,
        endDate,
        page,
        ITEMS_PER_PAGE,
      ),
    );
  },
};
