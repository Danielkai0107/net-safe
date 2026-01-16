import { api } from './api';

export const userService = {
  getAll: (page = 1, limit = 10, tenantId?: string) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (tenantId) params.append('tenantId', tenantId);
    return api.get(`/users?${params.toString()}`);
  },

  getOne: (id: string) => api.get(`/users/${id}`),

  create: (data: any) => api.post('/users', data),

  update: (id: string, data: any) => api.patch(`/users/${id}`, data),

  delete: (id: string) => api.delete(`/users/${id}`),

  toggleActive: (id: string) => api.patch(`/users/${id}/toggle-active`),
};
