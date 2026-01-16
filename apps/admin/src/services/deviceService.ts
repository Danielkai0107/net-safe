import api from "./api";
import type { Device, PaginatedResponse } from "../types";

export const deviceService = {
  getAll: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<PaginatedResponse<Device>>(`/devices`, {
      params: { page, limit },
    });
    return response;
  },

  getOne: async (id: string) => {
    const response = await api.get<Device>(`/devices/${id}`);
    return response;
  },

  getByMacAddress: async (macAddress: string) => {
    const response = await api.get<Device>(`/devices/mac/${macAddress}`);
    return response;
  },

  create: async (data: Partial<Device>) => {
    const response = await api.post<Device>("/devices", data);
    return response;
  },

  update: async (id: string, data: Partial<Device>) => {
    const response = await api.patch<Device>(`/devices/${id}`, data);
    return response;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/devices/${id}`);
    return response;
  },

  // 關聯設備到長者
  assignToElder: async (deviceId: string, elderId: string) => {
    const response = await api.patch<Device>(`/devices/${deviceId}`, {
      elderId,
    });
    return response;
  },
};
