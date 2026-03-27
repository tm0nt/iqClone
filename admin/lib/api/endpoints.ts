export const ADMIN_ENDPOINTS = {
  dashboard: {
    general: (startDate: string, endDate: string) =>
      `/api/admin/general?startDate=${startDate}&endDate=${endDate}`,
    finance: (startDate: string, endDate: string) =>
      `/api/admin/finance?startDate=${startDate}&endDate=${endDate}&interval=monthly`,
  },

  clients: {
    list: (page: number, limit: number) =>
      `/api/admin/clients/list?page=${page}&limit=${limit}`,
    search: (userId: string) =>
      `/api/admin/clients/search?userId=${userId}`,
    update: "/api/admin/clients",
    delete: "/api/admin/clients/delete",
  },

  withdrawals: {
    list: (params: URLSearchParams) => `/api/admin/withdrawals?${params}`,
    detail: (id: string) => `/api/admin/withdrawals/${id}`,
    approve: (id: string) => `/api/admin/withdrawals/${id}/approve`,
    reject: (id: string) => `/api/admin/withdrawals/${id}/reject`,
  },

  transactions: {
    list: (params: URLSearchParams) => `/api/admin/transactions?${params}`,
  },
} as const;
