import api from './api';
import type { Elder, PaginatedResponse } from '../types';

export const elderService = {
  getAll: async (page: number = 1, limit: number = 10, tenantId?: string) => {
    const response = await api.get<PaginatedResponse<Elder>>(`/elders`, {
      params: { page, limit, tenantId },
    });
    return response;
  },

  getOne: async (id: string) => {
    const response = await api.get<Elder>(`/elders/${id}`);
    return response;
  },

  getActivity: async (id: string, hours: number = 24) => {
    const response = await api.get(`/elders/${id}/activity`, {
      params: { hours },
    });
    return response;
  },

  getLocation: async (id: string, limit: number = 50) => {
    const response = await api.get(`/elders/${id}/location`, {
      params: { limit },
    });
    return response;
  },

  create: async (data: Partial<Elder>) => {
    const response = await api.post<Elder>('/elders', data);
    return response;
  },

  update: async (id: string, data: Partial<Elder>) => {
    const response = await api.patch<Elder>(`/elders/${id}`, data);
    return response;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/elders/${id}`);
    return response;
  },

  // 獲取可用設備（該社區未綁定的設備）
  getAvailableDevices: async (tenantId: string) => {
    const response = await api.get(`/elders/available-devices`, {
      params: { tenantId },
    });
    return response;
  },
};
