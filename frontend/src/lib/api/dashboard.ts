import apiClient from './client';
import type { ApiResponse, DashboardStats } from '@/types/api';

export const dashboardApi = {
  getStats: async () => {
    const res = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard');
    return res.data.data!;
  },
};
