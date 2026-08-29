import apiClient from './client';
import type { ApiResponse, Member, MemberFormData, MemberQuery } from '@/types/api';

export const membersApi = {
  getAll: async (query?: MemberQuery) => {
    const res = await apiClient.get<ApiResponse<Member[]>>('/members', { params: query });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Member>>(`/members/${id}`);
    return res.data.data!;
  },

  create: async (data: MemberFormData) => {
    const res = await apiClient.post<ApiResponse<Member>>('/members', data);
    return res.data.data!;
  },

  update: async (id: string, data: MemberFormData) => {
    const res = await apiClient.put<ApiResponse<Member>>(`/members/${id}`, data);
    return res.data.data!;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse>(`/members/${id}`);
    return res.data;
  },
};
