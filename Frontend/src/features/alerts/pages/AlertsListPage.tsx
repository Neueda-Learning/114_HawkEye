import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
  Search, Filter, Download, Plus, Calendar, Eye, MoreVertical,
  RotateCcw, Bell, AlertTriangle, ShieldCheck, CheckCircle2,
  Clock, TrendingUp, TrendingDown, UserCheck, Activity, Shield
} from 'lucide-react';
import { getAlerts, getAlertStats, acknowledgeAlert, investigateAlert, closeAlert, dismissAlert } from '@/lib/api/alerts';
import { formatDate, relativeTime } from '@/lib/utils';
import { toast } from '@/components/common/Toast';
import type { Alert, AlertStatus, Severity } from '@/lib/types';

// Sparkline Mini Component
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const pts = data.map((v, i) => ({ x: i, y: v }));
  return (
    <ResponsiveContainer width="100%" height={32}>
      <LineChart data={pts} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <Line type="monotone" dataKey="y" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Ring Progress Indicator
function RingProgress({ value, total, color }: { value: number; total: number; color: string }) {
  const data = [{ value }, { value: Math.max(0, total - value) }];
  return (
    <div className="relative h-8 w-8">
      <PieChart width={32} height={32}>
        <Pie data={data} cx={14} cy={14} innerRadius={10} outerRadius={14} dataKey="value" startAngle={90} endAngle={-270}>
          <Cell fill={color} />
          <Cell fill="#e5e7eb" />
        </Pie>
      </PieChart>
    </div>
  );
}

export default function AlertsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Filters & State — server-side filtering via GET /api/v1/alerts?status=&severity=
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [status, setStatus] = useState<string>('');
  const [severity, setSeverity] = useState<string>('');

  // API Queries — severity & status sent to backend server-side
  const { data: pagedData, isLoading } = useQuery({
    queryKey: ['alerts', page, activeTab, status, severity],
    queryFn: () => getAlerts({
      page,
      size: 15,
      alertStatus: (activeTab !== 'ALL' ? activeTab : status) as AlertStatus || undefined,
      severity: severity as Severity || undefined,
    }),
  });

  const { data: statsData } = useQuery({
    queryKey: ['alerts', 'stats'],
    queryFn: getAlertStats,
  });

  const alertsList = (pagedData?.content || []).map((a) => ({
    ...a,
    age: 'Recent',
  }));

  // Client-side search-only filter (status & severity are already server-side)
  const filteredRows = alertsList.filter(a => {
    const matchesSearch = !search ||
      (a.ruleName || '').toLowerCase().includes(search.toLowerCase()) ||
      a.alertId.toString().includes(search) ||
      (a.transactionId || '').toString().includes(search);
    return matchesSearch;
  });

  // Chart data
  const stackedAreaTrend = [
    { date: 'May 15', high: 45, medium: 50, low: 40 },
    { date: 'May 16', high: 55, medium: 60, low: 45 },
    { date: 'May 17', high: 40, medium: 52, low: 38 },
    { date: 'May 18', high: 62, medium: 58, low: 48 },
    { date: 'May 19', high: 50, medium: 65, low: 52 },
    { date: 'May 20', high: 75, medium: 70, low: 55 },
    { date: 'May 21', high: 67, medium: 89, low: 92 },
  ];

  const severityDonutData = [
    { name: 'High', value: 67, color: '#ef4444' },
    { name: 'Medium', value: 89, color: '#f59e0b' },
    { name: 'Low', value: 92, color: '#22c55e' },
    { name: 'Informational', value: 80, color: '#3b82f6' },
  ];

  const statusDonutData = [
    { name: 'Open', value: 167, color: '#3b82f6' },
    { name: 'Acknowledged', value: 89, color: '#f59e0b' },
    { name: 'Investigating', value: 45, color: '#8b5cf6' },
    { name: 'Closed', value: 87, color: '#22c55e' },
    { name: 'Dismissed', value: 40, color: '#9ca3af' },
  ];

  const ruleBars = [
    { name: 'Amount Threshold Rule', count: 134, color: '#ef4444', pct: 100 },
    { name: 'Velocity Rule', count: 87, color: '#f59e0b', pct: 65 },
    { name: 'New Payee Rule', count: 56, color: '#22c55e', pct: 42 },
    { name: 'Daily Limit Rule', count: 51, color: '#3b82f6', pct: 38 },
    { name: 'Location Rule', count: 40, color: '#8b5cf6', pct: 30 },
  ];

  const topRiskyAccounts = [
    { accId: '1234567890', name: 'John Smith', score: 92 },
    { accId: '9876543210', name: 'Maria Garcia', score: 88 },
    { accId: '1122334455', name: 'James Wilson', score: 76 },
    { accId: '5566778899', name: 'Robert Brown', score: 72 },
    { accId: '6677889900', name: 'Sarah Lee', score: 65 },
  ];

  // 7x6 Heatmap matrix (Mon-Sun vs 6 time slots)
  const heatmapDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const heatmapTimes = ['12 AM', '4 AM', '8 AM', '12 PM', '4 PM', '8 PM'];
  const heatmapValues = [
    [12, 5, 24, 45, 62, 38],
    [8,  3, 30, 52, 70, 42],
    [15, 6, 28, 48, 65, 35],
    [10, 4, 35, 58, 80, 50],
    [20, 8, 40, 72, 95, 60],
    [5,  2, 12, 25, 30, 18],
    [4,  1, 10, 20, 22, 14],
  ];

  const clearFilters = () => {
    setSearch('');
    setActiveTab('ALL');
    setStatus('');
    setSeverity('');
    setPage(0);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Breadcrumb & Top Bar ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Dashboard</span>
            <span>›</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">Alerts</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-gray-900 dark:text-white">Alerts</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>May 15, 2024 - May 21, 2024</span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search alerts..."
              className="w-56 rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-blue-500 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters</span>
          </button>

          <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </button>

          <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            <span>New Alert</span>
          </button>
        </div>
      </div>

      {/* ── Row 1 — 6 KPI Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {/* Card 1 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Total Alerts</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">328</p>
              <span className="mt-1 flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
                <TrendingUp className="h-3 w-3" /> +22.4% from last week
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-900/30">
              <Bell className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <Sparkline data={[280, 310, 290, 340, 328]} color="#ef4444" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">High Severity</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">67</p>
              <span className="mt-1 text-[10px] text-gray-400">20.4% of total</span>
            </div>
            <RingProgress value={67} total={328} color="#ef4444" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Medium Severity</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">89</p>
              <span className="mt-1 text-[10px] text-gray-400">27.1% of total</span>
            </div>
            <RingProgress value={89} total={328} color="#f59e0b" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Low Severity</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">92</p>
              <span className="mt-1 text-[10px] text-gray-400">28.0% of total</span>
            </div>
            <RingProgress value={92} total={328} color="#eab308" />
          </div>
        </div>

        {/* Card 5 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Open Alerts</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">167</p>
              <span className="mt-1 text-[10px] text-gray-400">50.9% of total</span>
            </div>
            <RingProgress value={167} total={328} color="#8b5cf6" />
          </div>
        </div>

        {/* Card 6 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Closed Alerts</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">161</p>
              <span className="mt-1 text-[10px] text-gray-400">49.1% of total</span>
            </div>
            <RingProgress value={161} total={328} color="#22c55e" />
          </div>
        </div>
      </div>

      {/* ── Row 2 — Status Tabs & Dropdown Filters ─────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          {[
            { key: 'ALL', label: 'All Alerts', count: undefined },
            { key: 'OPEN', label: 'Open', count: 167 },
            { key: 'ACKNOWLEDGED', label: 'Acknowledged', count: 89 },
            { key: 'INVESTIGATING', label: 'Investigating', count: 45 },
            { key: 'CLOSED', label: 'Closed', count: 161 },
            { key: 'DISMISSED', label: 'Dismissed', count: 40 },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setPage(0); }}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition ${
                activeTab === tab.key
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Dropdowns — server-side filtered via GET /api/v1/alerts?severity=&status= */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <span>Severity</span>
            <select
              value={severity}
              onChange={(e) => { setSeverity(e.target.value); setPage(0); }}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All Severities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <span>Status</span>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setActiveTab('ALL'); setPage(0); }}
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

          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* ── Row 3 — Enterprise Alerts Data Table ───────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50/80 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:bg-gray-800/80 dark:text-gray-400">
            <tr>
              <th className="px-5 py-3.5">Alert ID</th>
              <th className="px-5 py-3.5">Transaction ID</th>
              <th className="px-5 py-3.5">Triggered Rule</th>
              <th className="px-5 py-3.5">Severity</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Generated Time</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredRows.map((row) => (
              <tr
                key={row.alertId}
                onClick={() => navigate(`/alerts/${row.alertId}`)}
                className="cursor-pointer hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition"
              >
                <td className="px-5 py-3.5 font-bold font-mono text-gray-900 dark:text-white">
                  ALERT-{row.alertId}
                </td>
                <td className="px-5 py-3.5 font-mono text-gray-500 dark:text-gray-400">
                  TXN-{row.transactionId}
                </td>
                <td className="px-5 py-3.5 font-semibold text-gray-800 dark:text-gray-200">
                  {row.ruleName}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    row.severity === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                    row.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                  }`}>
                    {row.severity.charAt(0) + row.severity.slice(1).toLowerCase()}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    row.alertStatus === 'OPEN' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                    row.alertStatus === 'ACKNOWLEDGED' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                    row.alertStatus === 'INVESTIGATING' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                    row.alertStatus === 'CLOSED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {row.alertStatus.charAt(0) + row.alertStatus.slice(1).toLowerCase()}
                  </span>
                </td>

                <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">
                  {formatDate(row.createdAt)}
                </td>
                <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    {/* Acknowledge Button */}
                    {row.alertStatus === 'OPEN' && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await acknowledgeAlert(row.alertId);
                            toast.success(`Alert ALERT-${row.alertId} Acknowledged`);
                            void queryClient.invalidateQueries({ queryKey: ['alerts'] });
                          } catch (err: any) {
                            toast.error('Action failed', err?.message || 'Server error');
                          }
                        }}
                        title="Acknowledge Alert"
                        className="rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300"
                      >
                        Ack
                      </button>
                    )}

                    {/* Investigate Button */}
                    {(row.alertStatus === 'OPEN' || row.alertStatus === 'ACKNOWLEDGED') && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await investigateAlert(row.alertId);
                            toast.success(`Alert ALERT-${row.alertId} under Investigation`);
                            void queryClient.invalidateQueries({ queryKey: ['alerts'] });
                          } catch (err: any) {
                            toast.error('Action failed', err?.message || 'Server error');
                          }
                        }}
                        title="Start Investigation"
                        className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        Investigate
                      </button>
                    )}

                    {/* Close Button */}
                    {row.alertStatus !== 'CLOSED' && row.alertStatus !== 'DISMISSED' && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await closeAlert(row.alertId, { resolutionNotes: 'Resolved by Admin', performedBy: 'admin@hawkeye.com' });
                            toast.success(`Alert ALERT-${row.alertId} Closed & Resolved`);
                            void queryClient.invalidateQueries({ queryKey: ['alerts'] });
                          } catch (err: any) {
                            toast.error('Action failed', err?.message || 'Server error');
                          }
                        }}
                        title="Close Alert"
                        className="rounded-lg bg-green-50 px-2 py-1 text-[11px] font-bold text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300"
                      >
                        Close
                      </button>
                    )}

                    {/* Dismiss Button */}
                    {row.alertStatus !== 'CLOSED' && row.alertStatus !== 'DISMISSED' && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await dismissAlert(row.alertId, { resolutionNotes: 'Dismissed as False Positive by Admin', performedBy: 'admin@hawkeye.com' });
                            toast.success(`Alert ALERT-${row.alertId} Dismissed`);
                            void queryClient.invalidateQueries({ queryKey: ['alerts'] });
                          } catch (err: any) {
                            toast.error('Action failed', err?.message || 'Server error');
                          }
                        }}
                        title="Dismiss Alert"
                        className="rounded-lg bg-gray-100 px-2 py-1 text-[11px] font-bold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                      >
                        Dismiss
                      </button>
                    )}

                    {/* Eye Button */}
                    <button
                      onClick={() => navigate(`/alerts/${row.alertId}`)}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-800"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer Pagination */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-white px-5 py-3 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900">
          <span>Showing 1 to {filteredRows.length} of 328 alerts</span>
          <div className="flex items-center gap-1">
            <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">‹</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-sm">1</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">2</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">3</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">4</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">5</button>
            <span>…</span>
            <button className="flex h-7 px-2 items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">41</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">›</button>
          </div>
        </div>
      </div>

      {/* ── Row 4 — Analytics Charts (4 Columns) ────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
        {/* Chart 1 — Alerts Over Time */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Alerts Over Time</h2>
            <select className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <option>Daily</option>
              <option>Weekly</option>
            </select>
          </div>
          <div className="mb-2 flex gap-3 text-[10px] text-gray-500">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />High</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />Medium</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Low</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={stackedAreaTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} />
              <Tooltip />
              <Area type="monotone" dataKey="high" stackId="1" stroke="#ef4444" fill="#ef4444" />
              <Area type="monotone" dataKey="medium" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
              <Area type="monotone" dataKey="low" stackId="1" stroke="#22c55e" fill="#22c55e" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2 — Alerts by Severity */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Alerts by Severity</h2>
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <PieChart width={130} height={130}>
                <Pie data={severityDonutData} cx={60} cy={60} innerRadius={42} outerRadius={60} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                  {severityDonutData.map(e => <Cell key={e.name} fill={e.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-lg font-black text-gray-900 dark:text-white">328</span>
                <span className="text-[9px] text-gray-400">Total</span>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-1.5 text-[11px]">
              {severityDonutData.map(d => (
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

        {/* Chart 3 — Alerts by Rule */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Alerts by Rule</h2>
            <a href="/admin/rules" className="text-xs font-semibold text-blue-600 hover:underline">View All</a>
          </div>
          <div className="space-y-2.5">
            {ruleBars.map(r => (
              <div key={r.name}>
                <div className="mb-1 flex justify-between text-[11px]">
                  <span className="truncate font-medium text-gray-700 dark:text-gray-300">{r.name}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{r.count}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div className="h-full rounded-full" style={{ width: `${r.pct}%`, backgroundColor: r.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4 — Alerts by Status */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Alerts by Status</h2>
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <PieChart width={130} height={130}>
                <Pie data={statusDonutData} cx={60} cy={60} innerRadius={42} outerRadius={60} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                  {statusDonutData.map(e => <Cell key={e.name} fill={e.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-lg font-black text-gray-900 dark:text-white">328</span>
                <span className="text-[9px] text-gray-400">Total</span>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-1 text-[10px]">
              {statusDonutData.map(d => (
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

      {/* ── Row 5 — Additional Analytics Panels (3 Columns) ─────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Top Risky Accounts */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Top Risky Accounts</h2>
            <a href="#" className="text-xs font-semibold text-blue-600 hover:underline">View All</a>
          </div>
          <div className="space-y-3">
            {topRiskyAccounts.map(acc => (
              <div key={acc.accId} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  {acc.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{acc.accId} <span className="font-normal text-gray-400">({acc.name})</span></span>
                    <span className="font-bold text-red-600 dark:text-red-400">{acc.score}/100</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div className="h-full rounded-full bg-red-500" style={{ width: `${acc.score}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts Heatmap (By Hour & Day) */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Alerts Heatmap (By Hour & Day)</h2>
          <div className="space-y-1.5 text-[10px]">
            <div className="grid grid-cols-7 gap-1 text-center font-medium text-gray-400">
              <span />
              {heatmapTimes.map(t => <span key={t}>{t}</span>)}
            </div>
            {heatmapDays.map((day, dIdx) => (
              <div key={day} className="grid grid-cols-7 gap-1 items-center">
                <span className="font-semibold text-gray-500">{day}</span>
                {heatmapValues[dIdx].map((val, tIdx) => {
                  // Color intensity mapping
                  const opacity = Math.min(1, Math.max(0.15, val / 95));
                  return (
                    <div
                      key={tIdx}
                      title={`${day} ${heatmapTimes[tIdx]}: ${val} alerts`}
                      className="h-6 rounded-md transition hover:scale-105"
                      style={{ backgroundColor: `rgba(239, 68, 68, ${opacity})` }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-gray-400">
            <span>Low</span>
            <div className="h-2 w-24 rounded-full bg-gradient-to-r from-red-100 via-red-400 to-red-600" />
            <span>High</span>
          </div>
        </div>

        {/* Recent Alert Activity Feed */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Recent Alert Activity</h2>
            <a href="#" className="text-xs font-semibold text-blue-600 hover:underline">View All</a>
          </div>
          <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-gray-800">
            {[
              { time: '10:30 AM', title: 'New high severity alert generated', ref: 'ALERT-2387 • TXN-10032', color: 'bg-red-500' },
              { time: '10:28 AM', title: 'Alert acknowledged', ref: 'ALERT-2386 • John Doe', color: 'bg-amber-500' },
              { time: '10:25 AM', title: 'Investigation started', ref: 'ALERT-2385 • Sarah Lee', color: 'bg-blue-500' },
              { time: '10:20 AM', title: 'Alert closed', ref: 'ALERT-2383 • Mike Johnson', color: 'bg-emerald-500' },
              { time: '10:15 AM', title: 'Alert dismissed', ref: 'ALERT-2380 • Robert Brown', color: 'bg-gray-400' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 relative pl-6">
                <span className={`absolute left-0 top-1 h-4 w-4 rounded-full border-2 border-white dark:border-gray-900 ${item.color}`} />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{item.title}</p>
                  <p className="text-[10px] text-gray-400">{item.ref}</p>
                </div>
                <span className="text-[10px] text-gray-400">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
