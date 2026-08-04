import apiClient from './axios';
import type {
  PagedResponse,
  Alert,
  AlertListParams,
  AlertActionRequest,
  AlertAuditEntry,
  AlertStats,
  TransactionResponse,
} from '../types';

const BASE = '/api/v1/alerts';

// GET /api/v1/alerts - Backend returns PagedResponseDTO directly (not wrapped in ApiResponse)
export const getAlerts = async (
  params: AlertListParams = {},
): Promise<PagedResponse<Alert>> => {
  const { data } = await apiClient.get<PagedResponse<Alert>>(BASE, { params });
  return data;
};

// GET /api/v1/alerts/:id - Backend returns AlertResponseDTO directly
export const getAlertById = async (id: number): Promise<Alert> => {
  const { data } = await apiClient.get<Alert>(`${BASE}/${id}`);
  return data;
};

// GET /api/v1/alerts/:id/transactions - Backend returns List<TransactionResponseDTO>
export const getAlertTransactions = async (id: number): Promise<TransactionResponse[]> => {
  const { data } = await apiClient.get<TransactionResponse[]>(`${BASE}/${id}/transactions`);
  return data;
};

// PUT /api/v1/alerts/:id/acknowledge - Backend takes no body
export const acknowledgeAlert = async (id: number): Promise<Alert> => {
  const { data } = await apiClient.put<Alert>(`${BASE}/${id}/acknowledge`);
  return data;
};

// PUT /api/v1/alerts/:id/investigate - Backend takes no body
export const investigateAlert = async (id: number): Promise<Alert> => {
  const { data } = await apiClient.put<Alert>(`${BASE}/${id}/investigate`);
  return data;
};

// PUT /api/v1/alerts/:id/close - Backend takes optional AlertStatusUpdateDTO {resolutionNotes}
export const closeAlert = async (
  id: number,
  payload?: AlertActionRequest,
): Promise<Alert> => {
  const { data } = await apiClient.put<Alert>(`${BASE}/${id}/close`, payload);
  return data;
};

// PUT /api/v1/alerts/:id/dismiss - Backend takes optional AlertStatusUpdateDTO {resolutionNotes}
export const dismissAlert = async (
  id: number,
  payload?: AlertActionRequest,
): Promise<Alert> => {
  const { data } = await apiClient.put<Alert>(`${BASE}/${id}/dismiss`, payload);
  return data;
};

// GET /api/v1/alerts/history - Backend returns PagedResponseDTO directly
export const getAlertHistory = async (
  params: AlertListParams = {},
): Promise<PagedResponse<Alert>> => {
  const { data } = await apiClient.get<PagedResponse<Alert>>(`${BASE}/history`, {
    params,
  });
  return data;
};

// GET /api/v1/alerts/stats - Backend returns AlertStatsResponseDTO directly
export const getAlertStats = async (): Promise<AlertStats> => {
  const { data } = await apiClient.get<AlertStats>(`${BASE}/stats`);
  return data;
};

// GET /api/v1/alerts/:id/audit-trail - Backend returns PagedResponseDTO<AlertAuditTrailResponseDTO>
export const getAlertAuditTrail = async (
  id: number,
  page = 0,
  size = 20,
): Promise<PagedResponse<AlertAuditEntry>> => {
  const { data } = await apiClient.get<PagedResponse<AlertAuditEntry>>(
    `${BASE}/${id}/audit-trail`,
    { params: { page, size } },
  );
  return data;
};

