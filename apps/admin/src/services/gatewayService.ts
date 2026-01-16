import api from './api';
import type { Gateway, PaginatedResponse, GatewayType } from '../types';

export const gatewayService = {
  getAll: async (page: number = 1, limit: number = 10, tenantId?: string, type?: GatewayType) => {
    // 過濾掉 undefined 和空字符串的參數
    const params: any = { page, limit };
    if (tenantId) params.tenantId = tenantId;
    if (type) params.type = type;
    
    const response = await api.get<PaginatedResponse<Gateway>>(`/gateways`, {
      params,
    });
    return response;
  },

  getOne: async (id: string) => {
    const response = await api.get<Gateway>(`/gateways/${id}`);
    return response;
  },

  create: async (data: Partial<Gateway>) => {
    const response = await api.post<Gateway>('/gateways', data);
    return response;
  },

  update: async (id: string, data: Partial<Gateway>) => {
    const response = await api.patch<Gateway>(`/gateways/${id}`, data);
    return response;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/gateways/${id}`);
    return response;
  },
};
