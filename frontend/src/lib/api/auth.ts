import apiClient from './client';
import type { ApiResponse, LoginRequest, LoginResponse, User } from '@/types/api';

export const authApi = {
  login: async (data: LoginRequest) => {
    const res = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
    return res.data.data!;
  },

  getProfile: async () => {
    const res = await apiClient.get<ApiResponse<User>>('/auth/profile');
    return res.data.data!;
  },
};
