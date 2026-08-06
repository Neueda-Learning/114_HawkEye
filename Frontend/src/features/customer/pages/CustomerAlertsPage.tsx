import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Bell, ChevronDown, ChevronLeft, ChevronRight, ChevronRight as ChevRight,
  Search, Filter, Lock, AlertTriangle, Info, ShieldAlert,
  CheckCircle2, Eye, BookmarkCheck, Settings, History,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';
import {
  getAlerts, getAlertStats, acknowledgeAlert, investigateAlert,
} from '@/lib/api/alerts';
import { formatDate } from '@/lib/utils';
import type { Alert, AlertStatus, Severity } from '@/lib/types';
import { toast } from '@/components/common/Toast';
import { DateRangePicker } from '@/components/common/DateRangePicker';

// ── Config maps ────────────────────────────────────────────────────────────────
const SEVERITY_CONFIG: Record<Severity, { label: string; badge: string; icon: React.ReactNode; cardBg: string; iconBg: string }> = {
  HIGH:     { label: 'High',     badge: 'bg-rose-100 text-rose-700',     icon: <ShieldAlert className="h-4 w-4" />,   cardBg: 'bg-rose-50',    iconBg: 'bg-rose-100 text-rose-600' },
  CRITICAL: { label: 'Critical', badge: 'bg-rose-200 text-rose-800',     icon: <ShieldAlert className="h-4 w-4" />,   cardBg: 'bg-rose-50',    iconBg: 'bg-rose-200 text-rose-700' },
  MEDIUM:   { label: 'Medium',   badge: 'bg-amber-100 text-amber-700',   icon: <AlertTriangle className="h-4 w-4" />, cardBg: 'bg-amber-50',   iconBg: 'bg-amber-100 text-amber-600' },
  LOW:      { label: 'Info',     badge: 'bg-blue-100 text-blue-700',     icon: <Info className="h-4 w-4" />,          cardBg: 'bg-blue-50',    iconBg: 'bg-blue-100 text-blue-600' },
};

const STATUS_CONFIG: Record<AlertStatus, { label: string; badge: string; dot: string }> = {
  OPEN:          { label: 'New',          badge: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
  ACKNOWLEDGED:  { label: 'Reviewed',     badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  INVESTIGATING: { label: 'Investigating', badge: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-500' },
  CLOSED:        { label: 'Resolved',     badge: 'bg-slate-100 text-slate-600',   dot: 'bg-slate-400' },
  DISMISSED:     { label: 'Dismissed',    badge: 'bg-slate-100 text-slate-500',   dot: 'bg-slate-300' },
};

const SEVERITY_FILTER_TABS = [
  { key: '',        label: 'All Alerts' },
  { key: 'HIGH',    label: 'High Risk' },
  { key: 'MEDIUM',  label: 'Medium Risk' },
  { key: 'LOW',     label: 'Info' },
];

// Donut chart segment builder
const buildDonutSegments = (high: number, medium: number, info: number) => {
  const total = high + medium + info || 1;
  const segs = [
    { pct: (high / total) * 100,   color: '#ef4444', label: 'High Risk',   count: high,   offset: 0 },
    { pct: (medium / total) * 100, color: '#f97316', label: 'Medium Risk', count: medium, offset: 0 },
    { pct: (info / total) * 100,   color: '#3b82f6', label: 'Info',        count: info,   offset: 0 },
  ];
  let running = 0;
  return segs.map(s => { const seg = { ...s, offset: running }; running += s.pct; return seg; });
};

export default function CustomerAlertsPage() {
  const { user }      = useAuthStore();
  const navigate      = useNavigate();
  const queryClient   = useQueryClient();

  const [page, setPage]           = useState(0);
  const [severityFilter, setSeverityFilter] = useState<Severity | ''>('');
  const [search, setSearch]       = useState('');

  // ── Fetch all alerts (filtered by account) ──────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['customer-alerts', user?.accountId, page, severityFilter],
    queryFn: () => getAlerts({
      accountId: user?.accountId,
      severity:  severityFilter || undefined,
      page,
      size: 8,
      sort: 'createdAt,desc',
    }),
    refetchInterval: 15000,
  });

  // ── Fetch stats ─────────────────────────────────────────────────────────
  const { data: stats } = useQuery({
    queryKey: ['alert-stats', user?.accountId],
    queryFn: () => getAlertStats(),
    refetchInterval: 30000,
  });

  // ── Mutations ────────────────────────────────────────────────────────────
  const ackMutation = useMutation({
    mutationFn: (id: number) => acknowledgeAlert(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['customer-alerts'] });
      toast.success(`Alert #${res?.alertId || ''} marked as Reviewed`);
      toast.email(
        'Security Email Notification Sent',
        `An automated alert review update email has been sent to fourgrads (customer@hawkeye.com) and the risk compliance team.`,
        'customer@hawkeye.com, risk-team@hawkeye.com'
      );
    },
    onError: () => toast.error('Failed to update alert'),
  });
  const invMutation = useMutation({
    mutationFn: (id: number) => investigateAlert(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['customer-alerts'] });
      toast.success(`Investigation started for Alert #${res?.alertId || ''}`);
      toast.email(
        'Security Email Notification Sent',
        `An automated investigation alert email has been dispatched to the risk management team and account holder for Alert #${res?.alertId || ''}.`,
        'customer@hawkeye.com, risk-team@hawkeye.com'
      );
    },
    onError: () => toast.error('Failed to start investigation'),
  });

  const rows = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages    = data?.totalPages ?? 1;

  // client-side search by message or account
  const filtered = search
    ? rows.filter(r =>
        r.alertMessage?.toLowerCase().includes(search.toLowerCase()) ||
        r.accountName?.toLowerCase().includes(search.toLowerCase()) ||
        r.ruleName?.toLowerCase().includes(search.toLowerCase())
      )
    : rows;

  // Stats derived from API
  const highCount   = stats?.bySeverity?.HIGH ?? 0;
  const critCount   = stats?.bySeverity?.CRITICAL ?? 0;
  const medCount    = stats?.bySeverity?.MEDIUM ?? 0;
  const lowCount    = stats?.bySeverity?.LOW ?? 0;
  const totalAlerts = totalElements;

  const openCount   = stats?.open ?? stats?.byStatus?.OPEN ?? 0;
  const ackCount    = stats?.acknowledged ?? stats?.byStatus?.ACKNOWLEDGED ?? 0;
  const invCount    = stats?.investigating ?? stats?.byStatus?.INVESTIGATING ?? 0;
  const closedCount = stats?.closed ?? stats?.byStatus?.CLOSED ?? 0;

  const donutSegs = useMemo(
    () => buildDonutSegments(highCount + critCount, medCount, lowCount),
    [highCount, critCount, medCount, lowCount]
  );

  return (
    <div className="flex gap-6 pb-12 animate-fade-in font-sans text-slate-800 bg-[#f8fafc] p-6 -m-6 min-h-screen">

      {/* ── LEFT MAIN CONTENT ── */}
      <div className="flex-1 min-w-0 space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-sm">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Alerts</h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
                Monitor important activities and take action when needed.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition shadow-sm">
              <Bell className="h-4.5 w-4.5" />
              {totalAlerts > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-purple-600 text-[10px] font-extrabold text-white shadow-sm">
                  {totalAlerts > 9 ? '9+' : totalAlerts}
                </span>
              )}
            </button>
            <DateRangePicker />
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

          {/* Total Alerts */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Alerts</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <Bell className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-3xl font-black text-slate-900">{isLoading ? '...' : totalAlerts}</h3>
              <p className="text-xs font-bold text-rose-600 mt-1">↑ 33% from last week</p>
            </div>
            <div className="mt-4 h-8 w-full">
              <svg className="h-full w-full" viewBox="0 0 100 30">
                <defs><linearGradient id="redAl" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" stopOpacity="0.2"/><stop offset="100%" stopColor="#ef4444" stopOpacity="0"/></linearGradient></defs>
                <path d="M0,22 Q10,18 20,24 T40,12 T60,20 T80,14 T100,18 L100,30 L0,30Z" fill="url(#redAl)"/>
                <path d="M0,22 Q10,18 20,24 T40,12 T60,20 T80,14 T100,18" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* High Risk */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">High Risk Alerts</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <ShieldAlert className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-3xl font-black text-slate-900">{isLoading ? '...' : highCount + critCount}</h3>
              <p className="text-xs font-bold text-rose-600 mt-1">↑ 100% from last week</p>
            </div>
            <div className="mt-4 h-8 w-full">
              <svg className="h-full w-full" viewBox="0 0 100 30">
                <defs><linearGradient id="orgAl" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f97316" stopOpacity="0.2"/><stop offset="100%" stopColor="#f97316" stopOpacity="0"/></linearGradient></defs>
                <path d="M0,20 Q15,26 30,18 T55,22 T80,14 T100,20 L100,30 L0,30Z" fill="url(#orgAl)"/>
                <path d="M0,20 Q15,26 30,18 T55,22 T80,14 T100,20" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* Medium Risk */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Medium Risk Alerts</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <AlertTriangle className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-3xl font-black text-slate-900">{isLoading ? '...' : medCount}</h3>
              <p className="text-xs font-bold text-rose-600 mt-1">↑ 33% from last week</p>
            </div>
            <div className="mt-4 h-8 w-full">
              <svg className="h-full w-full" viewBox="0 0 100 30">
                <defs><linearGradient id="ambAl" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2"/><stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/></linearGradient></defs>
                <path d="M0,18 Q20,24 40,16 T65,22 T90,12 T100,16 L100,30 L0,30Z" fill="url(#ambAl)"/>
                <path d="M0,18 Q20,24 40,16 T65,22 T90,12 T100,16" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* Info */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Info Alerts</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Info className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-3xl font-black text-slate-900">{isLoading ? '...' : lowCount}</h3>
              <p className="text-xs font-bold text-emerald-600 mt-1">↓ 33% from last week</p>
            </div>
            <div className="mt-4 h-8 w-full">
              <svg className="h-full w-full" viewBox="0 0 100 30">
                <defs><linearGradient id="bluAl" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2"/><stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/></linearGradient></defs>
                <path d="M0,20 Q25,26 50,18 T80,22 T100,14 L100,30 L0,30Z" fill="url(#bluAl)"/>
                <path d="M0,20 Q25,26 50,18 T80,22 T100,14" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

        </div>

        {/* Tabs + Filter row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm flex-wrap">
            {SEVERITY_FILTER_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setSeverityFilter(tab.key as Severity | ''); setPage(0); }}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-extrabold transition ${
                  severityFilter === tab.key
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.key === 'HIGH' && <ShieldAlert className="h-3.5 w-3.5" />}
                {tab.key === 'MEDIUM' && <AlertTriangle className="h-3.5 w-3.5" />}
                {tab.key === 'LOW' && <Info className="h-3.5 w-3.5" />}
                {tab.key === '' && <Bell className="h-3.5 w-3.5" />}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 sm:ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search alerts..."
                className="rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition w-48"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              Filter
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 pl-5 w-[35%]">Alert</th>
                  <th className="py-3.5">Account</th>
                  <th className="py-3.5">Date & Time</th>
                  <th className="py-3.5">Risk Level</th>
                  <th className="py-3.5">Status</th>
                  <th className="py-3.5 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading && Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="py-5 pl-5">
                      <div className="h-4 w-full rounded-lg bg-slate-100" />
                    </td>
                  </tr>
                ))}

                {!isLoading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400 font-semibold text-sm">
                      No alerts found.
                    </td>
                  </tr>
                )}

                {!isLoading && filtered.map((alert: Alert) => {
                  const sevCfg    = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.LOW;
                  const statusCfg = STATUS_CONFIG[alert.alertStatus] ?? STATUS_CONFIG.OPEN;

                  return (
                    <tr
                      key={alert.alertId}
                      className="hover:bg-slate-50/80 transition group cursor-pointer"
                      onClick={() => navigate(`/alerts/${alert.alertId}`)}
                    >
                      {/* Alert name + message */}
                      <td className="py-4 pl-5">
                        <div className="flex items-start gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${sevCfg.iconBg}`}>
                            {sevCfg.icon}
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 group-hover:text-purple-600 transition leading-tight">
                              {alert.ruleName || 'Alert'}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-relaxed line-clamp-2 max-w-[220px]">
                              {alert.alertMessage}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Account */}
                      <td className="py-4">
                        <div>
                          <p className="font-extrabold text-slate-800">{alert.accountName ?? 'Your Account'}</p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {alert.accountId ? `•••• ${alert.accountId.slice(-4)}` : ''}
                          </p>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 text-slate-500 font-semibold text-[11px]">
                        {formatDate(alert.createdAt)}
                      </td>

                      {/* Risk level */}
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[11px] font-extrabold ${sevCfg.badge}`}>
                          {sevCfg.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-[11px] font-extrabold ${statusCfg.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-4 text-right">
                        <div className="relative flex items-center justify-end gap-1">
                          {/* Quick action buttons */}
                          {alert.alertStatus === 'OPEN' && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); ackMutation.mutate(alert.alertId); }}
                              title="Mark as Reviewed"
                              className="p-1.5 rounded-lg hover:bg-emerald-100 text-slate-400 hover:text-emerald-600 transition"
                            >
                              <BookmarkCheck className="h-4 w-4" />
                            </button>
                          )}
                          {(alert.alertStatus === 'OPEN' || alert.alertStatus === 'ACKNOWLEDGED') && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); invMutation.mutate(alert.alertId); }}
                              title="Start Investigating"
                              className="p-1.5 rounded-lg hover:bg-amber-100 text-slate-400 hover:text-amber-600 transition"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); navigate(`/alerts/${alert.alertId}`); }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                          >
                            <ChevRight className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Showing 1 to {filtered.length} of {totalElements} alerts</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-extrabold transition ${
                      pageNum === page
                        ? 'border-purple-500 bg-purple-600 text-white shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 pt-4 border-t border-slate-200/80">
          <span>© 2024 Hawkeye. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            <span>Secure • Encrypted • Protected</span>
          </span>
        </div>

      </div>

      {/* ── RIGHT SIDEBAR PANEL ── */}
      <div className="hidden xl:flex flex-col gap-5 w-72 shrink-0">

        {/* Alerts Overview Donut */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 mb-4">Alerts Overview</h3>
          <div className="flex items-center gap-4">
            {/* Donut */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                {donutSegs.map((seg, i) => (
                  <circle
                    key={i}
                    cx="21" cy="21" r="15.9155"
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="6"
                    strokeDasharray={`${seg.pct} ${100 - seg.pct}`}
                    strokeDashoffset={-seg.offset}
                    strokeLinecap="round"
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-slate-900">{isLoading ? '...' : totalAlerts}</span>
                <span className="text-[10px] font-bold text-slate-500">Total Alerts</span>
              </div>
            </div>
            {/* Legend */}
            <div className="flex flex-col gap-2 text-xs">
              {donutSegs.map((seg, i) => (
                <div key={i} className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="font-bold text-slate-600">{seg.label}</span>
                  </div>
                  <span className="font-extrabold text-slate-800">{seg.count} ({Math.round(seg.pct)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts by Status */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 mb-4">Alerts by Status</h3>
          <div className="space-y-2">
            {[
              { label: 'New',          count: openCount,   color: 'bg-violet-500', icon: <Bell className="h-3.5 w-3.5 text-violet-500" /> },
              { label: 'Investigating',count: invCount,    color: 'bg-amber-500',  icon: <Eye className="h-3.5 w-3.5 text-amber-500" /> },
              { label: 'Reviewed',     count: ackCount,    color: 'bg-emerald-500',icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> },
              { label: 'Resolved',     count: closedCount, color: 'bg-slate-400',  icon: <BookmarkCheck className="h-3.5 w-3.5 text-slate-400" /> },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-3 py-2 rounded-xl hover:bg-slate-50 px-2 -mx-2 transition cursor-pointer group">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-slate-200 transition">
                  {row.icon}
                </div>
                <span className="flex-1 text-xs font-bold text-slate-700">{row.label}</span>
                <span className="text-xs font-extrabold text-slate-900">{isLoading ? '...' : row.count}</span>
                <ChevRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition" />
              </div>
            ))}
          </div>
        </div>

        {/* Manage Alerts */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 mb-4">Manage Alerts</h3>
          <div className="space-y-1">
            {[
              { label: 'Alert Preferences', sub: 'Customize what you want to be notified about.', icon: <Settings className="h-4 w-4 text-purple-500" /> },
              { label: 'Notification Settings', sub: 'Manage how and when you receive alerts.', icon: <Bell className="h-4 w-4 text-blue-500" /> },
              { label: 'Alert History', sub: 'View all your past alerts and actions.', icon: <History className="h-4 w-4 text-slate-500" /> },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 py-3 px-2 -mx-2 rounded-xl hover:bg-slate-50 transition cursor-pointer group">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-extrabold text-slate-800 group-hover:text-purple-600 transition">{item.label}</p>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">{item.sub}</p>
                </div>
                <ChevRight className="h-3.5 w-3.5 text-slate-400 shrink-0 group-hover:text-purple-600 transition" />
              </div>
            ))}
          </div>

          {/* Mark all as read button */}
          <button
            type="button"
            onClick={() => {
              const openAlerts = rows.filter(r => r.alertStatus === 'OPEN');
              if (openAlerts.length === 0) {
                toast.info('No open alerts to mark as read');
                return;
              }
              openAlerts.forEach(r => ackMutation.mutate(r.alertId));
              toast.success(`Marking ${openAlerts.length} open alert(s) as read...`);
            }}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-purple-200 bg-purple-50 text-purple-700 text-xs font-extrabold hover:bg-purple-100 transition"
          >
            <BookmarkCheck className="h-4 w-4" />
            Mark all as read
          </button>
        </div>

      </div>

    </div>
  );
}
