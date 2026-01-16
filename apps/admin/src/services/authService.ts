import api from './api';
import type { LoginRequest, LoginResponse, User } from '../types';

export const authService = {
  login: async (credentials: LoginRequest) => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response;
  },

  getProfile: async () => {
    const response = await api.get<User>('/auth/profile');
    return response;
  },

  getMe: async () => {
    const response = await api.get<User>('/auth/me');
    return response;
  },
};
