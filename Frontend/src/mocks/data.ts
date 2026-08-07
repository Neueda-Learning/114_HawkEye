import type {
  Account, Payee, TransactionResponse, Rule, Alert, AlertAuditEntry, RuleAuditEntry,
} from '@/lib/types';

// ─── Accounts ─────────────────────────────────────────────────────────────────
export const mockAccounts: Account[] = [
  { accountId: 'ACC-001', accountName: "fourgrads's Account",  accountType: 'PERSONAL',  dailyLimit: 50000,  status: 'ACTIVE',    createdAt: '2025-01-10T09:00:00Z', updatedAt: '2025-01-10T09:00:00Z' },
  { accountId: 'ACC-002', accountName: 'ABC Corporation',       accountType: 'CORPORATE', dailyLimit: 200000, status: 'ACTIVE',    createdAt: '2025-02-15T10:00:00Z', updatedAt: '2025-02-15T10:00:00Z' },
  { accountId: 'ACC-003', accountName: 'Tech Startup Ltd',      accountType: 'BUSINESS',  dailyLimit: 100000, status: 'ACTIVE',    createdAt: '2025-03-01T08:30:00Z', updatedAt: '2025-03-01T08:30:00Z' },
  { accountId: 'ACC-004', accountName: 'Suspended Account',     accountType: 'PERSONAL',  dailyLimit: 10000,  status: 'SUSPENDED', createdAt: '2025-01-20T11:00:00Z', updatedAt: '2026-01-22T14:00:00Z' },
];

// ─── Payees ───────────────────────────────────────────────────────────────────
export const mockPayees: Payee[] = [
  { payeeId: 'ACME-CORP',   payeeName: 'ACME Corporation',  payeeType: 'VENDOR',   createdAt: '2025-01-05T08:00:00Z' },
  { payeeId: 'TECH-LTD',    payeeName: 'Tech Ltd',          payeeType: 'VENDOR',   createdAt: '2025-01-06T09:00:00Z' },
  { payeeId: 'RETAIL-INC',  payeeName: 'Retail Inc',        payeeType: 'MERCHANT', createdAt: '2025-02-01T10:00:00Z' },
  { payeeId: 'SERVICES-CO', payeeName: 'Services Co',       payeeType: 'SERVICE',  createdAt: '2025-03-10T11:00:00Z' },
  { payeeId: 'NEW-VENDOR',  payeeName: 'New Vendor LLC',    payeeType: 'VENDOR',   createdAt: '2026-01-22T14:25:00Z' },
];

// ─── Transactions ─────────────────────────────────────────────────────────────
export const mockTransactions: TransactionResponse[] = [
  { transactionId: 1,  accountId: 'ACC-001', accountName: "fourgrads's Account", payeeId: 'ACME-CORP',   payeeName: 'ACME Corporation', amount: 15000, currency: 'USD', transactionType: 'DEBIT',  status: 'COMPLETED', description: 'Vendor payment',      timestamp: '2026-01-22T14:28:30Z', createdAt: '2026-01-22T14:28:31Z' },
  { transactionId: 2,  accountId: 'ACC-001', accountName: "fourgrads's Account", payeeId: 'TECH-LTD',    payeeName: 'Tech Ltd',         amount: 5000,  currency: 'USD', transactionType: 'DEBIT',  status: 'COMPLETED', description: 'Software license',    timestamp: '2026-01-22T14:15:00Z', createdAt: '2026-01-22T14:15:01Z' },
  { transactionId: 3,  accountId: 'ACC-002', accountName: 'ABC Corporation',      payeeId: 'RETAIL-INC',  payeeName: 'Retail Inc',       amount: 25000, currency: 'USD', transactionType: 'DEBIT',  status: 'COMPLETED', description: 'Bulk order',          timestamp: '2026-01-22T13:45:20Z', createdAt: '2026-01-22T13:45:21Z' },
  { transactionId: 4,  accountId: 'ACC-001', accountName: "fourgrads's Account", payeeId: 'SERVICES-CO', payeeName: 'Services Co',      amount: 2000,  currency: 'USD', transactionType: 'DEBIT',  status: 'COMPLETED', description: 'Consulting fee',      timestamp: '2026-01-22T13:20:10Z', createdAt: '2026-01-22T13:20:11Z' },
  { transactionId: 5,  accountId: 'ACC-002', accountName: 'ABC Corporation',      payeeId: 'ACME-CORP',   payeeName: 'ACME Corporation', amount: 8500,  currency: 'USD', transactionType: 'DEBIT',  status: 'COMPLETED', description: 'Equipment purchase',  timestamp: '2026-01-22T12:00:00Z', createdAt: '2026-01-22T12:00:01Z' },
  { transactionId: 6,  accountId: 'ACC-003', accountName: 'Tech Startup Ltd',     payeeId: 'TECH-LTD',    payeeName: 'Tech Ltd',         amount: 3000,  currency: 'USD', transactionType: 'DEBIT',  status: 'COMPLETED', description: 'API services',        timestamp: '2026-01-22T11:30:00Z', createdAt: '2026-01-22T11:30:01Z' },
  { transactionId: 7,  accountId: 'ACC-001', accountName: "fourgrads's Account", payeeId: 'NEW-VENDOR',  payeeName: 'New Vendor LLC',   amount: 12000, currency: 'USD', transactionType: 'DEBIT',  status: 'COMPLETED', description: 'New supplier',        timestamp: '2026-01-22T10:55:00Z', createdAt: '2026-01-22T10:55:01Z' },
  { transactionId: 8,  accountId: 'ACC-002', accountName: 'ABC Corporation',      payeeId: 'RETAIL-INC',  payeeName: 'Retail Inc',       amount: 500,   currency: 'USD', transactionType: 'CREDIT', status: 'COMPLETED', description: 'Refund',              timestamp: '2026-01-22T10:00:00Z', createdAt: '2026-01-22T10:00:01Z' },
  { transactionId: 9,  accountId: 'ACC-003', accountName: 'Tech Startup Ltd',     payeeId: 'ACME-CORP',   payeeName: 'ACME Corporation', amount: 7500,  currency: 'USD', transactionType: 'DEBIT',  status: 'PENDING',   description: 'Pending approval',    timestamp: '2026-01-22T09:30:00Z', createdAt: '2026-01-22T09:30:01Z' },
  { transactionId: 10, accountId: 'ACC-001', accountName: "fourgrads's Account", payeeId: 'SERVICES-CO', payeeName: 'Services Co',      amount: 1200,  currency: 'USD', transactionType: 'DEBIT',  status: 'FAILED',    description: 'Failed transaction',  timestamp: '2026-01-22T09:00:00Z', createdAt: '2026-01-22T09:00:01Z' },
  { transactionId: 11, accountId: 'ACC-002', accountName: 'ABC Corporation',      payeeId: 'TECH-LTD',    payeeName: 'Tech Ltd',         amount: 45000, currency: 'USD', transactionType: 'DEBIT',  status: 'COMPLETED', description: 'Annual contract',     timestamp: '2026-01-21T16:00:00Z', createdAt: '2026-01-21T16:00:01Z' },
  { transactionId: 12, accountId: 'ACC-003', accountName: 'Tech Startup Ltd',     payeeId: 'RETAIL-INC',  payeeName: 'Retail Inc',       amount: 900,   currency: 'USD', transactionType: 'CREDIT', status: 'COMPLETED', description: 'Credit adjustment',   timestamp: '2026-01-21T15:00:00Z', createdAt: '2026-01-21T15:00:01Z' },
];

// ─── Rules ────────────────────────────────────────────────────────────────────
export const mockRules: Rule[] = [
  { ruleId: 1, ruleName: 'Amount > $10,000',      description: 'Alert when single transaction exceeds $10,000',          ruleType: 'AMOUNT_THRESHOLD', severity: 'HIGH',     status: 'ACTIVE',   parameters: { thresholdAmount: 10000 },                    createdAt: '2025-06-01T08:00:00Z', updatedAt: '2025-06-01T08:00:00Z' },
  { ruleId: 2, ruleName: 'Velocity 5 in 10 mins', description: 'Alert when more than 5 transactions in 10 minutes',      ruleType: 'VELOCITY',         severity: 'MEDIUM',   status: 'ACTIVE',   parameters: { windowMinutes: 10, maxTransactions: 5 },     createdAt: '2025-06-01T08:00:00Z', updatedAt: '2025-08-15T10:30:00Z' },
  { ruleId: 3, ruleName: 'New Payee Detected',    description: 'Alert on first transaction to a new payee',              ruleType: 'NEW_PAYEE',        severity: 'MEDIUM',   status: 'ACTIVE',   parameters: { lookbackDays: 365 },                         createdAt: '2025-06-01T08:00:00Z', updatedAt: '2025-06-01T08:00:00Z' },
  { ruleId: 4, ruleName: 'Daily Limit $50,000',   description: 'Alert when daily debit total exceeds $50,000',           ruleType: 'DAILY_LIMIT',      severity: 'HIGH',     status: 'ACTIVE',   parameters: { dailyLimitAmount: 50000 },                   createdAt: '2025-07-01T09:00:00Z', updatedAt: '2025-07-01T09:00:00Z' },
  { ruleId: 5, ruleName: 'Critical Amount',       description: 'Alert when transaction exceeds $100,000',                ruleType: 'AMOUNT_THRESHOLD', severity: 'CRITICAL', status: 'INACTIVE', parameters: { thresholdAmount: 100000 },                   createdAt: '2025-09-01T10:00:00Z', updatedAt: '2025-12-01T11:00:00Z' },
];

// ─── Alerts ───────────────────────────────────────────────────────────────────
export const mockAlerts: Alert[] = [
  { alertId: 1, ruleId: 1, ruleName: 'Amount > $10,000',      ruleType: 'AMOUNT_THRESHOLD', accountId: 'ACC-001', accountName: "fourgrads's Account", transactionId: 1,  alertStatus: 'OPEN',          severity: 'HIGH',     alertMessage: 'Transaction $15,000 exceeds threshold $10,000',         alertDetails: { amount: 15000, threshold: 10000 }, createdAt: '2026-01-22T14:30:45Z', acknowledgedAt: null,                  investigatingAt: null,                  closedAt: null,                  closedReason: null, closedBy: null,         updatedAt: '2026-01-22T14:30:45Z' },
  { alertId: 2, ruleId: 2, ruleName: 'Velocity 5 in 10 mins', ruleType: 'VELOCITY',         accountId: 'ACC-002', accountName: 'ABC Corporation',      transactionId: 3,  alertStatus: 'ACKNOWLEDGED',  severity: 'MEDIUM',   alertMessage: '6 transactions in 9 minutes detected for ACC-002',     alertDetails: { count: 6, windowMinutes: 10 },     createdAt: '2026-01-22T13:50:00Z', acknowledgedAt: '2026-01-22T14:00:00Z', investigatingAt: null,                  closedAt: null,                  closedReason: null, closedBy: null,         updatedAt: '2026-01-22T14:00:00Z' },
  { alertId: 3, ruleId: 3, ruleName: 'New Payee Detected',    ruleType: 'NEW_PAYEE',        accountId: 'ACC-001', accountName: "fourgrads's Account", transactionId: 7,  alertStatus: 'INVESTIGATING', severity: 'MEDIUM',   alertMessage: 'First transaction to new payee: New Vendor LLC',       alertDetails: { payeeId: 'NEW-VENDOR' },           createdAt: '2026-01-22T11:00:00Z', acknowledgedAt: '2026-01-22T11:15:00Z', investigatingAt: '2026-01-22T11:30:00Z', closedAt: null,                  closedReason: null, closedBy: null,         updatedAt: '2026-01-22T11:30:00Z' },
  { alertId: 4, ruleId: 4, ruleName: 'Daily Limit $50,000',   ruleType: 'DAILY_LIMIT',      accountId: 'ACC-002', accountName: 'ABC Corporation',      transactionId: 11, alertStatus: 'CLOSED',        severity: 'HIGH',     alertMessage: 'Daily debit total $70,500 exceeds limit $50,000',      alertDetails: { dailyTotal: 70500, limit: 50000 }, createdAt: '2026-01-21T16:05:00Z', acknowledgedAt: '2026-01-21T16:10:00Z', investigatingAt: '2026-01-21T16:20:00Z', closedAt: '2026-01-21T17:00:00Z', closedReason: 'Verified — authorised bulk payments', closedBy: 'analyst@hawkeye.com', updatedAt: '2026-01-21T17:00:00Z' },
  { alertId: 5, ruleId: 1, ruleName: 'Amount > $10,000',      ruleType: 'AMOUNT_THRESHOLD', accountId: 'ACC-002', accountName: 'ABC Corporation',      transactionId: 11, alertStatus: 'DISMISSED',     severity: 'HIGH',     alertMessage: 'Transaction $45,000 exceeds threshold $10,000',        alertDetails: { amount: 45000, threshold: 10000 }, createdAt: '2026-01-21T16:02:00Z', acknowledgedAt: null,                  investigatingAt: null,                  closedAt: null,                  closedReason: 'Known large contract payment', closedBy: 'analyst@hawkeye.com', updatedAt: '2026-01-21T16:08:00Z' },
];

// ─── Alert Audit Trail ────────────────────────────────────────────────────────
export const mockAlertAudit: AlertAuditEntry[] = [
  { auditId: 1, alertId: 1, previousStatus: null,           newStatus: 'OPEN',          changedBy: 'SYSTEM',               changeReason: 'Alert auto-created by rule engine', changedAt: '2026-01-22T14:30:45Z' },
  { auditId: 2, alertId: 2, previousStatus: null,           newStatus: 'OPEN',          changedBy: 'SYSTEM',               changeReason: 'Alert auto-created by rule engine', changedAt: '2026-01-22T13:50:00Z' },
  { auditId: 3, alertId: 2, previousStatus: 'OPEN',         newStatus: 'ACKNOWLEDGED',  changedBy: 'analyst@hawkeye.com',  changeReason: 'Reviewing',                         changedAt: '2026-01-22T14:00:00Z' },
  { auditId: 4, alertId: 3, previousStatus: null,           newStatus: 'OPEN',          changedBy: 'SYSTEM',               changeReason: 'Alert auto-created by rule engine', changedAt: '2026-01-22T11:00:00Z' },
  { auditId: 5, alertId: 3, previousStatus: 'OPEN',         newStatus: 'ACKNOWLEDGED',  changedBy: 'analyst@hawkeye.com',  changeReason: null,                                changedAt: '2026-01-22T11:15:00Z' },
  { auditId: 6, alertId: 3, previousStatus: 'ACKNOWLEDGED', newStatus: 'INVESTIGATING', changedBy: 'analyst@hawkeye.com',  changeReason: 'Looking into new vendor',           changedAt: '2026-01-22T11:30:00Z' },
  { auditId: 7, alertId: 4, previousStatus: 'INVESTIGATING',newStatus: 'CLOSED',        changedBy: 'analyst@hawkeye.com',  changeReason: 'Verified authorised bulk payments', changedAt: '2026-01-21T17:00:00Z' },
];

// ─── Rule Audit Trail ─────────────────────────────────────────────────────────
export const mockRuleAudit: RuleAuditEntry[] = [
  { auditId: 1, ruleId: 2, action: 'CREATE',     changedBy: 'admin@hawkeye.com', previousConfig: null,                                                           newConfig: { windowMinutes: 10, maxTransactions: 5 }, changeReason: 'Initial setup',    changedAt: '2025-06-01T08:00:00Z' },
  { auditId: 2, ruleId: 2, action: 'UPDATE',     changedBy: 'admin@hawkeye.com', previousConfig: { windowMinutes: 5, maxTransactions: 3 },                       newConfig: { windowMinutes: 10, maxTransactions: 5 }, changeReason: 'Adjusted thresholds after review', changedAt: '2025-08-15T10:30:00Z' },
  { auditId: 3, ruleId: 5, action: 'DEACTIVATE', changedBy: 'admin@hawkeye.com', previousConfig: { thresholdAmount: 100000 },                                    newConfig: { thresholdAmount: 100000 },               changeReason: 'Too many false positives', changedAt: '2025-12-01T11:00:00Z' },
];

// ─── Dashboard stats ──────────────────────────────────────────────────────────
export const mockDashboardStats = {
  totalTransactionsToday: 47,
  totalTransactionsWeek: 312,
  openAlerts: 2,
  criticalAlerts: 0,
  activeRules: 4,
  transactionVolumeTrend: [
    { date: '2026-01-16', count: 38, amount: 185000 },
    { date: '2026-01-17', count: 42, amount: 210000 },
    { date: '2026-01-18', count: 35, amount: 165000 },
    { date: '2026-01-19', count: 50, amount: 245000 },
    { date: '2026-01-20', count: 55, amount: 280000 },
    { date: '2026-01-21', count: 45, amount: 225000 },
    { date: '2026-01-22', count: 47, amount: 237500 },
  ],
  alertTrend: [
    { date: '2026-01-16', count: 3 },
    { date: '2026-01-17', count: 5 },
    { date: '2026-01-18', count: 2 },
    { date: '2026-01-19', count: 7 },
    { date: '2026-01-20', count: 4 },
    { date: '2026-01-21', count: 6 },
    { date: '2026-01-22', count: 5 },
  ],
  topTriggeredRules: [
    { ruleName: 'Amount > $10,000',      count: 18 },
    { ruleName: 'Daily Limit $50,000',   count: 9  },
    { ruleName: 'New Payee Detected',    count: 7  },
    { ruleName: 'Velocity 5 in 10 mins', count: 4  },
  ],
};

