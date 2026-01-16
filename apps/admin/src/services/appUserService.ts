import { api } from './api';

export const appUserService = {
  getAll: (page = 1, limit = 10) => {
    return api.get(`/app-users?page=${page}&limit=${limit}`);
  },

  // 獲取所有啟用的用戶（用於選擇器）
  getAllForSelection: () => {
    return api.get(`/app-users/selection/available`);
  },

  getOne: (id: string) => api.get(`/app-users/${id}`),

  update: (id: string, data: any) => api.patch(`/app-users/${id}`, data),

  toggleActive: (id: string) => api.patch(`/app-users/${id}/toggle-active`),

  delete: (id: string) => api.delete(`/app-users/${id}`),
};
