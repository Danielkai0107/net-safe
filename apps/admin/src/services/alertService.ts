import api from './api';
import type { Alert, PaginatedResponse, AlertType, AlertStatus } from '../types';

export const alertService = {
  getAll: async (
    page: number = 1,
    limit: number = 10,
    tenantId?: string,
    elderId?: string,
    type?: AlertType,
    status?: AlertStatus
  ) => {
    // 過濾掉 undefined 和空字符串的參數
    const params: any = { page, limit };
    if (tenantId) params.tenantId = tenantId;
    if (elderId) params.elderId = elderId;
    if (type) params.type = type;
    if (status) params.status = status;
    
    const response = await api.get<PaginatedResponse<Alert>>(`/alerts`, {
      params,
    });
    return response;
  },

  getOne: async (id: string) => {
    const response = await api.get<Alert>(`/alerts/${id}`);
    return response;
  },

  getStats: async (tenantId?: string) => {
    const response = await api.get(`/alerts/stats`, {
      params: { tenantId },
    });
    return response;
  },

  resolve: async (id: string, resolvedBy: string, resolution: string) => {
    const response = await api.patch<Alert>(`/alerts/${id}/resolve`, {
      resolvedBy,
      resolution,
    });
    return response;
  },

  dismiss: async (id: string) => {
    const response = await api.patch<Alert>(`/alerts/${id}/dismiss`);
    return response;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/alerts/${id}`);
    return response;
  },
};
