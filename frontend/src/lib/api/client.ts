import axios from 'axios';
import type { ApiResponse, ApiError } from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// =====================
// Request Interceptor
// =====================
apiClient.interceptors.request.use((config) => {
  // Only access localStorage on client side
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// =====================
// Response Interceptor
// =====================
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const data = error.response.data as ApiResponse;

      // Auto redirect to login on 401
      if (error.response.status === 401 && typeof window !== 'undefined') {
        // Don't redirect if already on login page or if this IS the login request
        const isLoginRequest = error.config?.url?.includes('/auth/login');
        if (!isLoginRequest && !window.location.pathname.includes('/login')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }

      // Throw with structured error data
      throw {
        status: error.response.status,
        message: data.message || 'Terjadi kesalahan',
        errors: data.errors || [{ code: 'UNKNOWN', message: data.message || 'Terjadi kesalahan' }],
      };
    }

    // Network error or timeout
    throw {
      status: 0,
      message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
      errors: [{ code: 'NETWORK_ERROR', message: 'Tidak dapat terhubung ke server' }],
    };
  }
);

/**
 * Extracts user-friendly error message from API error.
 */
export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as { message: string }).message;
  }
  return 'Terjadi kesalahan yang tidak terduga';
}

/**
 * Extracts all error details from API error.
 */
export function getErrorDetails(error: unknown): ApiError[] {
  if (error && typeof error === 'object' && 'errors' in error) {
    return (error as { errors: ApiError[] }).errors;
  }
  return [{ code: 'UNKNOWN', message: getErrorMessage(error) }];
}

export default apiClient;
