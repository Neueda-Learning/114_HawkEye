import apiClient from './axios';
import type {
  ApiResponse,
  PagedResponse,
  Rule,
  RuleRequest,
  RuleToggleRequest,
  RuleListParams,
  RuleAuditEntry,
} from '../types';

const BASE = '/api/v1/rules';

// POST /api/v1/rules
export const createRule = async (payload: RuleRequest): Promise<Rule> => {
  const { data } = await apiClient.post<ApiResponse<Rule>>(BASE, payload);
  return data.data;
};

// GET /api/v1/rules
export const getRules = async (params: RuleListParams = {}): Promise<PagedResponse<Rule>> => {
  const { data } = await apiClient.get<ApiResponse<PagedResponse<Rule>>>(BASE, { params });
  return data.data;
};

// GET /api/v1/rules/:id
export const getRuleById = async (id: number): Promise<Rule> => {
  const { data } = await apiClient.get<ApiResponse<Rule>>(`${BASE}/${id}`);
  return data.data;
};

// PUT /api/v1/rules/:id
export const updateRule = async (id: number, payload: RuleRequest): Promise<Rule> => {
  const { data } = await apiClient.put<ApiResponse<Rule>>(`${BASE}/${id}`, payload);
  return data.data;
};

// DELETE /api/v1/rules/:id  (soft delete)
export const deleteRule = async (id: number): Promise<void> => {
  await apiClient.delete(`${BASE}/${id}`);
};

// PUT /api/v1/rules/:id/toggle
export const toggleRule = async (id: number, payload: RuleToggleRequest): Promise<Rule> => {
  const { data } = await apiClient.put<ApiResponse<Rule>>(`${BASE}/${id}/toggle`, payload);
  return data.data;
};

// GET /api/v1/rules/:id/audit-trail
export const getRuleAuditTrail = async (id: number): Promise<PagedResponse<RuleAuditEntry>> => {
  const { data } = await apiClient.get<ApiResponse<PagedResponse<RuleAuditEntry>>>(
    `${BASE}/${id}/audit-trail`,
  );
  return data.data;
};

