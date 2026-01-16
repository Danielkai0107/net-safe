import api from './api';
import type { DashboardStats } from '../types';

export const dashboardService = {
  getOverview: async () => {
    const response = await api.get<DashboardStats>('/dashboard/overview');
    return response;
  },

  getTenantStats: async (tenantId: string) => {
    const response = await api.get(`/dashboard/tenant/${tenantId}`);
    return response;
  },

  getActivity: async (tenantId?: string, days: number = 7) => {
    const response = await api.get('/dashboard/activity', {
      params: { tenantId, days },
    });
    return response;
  },

  getAlertsSummary: async (tenantId?: string) => {
    const response = await api.get('/dashboard/alerts-summary', {
      params: { tenantId },
    });
    return response;
  },
};
