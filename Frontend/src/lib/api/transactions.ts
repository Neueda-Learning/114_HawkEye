import apiClient from './axios';
import type {
  ApiResponse,
  PagedResponse,
  TransactionRequest,
  TransactionResponse,
  TransactionDetailResponse,
  TransactionListParams,
  AlertSummary,
} from '../types';

const BASE = '/api/v1/transactions';

// POST /api/v1/transactions
export const createTransaction = async (
  payload: TransactionRequest,
): Promise<TransactionResponse> => {
  const { data } = await apiClient.post<ApiResponse<TransactionResponse>>(BASE, payload);
  return data.data;
};

// GET /api/v1/transactions
export const getTransactions = async (
  params: TransactionListParams = {},
): Promise<PagedResponse<TransactionResponse>> => {
  const { data } = await apiClient.get<ApiResponse<PagedResponse<TransactionResponse>>>(BASE, {
    params,
  });
  return data.data;
};

// GET /api/v1/transactions/:id
export const getTransactionById = async (id: number): Promise<TransactionDetailResponse> => {
  const { data } = await apiClient.get<ApiResponse<TransactionDetailResponse>>(`${BASE}/${id}`);
  return data.data;
};

// GET /api/v1/transactions/:id/alerts
export const getTransactionAlerts = async (id: number): Promise<AlertSummary[]> => {
  const { data } = await apiClient.get<ApiResponse<AlertSummary[]>>(`${BASE}/${id}/alerts`);
  return data.data;
};

