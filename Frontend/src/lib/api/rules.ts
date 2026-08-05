import apiClient from './axios';
import type {
  Rule,
  RuleRequest,
  RuleToggleRequest,
  RuleListParams,
  RuleAuditEntry,
} from '../types';

const BASE = '/api/v1/rules';

// Spring Page interface (backend returns this, not PagedResponse)
interface SpringPage<T> {
  content: T[];
  number: number;  // Spring uses 'number' not 'page'
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// Backend returns RuleActionResponse (success status + rule data)
interface RuleActionResponse {
  success: boolean;
  message: string;
  rule: Rule;
}

// Helper to convert Spring Page to PagedResponse
function toPagedResponse<T>(springPage: SpringPage<T>) {
  return {
    content: springPage.content,
    page: springPage.number,  // Convert 'number' to 'page'
    size: springPage.size,
    totalElements: springPage.totalElements,
    totalPages: springPage.totalPages,
    first: springPage.first,
    last: springPage.last,
  };
}

// POST /api/v1/rules - Backend returns RuleActionResponse directly
export const createRule = async (payload: RuleRequest): Promise<Rule> => {
  const body = {
    ruleName: payload.name,
    name: payload.name,
    description: payload.description || '',
    ruleType: payload.ruleType,
    severity: payload.severity,
    parameters: payload.parameters,
    createdBy: payload.performedBy || 'admin@hawkeye.com',
    performedBy: payload.performedBy || 'admin@hawkeye.com',
    changeReason: payload.changeReason || 'Rule created',
  };
  const { data } = await apiClient.post<RuleActionResponse>(BASE, body);
  return data.rule || (data as unknown as Rule);
};

// GET /api/v1/rules - Backend returns Spring Page<RuleResponse> directly
export const getRules = async (params: RuleListParams = {}) => {
  const { data } = await apiClient.get<SpringPage<Rule>>(BASE, { params });
  return toPagedResponse(data);
};

// GET /api/v1/rules/:id - Backend returns RuleResponse directly
export const getRuleById = async (id: number): Promise<Rule> => {
  const { data } = await apiClient.get<Rule>(`${BASE}/${id}`);
  return data;
};

// PUT /api/v1/rules/:id - Backend returns RuleActionResponse directly
export const updateRule = async (id: number, payload: RuleRequest): Promise<Rule> => {
  const body = {
    ruleName: payload.name,
    name: payload.name,
    description: payload.description || '',
    ruleType: payload.ruleType,
    severity: payload.severity,
    parameters: payload.parameters,
    updatedBy: payload.performedBy || 'admin@hawkeye.com',
    performedBy: payload.performedBy || 'admin@hawkeye.com',
    changeReason: payload.changeReason || 'Rule updated',
  };
  const { data } = await apiClient.put<RuleActionResponse>(`${BASE}/${id}`, body);
  return data.rule || (data as unknown as Rule);
};

// DELETE /api/v1/rules/:id - Backend requires performedBy query param, returns RuleActionResponse
export const deleteRule = async (id: number, performedBy: string, reason?: string): Promise<void> => {
  await apiClient.delete(`${BASE}/${id}`, {
    params: { performedBy, reason },
  });
};

// PUT /api/v1/rules/:id/toggle - Backend returns RuleActionResponse directly
export const toggleRule = async (id: number, payload: RuleToggleRequest): Promise<Rule> => {
  const { data} = await apiClient.put<RuleActionResponse>(`${BASE}/${id}/toggle`, payload);
  return data.rule;
};

// GET /api/v1/rules/:id/audit-trail - Backend returns Spring Page<RuleAuditTrailResponse>
export const getRuleAuditTrail = async (
  id: number,
  page = 0,
  size = 20,
) => {
  const { data } = await apiClient.get<SpringPage<RuleAuditEntry>>(
    `${BASE}/${id}/audit-trail`,
    { params: { page, size } },
  );
  return toPagedResponse(data);
};

