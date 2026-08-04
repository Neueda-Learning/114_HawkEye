import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

// ─── Axios Instance ───────────────────────────────────────────────────────────
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor — attach JWT ─────────────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Token is kept in memory via Zustand — imported lazily to avoid circular deps
    const token = sessionStorage.getItem('hawkeye_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor — centralised error mapping ────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; statusCode?: number }>) => {
    if (error.response) {
      const { status, data } = error.response;

      // 401 — token expired → redirect to login
      if (status === 401) {
        sessionStorage.removeItem('hawkeye_token');
        window.location.href = '/login';
      }

      // 403 — unauthorized role
      if (status === 403) {
        window.location.href = '/unauthorized';
      }

      // Normalise error message
      const message = data?.message ?? error.message ?? 'An unexpected error occurred';
      return Promise.reject(new Error(message));
    }

    if (error.request) {
      return Promise.reject(new Error('No response from server. Check your connection.'));
    }

    return Promise.reject(error);
  },
);

export default apiClient;

