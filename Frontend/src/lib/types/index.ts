// ─── Enums ────────────────────────────────────────────────────────────────────

export type TransactionType = 'DEBIT' | 'CREDIT';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
export type AccountType = 'PERSONAL' | 'BUSINESS' | 'CORPORATE';
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'CLOSED' | 'DISMISSED';
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RuleType = 'AMOUNT_THRESHOLD' | 'VELOCITY' | 'NEW_PAYEE' | 'DAILY_LIMIT';
export type RuleStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED';
export type UserRole = 'CUSTOMER' | 'ANALYST' | 'ADMIN';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  accountId?: string; // only for CUSTOMER role
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

// ─── Common Wrappers ──────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T;
  timestamp: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

// ─── Account ──────────────────────────────────────────────────────────────────

export interface Account {
  accountId: string;
  accountName: string;
  accountType: AccountType;
  dailyLimit: number;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Payee ────────────────────────────────────────────────────────────────────

export interface Payee {
  payeeId: string;
  payeeName: string;
  payeeType: string;
  createdAt: string;
}

// ─── Transaction ──────────────────────────────────────────────────────────────

export interface TransactionRequest {
  accountId: string;
  payeeId: string;
  payeeName?: string;   // optional — auto-creates payee if not found
  payeeType?: string;   // optional — e.g. VENDOR, MERCHANT
  amount: number;
  currency?: string;
  transactionType: TransactionType;
  description?: string;
  timestamp?: string;
}

export interface TransactionResponse {
  transactionId: number;
  accountId: string;
  accountName: string;
  payeeId: string;
  payeeName: string;
  amount: number;
  currency: string;
  transactionType: TransactionType;
  status: TransactionStatus;
  description: string | null;
  timestamp: string;
  createdAt: string;
}

export interface TransactionDetailResponse extends TransactionResponse {
  alerts: AlertSummary[];   // backend field name is "alerts" not "linkedAlerts"
}

export interface TransactionListParams {
  accountId?: string;
  status?: TransactionStatus;
  transactionType?: TransactionType;
  payeeId?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sort?: string;
}

// ─── Alert ────────────────────────────────────────────────────────────────────

// AlertSummaryDTO — read-only summary returned inside transaction detail
// Fields match backend AlertSummaryDTO exactly
export interface AlertSummary {
  alertId: number;
  ruleId: number;           // backend returns ruleId (not ruleName/ruleType)
  alertStatus: AlertStatus;
  severity: Severity;
  alertMessage: string;     // human-readable alert message
  createdAt: string;
}

export interface Alert {
  alertId: number;
  ruleId: number;
  ruleName: string;
  ruleType?: RuleType;
  accountId: string;
  accountName?: string;
  transactionId: number;
  alertStatus: AlertStatus;
  severity: Severity;
  alertMessage: string;
  alertDetails: Record<string, unknown> | null;
  resolutionNotes?: string | null;
  closedReason?: string | null;
  closedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  acknowledgedAt: string | null;
  investigatingAt: string | null;
  closedAt: string | null;
  dismissedAt?: string | null;
}

export interface AlertListParams {
  status?: AlertStatus;
  alertStatus?: AlertStatus;
  severity?: Severity;
  ruleType?: RuleType;
  accountId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface AlertActionRequest {
  performedBy: string;
  reason?: string;
}

export interface AlertAuditEntry {
  auditId: number;
  alertId: number;
  previousStatus: AlertStatus | null;
  newStatus: AlertStatus;
  changedBy: string;
  changeReason: string | null;
  changedAt: string;
}

export interface AlertStats {
  // Flat status counts returned by backend AlertStatsResponseDTO
  open: number;
  acknowledged: number;
  investigating: number;
  closed: number;
  dismissed: number;
  total: number;
  // Severity breakdown map e.g. { LOW: 2, MEDIUM: 5, HIGH: 1, CRITICAL: 0 }
  bySeverity: Record<string, number>;
  byStatus?: Record<string, number>;
}

// ─── Rule ─────────────────────────────────────────────────────────────────────

export interface RuleParameters {
  // AMOUNT_THRESHOLD
  thresholdAmount?: number;
  // VELOCITY
  windowMinutes?: number;
  maxTransactions?: number;
  // NEW_PAYEE
  lookbackDays?: number;
  // DAILY_LIMIT
  dailyLimitAmount?: number;
}

export interface Rule {
  ruleId: number;
  ruleName: string;
  description: string | null;
  ruleType: RuleType;
  severity: Severity;
  status: RuleStatus;
  parameters: RuleParameters;
  createdAt: string;
  updatedAt: string;
}

export interface RuleRequest {
  name: string;
  description?: string;
  ruleType: RuleType;
  severity: Severity;
  parameters: RuleParameters;
  performedBy: string;
  changeReason?: string;
}

export interface RuleToggleRequest {
  active: boolean;
  performedBy: string;
  reason?: string;
}

export interface RuleListParams {
  status?: RuleStatus;
  ruleType?: RuleType;
  severity?: Severity;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface RuleAuditEntry {
  auditId: number;
  ruleId: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ACTIVATE' | 'DEACTIVATE';
  changedBy: string;
  previousConfig: Record<string, unknown> | null;
  newConfig: Record<string, unknown> | null;
  changeReason: string | null;
  changedAt: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalTransactionsToday: number;
  totalTransactionsWeek: number;
  openAlerts: number;
  criticalAlerts: number;
  activeRules: number;
  transactionVolumeTrend: { date: string; count: number; amount: number }[];
  alertTrend: { date: string; count: number }[];
  topTriggeredRules: { ruleName: string; count: number }[];
}

