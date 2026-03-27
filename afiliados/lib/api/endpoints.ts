export const AFFILIATE_ENDPOINTS = {
  account: {
    info: "/api/account",
    general: (startDate: string, endDate: string) =>
      `/api/account/general?startDate=${startDate}&endDate=${endDate}`,
  },

  affiliate: {
    list: "/api/account/affiliate/list",
    general: "/api/account/affiliate/general",
    metrics: (startDate: string, endDate: string) =>
      `/api/account/affiliate/metrics?startDate=${startDate}&endDate=${endDate}`,
  },

  offers: {
    list: "/api/account/offer/list",
  },

  statistics: {
    general: (
      startDate: string,
      endDate: string,
      page: number,
      limit: number,
    ) =>
      `/api/account/metrics/general?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`,
  },

  withdrawals: {
    list: (params: URLSearchParams) => `/api/account/withdraw?${params}`,
    create: "/api/account/withdraw",
  },
} as const;
