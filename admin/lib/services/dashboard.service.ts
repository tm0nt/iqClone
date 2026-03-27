import { format, endOfMonth, startOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { api } from "@/lib/api/client";
import { ADMIN_ENDPOINTS } from "@/lib/api/endpoints";
import {
  ADMIN_FINANCIAL_INTERVALS,
  type AdminFinancialChartPoint,
  type AdminFinancialInterval,
  type AdminGeneralDashboardData,
} from "@/lib/types/dashboard.types";

export const dashboardService = {
  async getGeneralMetrics(
    startDate: string,
    endDate: string,
  ): Promise<AdminGeneralDashboardData> {
    return api.get<AdminGeneralDashboardData>(
      ADMIN_ENDPOINTS.dashboard.general(startDate, endDate),
    );
  },

  async getFinancialTimeSeries(
    interval: AdminFinancialInterval,
  ): Promise<AdminFinancialChartPoint[]> {
    const months =
      ADMIN_FINANCIAL_INTERVALS.find((i) => i.value === interval)?.months ?? 6;
    const now = new Date();

    const requests = Array.from({ length: months }, (_, index) => {
      const date = subMonths(now, months - 1 - index);
      const start = format(startOfMonth(date), "yyyy-MM-dd");
      const end = format(endOfMonth(date), "yyyy-MM-dd");

      return api
        .get<AdminGeneralDashboardData>(
          ADMIN_ENDPOINTS.dashboard.finance(start, end),
        )
        .then((data) => ({
          name: format(date, "MMM/yy", { locale: ptBR }),
          depositos: Number(data.totalDepositoValor) || 0,
          saques: Number(data.totalSaquesComTaxa) || 0,
        }))
        .catch(() => ({
          name: format(date, "MMM/yy", { locale: ptBR }),
          depositos: 0,
          saques: 0,
        }));
    });

    return Promise.all(requests);
  },
};
