import apiClient from './client';
import type { ApiResponse, Book, BookFormData, BookQuery } from '@/types/api';

export const booksApi = {
  getAll: async (query?: BookQuery) => {
    const res = await apiClient.get<ApiResponse<Book[]>>('/books', { params: query });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Book>>(`/books/${id}`);
    return res.data.data!;
  },

  create: async (data: BookFormData) => {
    const res = await apiClient.post<ApiResponse<Book>>('/books', data);
    return res.data.data!;
  },

  update: async (id: string, data: BookFormData) => {
    const res = await apiClient.put<ApiResponse<Book>>(`/books/${id}`, data);
    return res.data.data!;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse>(`/books/${id}`);
    return res.data;
  },

  getCategories: async () => {
    const res = await apiClient.get<ApiResponse<string[]>>('/books/categories');
    return res.data.data!;
  },
};
