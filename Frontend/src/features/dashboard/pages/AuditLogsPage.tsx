import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  Search, Download, Calendar, CheckCircle2, AlertTriangle,
  RotateCcw, Clock, TrendingUp, Eye, X, Bell, ShieldCheck,
  Activity, Filter,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'CLOSED' | 'DISMISSED';
type Severity    = 'LOW'  | 'MEDIUM'       | 'HIGH'          | 'CRITICAL';

interface MockAlert {
  alertId:     number;
  transactionId: number;
  ruleName:    string;
  severity:    Severity;
  alertStatus: AlertStatus;
  alertMessage: string;
  createdAt:   string;
  updatedAt:   string;
}

interface MockAuditEntry {
  auditId:        number;
  previousStatus: AlertStatus | null;
  newStatus:      AlertStatus;
  changedBy:      string;
  changeReason:   string;
  changedAt:      string;
}

// ─── Status / Severity styling ────────────────────────────────────────────────
const STATUS_COLORS: Record<AlertStatus, string> = {
  OPEN:          'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  ACKNOWLEDGED:  'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
  INVESTIGATING: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  CLOSED:        'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  DISMISSED:     'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

const SEV_COLORS: Record<Severity, string> = {
  CRITICAL: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  HIGH:     'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  MEDIUM:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  LOW:      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_ALERTS: MockAlert[] = [
  { alertId: 2387, transactionId: 10032, ruleName: 'Amount Threshold Rule',       severity: 'HIGH',     alertStatus: 'OPEN',          alertMessage: 'Transaction amount ₹85,000 exceeds threshold of ₹50,000',        createdAt: '2024-05-21T10:30:00Z', updatedAt: '2024-05-21T10:30:00Z' },
  { alertId: 2386, transactionId: 10031, ruleName: 'Velocity Rule',               severity: 'HIGH',     alertStatus: 'ACKNOWLEDGED',  alertMessage: '6 transactions in 10 minutes exceeds velocity limit of 5',      createdAt: '2024-05-21T09:45:00Z', updatedAt: '2024-05-21T10:02:00Z' },
  { alertId: 2385, transactionId: 10030, ruleName: 'New Payee Rule',              severity: 'MEDIUM',   alertStatus: 'INVESTIGATING', alertMessage: 'First transaction to new payee PAYEE-447 (VendorCo)',           createdAt: '2024-05-21T08:20:00Z', updatedAt: '2024-05-21T09:15:00Z' },
  { alertId: 2384, transactionId: 10029, ruleName: 'Daily Limit Rule',            severity: 'HIGH',     alertStatus: 'OPEN',          alertMessage: 'Daily transaction total ₹1,20,000 exceeds daily limit',         createdAt: '2024-05-21T07:15:00Z', updatedAt: '2024-05-21T07:15:00Z' },
  { alertId: 2383, transactionId: 10028, ruleName: 'Amount Threshold Rule',       severity: 'LOW',      alertStatus: 'CLOSED',        alertMessage: 'Transaction amount ₹52,000 exceeds threshold of ₹50,000',       createdAt: '2024-05-20T22:45:00Z', updatedAt: '2024-05-21T06:30:00Z' },
  { alertId: 2382, transactionId: 10027, ruleName: 'Velocity Rule',               severity: 'HIGH',     alertStatus: 'INVESTIGATING', alertMessage: '8 transactions in 10 minutes exceeds velocity limit of 5',      createdAt: '2024-05-20T20:30:00Z', updatedAt: '2024-05-20T21:00:00Z' },
  { alertId: 2381, transactionId: 10026, ruleName: 'New Payee Rule',              severity: 'MEDIUM',   alertStatus: 'ACKNOWLEDGED',  alertMessage: 'First transaction to new payee PAYEE-392 (SupplierX)',          createdAt: '2024-05-20T18:00:00Z', updatedAt: '2024-05-20T18:20:00Z' },
  { alertId: 2380, transactionId: 10025, ruleName: 'Daily Limit Rule',            severity: 'LOW',      alertStatus: 'DISMISSED',     alertMessage: 'Daily transaction total ₹55,000 marginally exceeds limit',       createdAt: '2024-05-20T16:30:00Z', updatedAt: '2024-05-20T17:45:00Z' },
  { alertId: 2379, transactionId: 10024, ruleName: 'Amount Threshold Rule',       severity: 'HIGH',     alertStatus: 'CLOSED',        alertMessage: 'Transaction amount ₹2,50,000 significantly exceeds threshold',  createdAt: '2024-05-20T14:00:00Z', updatedAt: '2024-05-20T16:00:00Z' },
  { alertId: 2378, transactionId: 10023, ruleName: 'Velocity Rule',               severity: 'MEDIUM',   alertStatus: 'OPEN',          alertMessage: '5 transactions in 8 minutes, approaching velocity limit',        createdAt: '2024-05-20T12:10:00Z', updatedAt: '2024-05-20T12:10:00Z' },
  { alertId: 2377, transactionId: 10022, ruleName: 'New Payee Rule',              severity: 'HIGH',     alertStatus: 'CLOSED',        alertMessage: 'First transaction to new payee PAYEE-218 (TechVendor)',          createdAt: '2024-05-20T10:00:00Z', updatedAt: '2024-05-20T13:30:00Z' },
  { alertId: 2376, transactionId: 10021, ruleName: 'Daily Limit Rule',            severity: 'MEDIUM',   alertStatus: 'DISMISSED',     alertMessage: 'Daily transaction total ₹70,000 exceeds daily limit',           createdAt: '2024-05-20T08:45:00Z', updatedAt: '2024-05-20T09:00:00Z' },
];

const MOCK_AUDIT_TRAILS: Record<number, MockAuditEntry[]> = {
  2387: [
    { auditId: 1, previousStatus: null,           newStatus: 'OPEN',          changedBy: 'system@hawkeye.com',  changeReason: 'Alert auto-generated by rule engine', changedAt: '2024-05-21T10:30:00Z' },
  ],
  2386: [
    { auditId: 2, previousStatus: null,           newStatus: 'OPEN',          changedBy: 'system@hawkeye.com',  changeReason: 'Alert auto-generated by rule engine', changedAt: '2024-05-21T09:45:00Z' },
    { auditId: 3, previousStatus: 'OPEN',         newStatus: 'ACKNOWLEDGED',  changedBy: 'admin@hawkeye.com',   changeReason: 'Reviewed and acknowledged',            changedAt: '2024-05-21T10:02:00Z' },
  ],
  2385: [
    { auditId: 4, previousStatus: null,           newStatus: 'OPEN',          changedBy: 'system@hawkeye.com',  changeReason: 'Alert auto-generated by rule engine', changedAt: '2024-05-21T08:20:00Z' },
    { auditId: 5, previousStatus: 'OPEN',         newStatus: 'ACKNOWLEDGED',  changedBy: 'admin@hawkeye.com',   changeReason: 'Initial review completed',             changedAt: '2024-05-21T08:45:00Z' },
    { auditId: 6, previousStatus: 'ACKNOWLEDGED', newStatus: 'INVESTIGATING', changedBy: 'admin@hawkeye.com',   changeReason: 'Payee verified, launching investigation', changedAt: '2024-05-21T09:15:00Z' },
  ],
  2383: [
    { auditId: 7, previousStatus: null,           newStatus: 'OPEN',          changedBy: 'system@hawkeye.com',  changeReason: 'Alert auto-generated by rule engine', changedAt: '2024-05-20T22:45:00Z' },
    { auditId: 8, previousStatus: 'OPEN',         newStatus: 'ACKNOWLEDGED',  changedBy: 'admin@hawkeye.com',   changeReason: 'Verified low-risk transaction',        changedAt: '2024-05-21T00:10:00Z' },
    { auditId: 9, previousStatus: 'ACKNOWLEDGED', newStatus: 'CLOSED',        changedBy: 'admin@hawkeye.com',   changeReason: 'False positive — authorised vendor',  changedAt: '2024-05-21T06:30:00Z' },
  ],
  2382: [
    { auditId: 10, previousStatus: null,          newStatus: 'OPEN',          changedBy: 'system@hawkeye.com',  changeReason: 'Alert auto-generated by rule engine', changedAt: '2024-05-20T20:30:00Z' },
    { auditId: 11, previousStatus: 'OPEN',        newStatus: 'ACKNOWLEDGED',  changedBy: 'admin@hawkeye.com',   changeReason: 'Under initial review',                changedAt: '2024-05-20T20:50:00Z' },
    { auditId: 12, previousStatus: 'ACKNOWLEDGED',newStatus: 'INVESTIGATING', changedBy: 'admin@hawkeye.com',   changeReason: 'Suspicious pattern detected',         changedAt: '2024-05-20T21:00:00Z' },
  ],
  2380: [
    { auditId: 13, previousStatus: null,          newStatus: 'OPEN',          changedBy: 'system@hawkeye.com',  changeReason: 'Alert auto-generated by rule engine', changedAt: '2024-05-20T16:30:00Z' },
    { auditId: 14, previousStatus: 'OPEN',        newStatus: 'DISMISSED',     changedBy: 'admin@hawkeye.com',   changeReason: 'Marginal breach — within tolerance',  changedAt: '2024-05-20T17:45:00Z' },
  ],
  2379: [
    { auditId: 15, previousStatus: null,          newStatus: 'OPEN',          changedBy: 'system@hawkeye.com',  changeReason: 'Alert auto-generated by rule engine', changedAt: '2024-05-20T14:00:00Z' },
    { auditId: 16, previousStatus: 'OPEN',        newStatus: 'ACKNOWLEDGED',  changedBy: 'admin@hawkeye.com',   changeReason: 'High priority — priority escalated',  changedAt: '2024-05-20T14:20:00Z' },
    { auditId: 17, previousStatus: 'ACKNOWLEDGED',newStatus: 'INVESTIGATING', changedBy: 'admin@hawkeye.com',   changeReason: 'Fraud team notified',                 changedAt: '2024-05-20T14:45:00Z' },
    { auditId: 18, previousStatus: 'INVESTIGATING',newStatus:'CLOSED',        changedBy: 'admin@hawkeye.com',   changeReason: 'Authorised large transfer confirmed', changedAt: '2024-05-20T16:00:00Z' },
  ],
  2377: [
    { auditId: 19, previousStatus: null,          newStatus: 'OPEN',          changedBy: 'system@hawkeye.com',  changeReason: 'Alert auto-generated by rule engine', changedAt: '2024-05-20T10:00:00Z' },
    { auditId: 20, previousStatus: 'OPEN',        newStatus: 'ACKNOWLEDGED',  changedBy: 'admin@hawkeye.com',   changeReason: 'New payee under review',               changedAt: '2024-05-20T10:30:00Z' },
    { auditId: 21, previousStatus: 'ACKNOWLEDGED',newStatus: 'CLOSED',        changedBy: 'admin@hawkeye.com',   changeReason: 'Payee validated — approved vendor',   changedAt: '2024-05-20T13:30:00Z' },
  ],
  2376: [
    { auditId: 22, previousStatus: null,          newStatus: 'OPEN',          changedBy: 'system@hawkeye.com',  changeReason: 'Alert auto-generated by rule engine', changedAt: '2024-05-20T08:45:00Z' },
    { auditId: 23, previousStatus: 'OPEN',        newStatus: 'DISMISSED',     changedBy: 'admin@hawkeye.com',   changeReason: 'Pre-approved monthly payment',        changedAt: '2024-05-20T09:00:00Z' },
  ],
  2381: [
    { auditId: 24, previousStatus: null,          newStatus: 'OPEN',          changedBy: 'system@hawkeye.com',  changeReason: 'Alert auto-generated by rule engine', changedAt: '2024-05-20T18:00:00Z' },
    { auditId: 25, previousStatus: 'OPEN',        newStatus: 'ACKNOWLEDGED',  changedBy: 'admin@hawkeye.com',   changeReason: 'Reviewed and noted',                  changedAt: '2024-05-20T18:20:00Z' },
  ],
};

// ─── Action icon ─────────────────────────────────────────────────────────────
function AuditActionIcon({ status }: { status: AlertStatus }) {
  const icons: Record<AlertStatus, { icon: string; cls: string }> = {
    OPEN:          { icon: '🔔', cls: 'bg-red-100 text-red-600 dark:bg-red-900/20' },
    ACKNOWLEDGED:  { icon: '👁',  cls: 'bg-amber-100 text-amber-600 dark:bg-amber-900/20' },
    INVESTIGATING: { icon: '🔍', cls: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20' },
    CLOSED:        { icon: '✓',  cls: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20' },
    DISMISSED:     { icon: '✕',  cls: 'bg-gray-100 text-gray-500 dark:bg-gray-800' },
  };
  const { icon, cls } = icons[status];
  return (
    <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs ${cls}`}>
      {icon}
    </span>
  );
}

// ─── Audit Trail Drawer ───────────────────────────────────────────────────────
function AlertAuditDrawer({ alert, onClose }: { alert: MockAlert; onClose: () => void }) {
  const entries: MockAuditEntry[] = MOCK_AUDIT_TRAILS[alert.alertId] ?? [
    { auditId: 99, previousStatus: null, newStatus: 'OPEN', changedBy: 'system@hawkeye.com', changeReason: 'Alert auto-generated by rule engine', changedAt: alert.createdAt },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl dark:bg-gray-900 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-blue-100">Alert Action History</p>
              <h3 className="text-base font-bold text-white">ALERT-{alert.alertId}</h3>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/70 hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Alert summary */}
        <div className="grid grid-cols-3 gap-3 p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Rule Triggered</p>
            <p className="mt-0.5 text-xs font-bold text-gray-900 dark:text-white truncate">{alert.ruleName}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Severity</p>
            <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${SEV_COLORS[alert.severity]}`}>
              {alert.severity}
            </span>
          </div>
          <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Final Status</p>
            <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_COLORS[alert.alertStatus]}`}>
              {alert.alertStatus}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="p-4 max-h-80 overflow-y-auto">
          <p className="mb-3 text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" /> Action Timeline ({entries.length} event{entries.length !== 1 ? 's' : ''})
          </p>
          <div className="relative space-y-3 pl-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-gray-800">
            {entries.map((entry) => (
              <div key={entry.auditId} className="relative">
                <span className="absolute -left-8 top-0.5">
                  <AuditActionIcon status={entry.newStatus} />
                </span>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {entry.previousStatus && (
                        <>
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_COLORS[entry.previousStatus]}`}>
                            {entry.previousStatus.charAt(0) + entry.previousStatus.slice(1).toLowerCase()}
                          </span>
                          <span className="text-gray-400 text-xs">→</span>
                        </>
                      )}
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_COLORS[entry.newStatus]}`}>
                        {entry.newStatus.charAt(0) + entry.newStatus.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">{formatDate(entry.changedAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <span>By: <span className="font-semibold text-gray-700 dark:text-gray-300">{entry.changedBy}</span></span>
                    <span className="italic text-gray-400 truncate max-w-[180px]">"{entry.changeReason}"</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 px-4 py-3 dark:border-gray-800 flex justify-end">
          <button onClick={onClose} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AuditLogsPage() {
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<MockAlert | null>(null);

  // Filter mock data
  const filteredAlerts = MOCK_ALERTS.filter(a => {
    const matchesSearch   = !search || a.ruleName.toLowerCase().includes(search.toLowerCase()) || a.alertId.toString().includes(search) || a.transactionId.toString().includes(search);
    const matchesStatus   = !statusFilter   || a.alertStatus === statusFilter;
    const matchesSeverity = !severityFilter || a.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  // KPI counts from mock
  const byStatus = MOCK_ALERTS.reduce((acc, a) => { acc[a.alertStatus] = (acc[a.alertStatus] || 0) + 1; return acc; }, {} as Record<string, number>);
  const bySev    = MOCK_ALERTS.reduce((acc, a) => { acc[a.severity]    = (acc[a.severity]    || 0) + 1; return acc; }, {} as Record<string, number>);
  const total    = MOCK_ALERTS.length;

  // Donut data
  const statusDonut = [
    { name: 'Open',          value: byStatus['OPEN']          ?? 0, color: '#ef4444' },
    { name: 'Acknowledged',  value: byStatus['ACKNOWLEDGED']  ?? 0, color: '#f59e0b' },
    { name: 'Investigating', value: byStatus['INVESTIGATING'] ?? 0, color: '#3b82f6' },
    { name: 'Closed',        value: byStatus['CLOSED']        ?? 0, color: '#22c55e' },
    { name: 'Dismissed',     value: byStatus['DISMISSED']     ?? 0, color: '#9ca3af' },
  ].filter(d => d.value > 0);

  const severityDonut = [
    { name: 'High',   value: bySev['HIGH']   ?? 0, color: '#ef4444' },
    { name: 'Medium', value: bySev['MEDIUM'] ?? 0, color: '#f59e0b' },
    { name: 'Low',    value: bySev['LOW']    ?? 0, color: '#22c55e' },
  ].filter(d => d.value > 0);

  const trendData = [
    { date: 'May 15', count: 42 },
    { date: 'May 16', count: 38 },
    { date: 'May 17', count: 55 },
    { date: 'May 18', count: 61 },
    { date: 'May 19', count: 48 },
    { date: 'May 20', count: 73 },
    { date: 'May 21', count: 67 },
  ];

  const clearFilters = () => { setSearch(''); setStatusFilter(''); setSeverityFilter(''); };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Breadcrumb & Top Bar ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Dashboard</span><span>›</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">Audit Logs</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-gray-900 dark:text-white">Alert Action Audit Logs</h1>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Complete history of all actions taken on alerts</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>May 15 – May 21, 2024</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search alert ID or rule..."
              className="w-56 rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-blue-500 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
            <Download className="h-3.5 w-3.5" /><span>Export</span>
          </button>
        </div>
      </div>

      {/* ── Row 1 — KPI Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {[
          { label: 'Total Alerts',  value: total,                          icon: Bell,          color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30'    },
          { label: 'Open',          value: byStatus['OPEN']          ?? 0, icon: AlertTriangle, color: 'bg-red-50 text-red-600 dark:bg-red-900/30'       },
          { label: 'Acknowledged',  value: byStatus['ACKNOWLEDGED']  ?? 0, icon: CheckCircle2,  color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30' },
          { label: 'Investigating', value: byStatus['INVESTIGATING'] ?? 0, icon: Activity,      color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30'    },
          { label: 'Resolved',      value: (byStatus['CLOSED'] ?? 0) + (byStatus['DISMISSED'] ?? 0), icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{label}</p>
                <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{value}</p>
              </div>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 2 — Filters ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
          <span>Status</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white">
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="CLOSED">Closed</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
          <span>Severity</span>
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white">
            <option value="">All Severities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
        <button onClick={clearFilters} className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-white">
          <RotateCcw className="h-3.5 w-3.5" /><span>Clear</span>
        </button>
        <span className="ml-auto text-xs text-gray-400">{filteredAlerts.length} of {total} alerts</span>
      </div>

      {/* ── Row 3 — Table ────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-gray-100 px-5 py-3.5 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" /> Alerts & Actions Taken
          </h2>
          <span className="text-xs text-gray-400">Click "History" to view action audit trail</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50/80 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:bg-gray-800/80 dark:text-gray-400">
            <tr>
              <th className="px-5 py-3.5">Alert ID</th>
              <th className="px-5 py-3.5">Txn ID</th>
              <th className="px-5 py-3.5">Triggered Rule</th>
              <th className="px-5 py-3.5">Severity</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Alert Message</th>
              <th className="px-5 py-3.5">Generated At</th>
              <th className="px-5 py-3.5">Last Updated</th>
              <th className="px-5 py-3.5 text-center">History</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredAlerts.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center text-gray-400">
                  <Bell className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">No alerts match your filters</p>
                </td>
              </tr>
            )}
            {filteredAlerts.map((row) => (
              <tr key={row.alertId} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition">
                <td className="px-5 py-3.5 font-bold font-mono text-gray-900 dark:text-white">ALERT-{row.alertId}</td>
                <td className="px-5 py-3.5 font-mono text-gray-500 dark:text-gray-400">TXN-{row.transactionId}</td>
                <td className="px-5 py-3.5 font-semibold text-gray-800 dark:text-gray-200">{row.ruleName}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${SEV_COLORS[row.severity]}`}>
                    {row.severity.charAt(0) + row.severity.slice(1).toLowerCase()}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${STATUS_COLORS[row.alertStatus]}`}>
                    {row.alertStatus.charAt(0) + row.alertStatus.slice(1).toLowerCase()}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300 max-w-xs truncate" title={row.alertMessage}>
                  {row.alertMessage}
                </td>
                <td className="px-5 py-3.5 font-mono text-gray-500">{formatDate(row.createdAt)}</td>
                <td className="px-5 py-3.5 font-mono text-gray-400">{formatDate(row.updatedAt)}</td>
                <td className="px-5 py-3.5 text-center">
                  <button
                    onClick={() => setSelectedAlert(row)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                    title="View Action History"
                  >
                    <Eye className="h-3 w-3" /> History
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-gray-100 bg-white px-5 py-3 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900">
          Showing {filteredAlerts.length} of {total} alerts
        </div>
      </div>

      {/* ── Row 4 — Charts ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Alerts Over Time */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" /> Alerts Over Time
          </h2>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="auditGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} />
              <Tooltip formatter={(v: number) => [`${v} Alerts`, 'Count']} />
              <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} fill="url(#auditGrad)" dot={{ r: 3, fill: '#2563eb' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts by Status Donut */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Alerts by Status</h2>
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <PieChart width={130} height={130}>
                <Pie data={statusDonut} cx={60} cy={60} innerRadius={42} outerRadius={60} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                  {statusDonut.map(e => <Cell key={e.name} fill={e.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-black text-gray-900 dark:text-white">{total}</span>
                <span className="text-[8px] text-gray-400">Total</span>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-1.5 text-[10px]">
              {statusDonut.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: d.color }} />
                    <span className="text-gray-600 dark:text-gray-300">{d.name}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts by Severity Donut */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Alerts by Severity</h2>
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <PieChart width={130} height={130}>
                <Pie data={severityDonut} cx={60} cy={60} innerRadius={42} outerRadius={60} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                  {severityDonut.map(e => <Cell key={e.name} fill={e.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-black text-gray-900 dark:text-white">{total}</span>
                <span className="text-[8px] text-gray-400">Total</span>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-1.5 text-[10px]">
              {severityDonut.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: d.color }} />
                    <span className="text-gray-600 dark:text-gray-300">{d.name}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Drawer ───────────────────────────────────────────────────────── */}
      {selectedAlert && (
        <AlertAuditDrawer alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
      )}
    </div>
  );
}
