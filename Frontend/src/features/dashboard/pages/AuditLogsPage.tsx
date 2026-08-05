import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  Search, Download, Calendar, CheckCircle2, AlertTriangle,
  RotateCcw, Clock, TrendingUp, Eye, X, Bell, ShieldCheck,
  Activity, Filter,
} from 'lucide-react';
import { getAlerts, getAlertStats, getAlertAuditTrail } from '@/lib/api/alerts';
import { formatDate } from '@/lib/utils';
import type { Alert, AlertAuditEntry, AlertStatus, Severity } from '@/lib/types';

// ─── Status badge helper ─────────────────────────────────────────────────────
const STATUS_COLORS: Record<AlertStatus, string> = {
  OPEN:          'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  ACKNOWLEDGED:  'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
  INVESTIGATING: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  CLOSED:        'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  DISMISSED:     'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

const SEV_COLORS: Record<Severity, string> = {
  HIGH:     'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  MEDIUM:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  LOW:      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  CRITICAL: 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-200',
};

// Action icon per audit action type
function AuditActionIcon({ action }: { action: string }) {
  const a = (action || '').toUpperCase();
  if (a.includes('ACKNOWLEDGE')) return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300 text-xs">🔔</span>;
  if (a.includes('INVESTIGAT'))  return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 text-xs">🔍</span>;
  if (a.includes('CLOS'))        return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs">✓</span>;
  if (a.includes('DISMISS'))     return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 text-xs">✕</span>;
  if (a.includes('CREAT'))       return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs">+</span>;
  return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 text-xs">·</span>;
}

// ─── Alert Audit Trail Drawer ─────────────────────────────────────────────────
function AlertAuditDrawer({ alert, onClose }: { alert: Alert; onClose: () => void }) {
  const { data: trailData, isLoading } = useQuery({
    queryKey: ['alert-audit', alert.alertId],
    queryFn: () => getAlertAuditTrail(alert.alertId, 0, 20),
  });

  const entries = trailData?.content ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl dark:bg-gray-900 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600 p-5 dark:border-gray-800">
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
            <p className="mt-0.5 text-xs font-bold text-gray-900 dark:text-white truncate">{alert.ruleName || '—'}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Severity</p>
            <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${SEV_COLORS[alert.severity]}`}>
              {alert.severity}
            </span>
          </div>
          <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Current Status</p>
            <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_COLORS[alert.alertStatus]}`}>
              {alert.alertStatus}
            </span>
          </div>
        </div>

        {/* Audit trail timeline */}
        <div className="p-4 max-h-72 overflow-y-auto">
          <p className="mb-3 text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" /> Action Timeline
          </p>

          {isLoading && (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                  <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                    <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && entries.length === 0 && (
            <div className="py-8 text-center text-gray-400 text-xs">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No action history found for this alert
            </div>
          )}

          {!isLoading && entries.length > 0 && (
            <div className="relative space-y-4 pl-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-gray-800">
              {entries.map((entry: AlertAuditEntry, idx: number) => (
                <div key={entry.auditId ?? idx} className="relative">
                  <span className="absolute -left-8 top-0">
                    <AuditActionIcon action={entry.newStatus} />
                  </span>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/50">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {entry.previousStatus && (
                          <>
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_COLORS[entry.previousStatus]}`}>
                              {entry.previousStatus}
                            </span>
                            <span className="text-gray-400 text-[10px]">→</span>
                          </>
                        )}
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_COLORS[entry.newStatus]}`}>
                          {entry.newStatus}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">{formatDate(entry.changedAt)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-500">
                      <span>By: <span className="font-semibold text-gray-700 dark:text-gray-300">{entry.changedBy || 'System'}</span></span>
                      {entry.changeReason && <span className="italic truncate max-w-[140px]">"{entry.changeReason}"</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 px-4 py-3 dark:border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AuditLogsPage() {
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [page, setPage]               = useState(0);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  // Fetch real alerts from backend
  const { data: pagedData, isLoading } = useQuery({
    queryKey: ['audit-alerts', page, statusFilter, severityFilter],
    queryFn: () => getAlerts({
      page,
      size: 12,
      alertStatus: statusFilter as AlertStatus || undefined,
      severity: severityFilter as Severity || undefined,
    }),
  });

  const { data: statsData } = useQuery({
    queryKey: ['alerts', 'stats'],
    queryFn: getAlertStats,
  });

  const alerts = pagedData?.content ?? [];

  // Client-side search
  const filteredAlerts = alerts.filter(a =>
    !search ||
    (a.ruleName  || '').toLowerCase().includes(search.toLowerCase()) ||
    a.alertId.toString().includes(search) ||
    (a.transactionId || '').toString().includes(search)
  );

  // KPI from statsData
  const byStatus = statsData?.byStatus ?? {} as Record<AlertStatus, number>;
  const bySeverity = statsData?.bySeverity ?? {} as Record<Severity, number>;
  const totalOpen   = byStatus['OPEN'] ?? 0;
  const totalAck    = byStatus['ACKNOWLEDGED'] ?? 0;
  const totalInv    = byStatus['INVESTIGATING'] ?? 0;
  const totalClosed = byStatus['CLOSED'] ?? 0;
  const totalDismissed = byStatus['DISMISSED'] ?? 0;
  const totalAlerts = Object.values(byStatus).reduce((a, b) => a + b, 0);

  // Donut data
  const statusDonut = [
    { name: 'Open',          value: totalOpen,      color: '#ef4444' },
    { name: 'Acknowledged',  value: totalAck,       color: '#f59e0b' },
    { name: 'Investigating', value: totalInv,       color: '#3b82f6' },
    { name: 'Closed',        value: totalClosed,    color: '#22c55e' },
    { name: 'Dismissed',     value: totalDismissed, color: '#9ca3af' },
  ].filter(d => d.value > 0);

  const severityDonut = [
    { name: 'Critical', value: bySeverity['CRITICAL'] ?? 0, color: '#7c3aed' },
    { name: 'High',     value: bySeverity['HIGH']     ?? 0, color: '#ef4444' },
    { name: 'Medium',   value: bySeverity['MEDIUM']   ?? 0, color: '#f59e0b' },
    { name: 'Low',      value: bySeverity['LOW']      ?? 0, color: '#22c55e' },
  ].filter(d => d.value > 0);

  const trendData = statsData?.dailyTrend?.slice(-7).map(d => ({
    date: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    count: d.count,
  })) ?? [];

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setSeverityFilter('');
    setPage(0);
  };

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
            <span>Live Data</span>
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

      {/* ── Row 1 — 5 KPI Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {[
          { label: 'Total Alerts', value: totalAlerts, icon: Bell,         color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30', trend: '+' },
          { label: 'Open',         value: totalOpen,   icon: AlertTriangle,  color: 'bg-red-50 text-red-600 dark:bg-red-900/30',   trend: '' },
          { label: 'Acknowledged', value: totalAck,    icon: CheckCircle2,   color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30', trend: '' },
          { label: 'Investigating',value: totalInv,    icon: Activity,       color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30', trend: '' },
          { label: 'Resolved',     value: totalClosed + totalDismissed, icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30', trend: '' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{label}</p>
                <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{value.toLocaleString()}</p>
              </div>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 2 — Filters Toolbar ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />

        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
          <span>Status</span>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
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
          <select
            value={severityFilter}
            onChange={(e) => { setSeverityFilter(e.target.value); setPage(0); }}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">All Severities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <button
          onClick={clearFilters}
          className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Clear Filters</span>
        </button>
      </div>

      {/* ── Row 3 — Alert Audit Table ────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-gray-100 px-5 py-3.5 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />
            Alerts & Actions
          </h2>
          <span className="text-xs text-gray-400">{pagedData?.totalElements ?? 0} total alerts</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50/80 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:bg-gray-800/80 dark:text-gray-400">
            <tr>
              <th className="px-5 py-3.5">Alert ID</th>
              <th className="px-5 py-3.5">Transaction ID</th>
              <th className="px-5 py-3.5">Triggered Rule</th>
              <th className="px-5 py-3.5">Severity</th>
              <th className="px-5 py-3.5">Current Status</th>
              <th className="px-5 py-3.5">Alert Message</th>
              <th className="px-5 py-3.5">Generated At</th>
              <th className="px-5 py-3.5">Last Updated</th>
              <th className="px-5 py-3.5 text-center">Action History</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {Array.from({ length: 9 }).map((_, j) => (
                  <td key={j} className="px-5 py-4">
                    <div className="h-3 rounded bg-gray-100 dark:bg-gray-800" style={{ width: `${40 + Math.random() * 40}%` }} />
                  </td>
                ))}
              </tr>
            ))}

            {!isLoading && filteredAlerts.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center text-gray-400">
                  <Bell className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">No alerts found</p>
                  <p className="text-xs mt-1">Try adjusting filters or check backend connection</p>
                </td>
              </tr>
            )}

            {!isLoading && filteredAlerts.map((row) => (
              <tr key={row.alertId} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition">
                <td className="px-5 py-3.5 font-bold font-mono text-gray-900 dark:text-white">
                  ALERT-{row.alertId}
                </td>
                <td className="px-5 py-3.5 font-mono text-gray-500 dark:text-gray-400">
                  {row.transactionId ? `TXN-${row.transactionId}` : '—'}
                </td>
                <td className="px-5 py-3.5 font-semibold text-gray-800 dark:text-gray-200">
                  {row.ruleName || '—'}
                </td>
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
                  {row.alertMessage || '—'}
                </td>
                <td className="px-5 py-3.5 font-mono text-gray-500 dark:text-gray-400">
                  {formatDate(row.createdAt)}
                </td>
                <td className="px-5 py-3.5 font-mono text-gray-400">
                  {formatDate(row.updatedAt)}
                </td>
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

        {/* Footer Pagination */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-white px-5 py-3 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900">
          <span>
            Showing {filteredAlerts.length} of {pagedData?.totalElements ?? 0} alerts
            {(statusFilter || severityFilter) && ' (filtered)'}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800"
            >‹</button>
            {Array.from({ length: Math.min(5, pagedData?.totalPages ?? 1) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold ${
                  page === i ? 'bg-blue-600 font-bold text-white shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >{i + 1}</button>
            ))}
            <button
              onClick={() => setPage(p => Math.min((pagedData?.totalPages ?? 1) - 1, p + 1))}
              disabled={page >= (pagedData?.totalPages ?? 1) - 1}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800"
            >›</button>
          </div>
        </div>
      </div>

      {/* ── Row 4 — Charts ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Alert Actions Over Time */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" /> Alerts Over Time
          </h2>
          {trendData.length > 0 ? (
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
          ) : (
            <div className="flex h-36 items-center justify-center text-xs text-gray-400">No trend data available</div>
          )}
        </div>

        {/* Alerts by Status Donut */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Alerts by Status</h2>
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <PieChart width={130} height={130}>
                <Pie data={statusDonut} cx={60} cy={60} innerRadius={42} outerRadius={60} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                  {statusDonut.map(e => <Cell key={e.name} fill={e.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-black text-gray-900 dark:text-white">{totalAlerts}</span>
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
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <PieChart width={130} height={130}>
                <Pie data={severityDonut} cx={60} cy={60} innerRadius={42} outerRadius={60} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                  {severityDonut.map(e => <Cell key={e.name} fill={e.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-black text-gray-900 dark:text-white">{totalAlerts}</span>
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

      {/* ── Audit Trail Drawer ───────────────────────────────────────────── */}
      {selectedAlert && (
        <AlertAuditDrawer alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
      )}
    </div>
  );
}
