import api from './api';
import type { Tenant, PaginatedResponse } from '../types';

export const tenantService = {
  getAll: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<PaginatedResponse<Tenant>>(`/tenants`, {
      params: { page, limit },
    });
    return response;
  },

  getOne: async (id: string) => {
    const response = await api.get<Tenant>(`/tenants/${id}`);
    return response;
  },

  getStats: async (id: string) => {
    const response = await api.get(`/tenants/${id}/stats`);
    return response;
  },

  create: async (data: Partial<Tenant>) => {
    const response = await api.post<Tenant>('/tenants', data);
    return response;
  },

  update: async (id: string, data: Partial<Tenant>) => {
    const response = await api.patch<Tenant>(`/tenants/${id}`, data);
    return response;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/tenants/${id}`);
    return response;
  },

  // App 成員管理
  getAppMembers: async (id: string) => {
    const response = await api.get(`/tenants/${id}/app-members`);
    return response;
  },

  approveMember: async (tenantId: string, memberId: string) => {
    const response = await api.patch(`/tenants/${tenantId}/members/${memberId}/approve`);
    return response;
  },

  rejectMember: async (tenantId: string, memberId: string, reason?: string) => {
    const response = await api.patch(`/tenants/${tenantId}/members/${memberId}/reject`, {
      rejectionReason: reason,
    });
    return response;
  },

  setMemberRole: async (tenantId: string, memberId: string, role: 'MEMBER' | 'ADMIN') => {
    const response = await api.patch(`/tenants/${tenantId}/members/${memberId}/set-role`, {
      role,
    });
    return response;
  },

  addMember: async (tenantId: string, appUserId: string, role: 'MEMBER' | 'ADMIN' = 'MEMBER') => {
    const response = await api.post(`/tenants/${tenantId}/members/add`, {
      appUserId,
      role,
    });
    return response;
  },

  removeMember: async (tenantId: string, memberId: string) => {
    const response = await api.delete(`/tenants/${tenantId}/members/${memberId}`);
    return response;
  },

  // 設備分配管理
  getDevices: async (id: string) => {
    const response = await api.get(`/tenants/${id}/devices`);
    return response;
  },

  assignDevices: async (id: string, deviceIds: string[]) => {
    const response = await api.post(`/tenants/${id}/devices/assign`, { deviceIds });
    return response;
  },

  removeDevice: async (tenantId: string, deviceId: string) => {
    const response = await api.delete(`/tenants/${tenantId}/devices/${deviceId}`);
    return response;
  },
};
