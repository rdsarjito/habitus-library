import apiClient from './client';
import type { ApiResponse, Loan, CreateLoanRequest, ReturnLoanRequest, LoanQuery } from '@/types/api';

export const loansApi = {
  getAll: async (query?: LoanQuery) => {
    const res = await apiClient.get<ApiResponse<Loan[]>>('/loans', { params: query });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Loan>>(`/loans/${id}`);
    return res.data.data!;
  },

  create: async (data: CreateLoanRequest) => {
    const res = await apiClient.post<ApiResponse<Loan>>('/loans', data);
    return res.data.data!;
  },

  returnLoan: async (id: string, data?: ReturnLoanRequest) => {
    const res = await apiClient.patch<ApiResponse<Loan>>(`/loans/${id}/return`, data || {});
    return res.data;
  },
};
