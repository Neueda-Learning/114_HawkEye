import apiClient from './axios';
import type {
  ApiResponse,
  PagedResponse,
  Alert,
  AlertListParams,
  AlertActionRequest,
  AlertAuditEntry,
  AlertStats,
} from '../types';

const BASE = '/api/v1/alerts';

// GET /api/v1/alerts
export const getAlerts = async (
  params: AlertListParams = {},
): Promise<PagedResponse<Alert>> => {
  const { data } = await apiClient.get<ApiResponse<PagedResponse<Alert>>>(BASE, { params });
  return data.data;
};

// GET /api/v1/alerts/:id
export const getAlertById = async (id: number): Promise<Alert> => {
  const { data } = await apiClient.get<ApiResponse<Alert>>(`${BASE}/${id}`);
  return data.data;
};

// GET /api/v1/alerts/:id/transactions
export const getAlertTransactions = async (id: number) => {
  const { data } = await apiClient.get(`${BASE}/${id}/transactions`);
  return data.data;
};

// PUT /api/v1/alerts/:id/acknowledge
export const acknowledgeAlert = async (
  id: number,
  payload: AlertActionRequest,
): Promise<Alert> => {
  const { data } = await apiClient.put<ApiResponse<Alert>>(
    `${BASE}/${id}/acknowledge`,
    payload,
  );
  return data.data;
};

// PUT /api/v1/alerts/:id/investigate
export const investigateAlert = async (
  id: number,
  payload: AlertActionRequest,
): Promise<Alert> => {
  const { data } = await apiClient.put<ApiResponse<Alert>>(
    `${BASE}/${id}/investigate`,
    payload,
  );
  return data.data;
};

// PUT /api/v1/alerts/:id/close
export const closeAlert = async (
  id: number,
  payload: AlertActionRequest,
): Promise<Alert> => {
  const { data } = await apiClient.put<ApiResponse<Alert>>(`${BASE}/${id}/close`, payload);
  return data.data;
};

// PUT /api/v1/alerts/:id/dismiss
export const dismissAlert = async (
  id: number,
  payload: AlertActionRequest,
): Promise<Alert> => {
  const { data } = await apiClient.put<ApiResponse<Alert>>(`${BASE}/${id}/dismiss`, payload);
  return data.data;
};

// GET /api/v1/alerts/history
export const getAlertHistory = async (
  params: AlertListParams = {},
): Promise<PagedResponse<Alert>> => {
  const { data } = await apiClient.get<ApiResponse<PagedResponse<Alert>>>(`${BASE}/history`, {
    params,
  });
  return data.data;
};

// GET /api/v1/alerts/stats
export const getAlertStats = async (): Promise<AlertStats> => {
  const { data } = await apiClient.get<ApiResponse<AlertStats>>(`${BASE}/stats`);
  return data.data;
};

// GET /api/v1/alerts/:id/audit-trail
export const getAlertAuditTrail = async (id: number): Promise<AlertAuditEntry[]> => {
  const { data } = await apiClient.get<ApiResponse<AlertAuditEntry[]>>(
    `${BASE}/${id}/audit-trail`,
  );
  return data.data;
};

