import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
  Search, Filter, Download, Calendar, CheckCircle2, AlertTriangle,
  RotateCcw, Users, Clock, TrendingUp, TrendingDown, Eye, X,
  FileText, Shield, Trash2, Pencil, Bell, Key, Database, RefreshCw
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

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

// Icon helper per action
function ActionIcon({ action }: { action: string }) {
  const a = action.toLowerCase();
  if (a.includes('created')) return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">✓</span>;
  if (a.includes('updated')) return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">✏️</span>;
  if (a.includes('acknowledged')) return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">🔔</span>;
  if (a.includes('logged') || a.includes('login')) return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">🔑</span>;
  if (a.includes('deleted')) return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300">🗑️</span>;
  if (a.includes('exported')) return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300">📥</span>;
  if (a.includes('backup')) return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">⚙️</span>;
  return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">📝</span>;
}

export default function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [showCharts, setShowCharts] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  // Fallback realistic audit logs list matching exact reference sample
  const mockAuditLogs = [
    { id: 'LOG-8921', timestamp: '2024-05-21T10:30:25Z', user: 'John Smith', userRole: 'Administrator', action: 'Created', module: 'Rules', entity: 'Rule', entityId: 'RULE-2024-1056', ip: '192.168.10.15', status: 'Success', severity: 'Low', details: { ruleName: 'High Amount Rule', createdBy: 'John Smith' } },
    { id: 'LOG-8920', timestamp: '2024-05-21T10:29:11Z', user: 'Sarah Lee', userRole: 'Analyst', action: 'Updated', module: 'Alerts', entity: 'Alert', entityId: 'ALERT-2387', ip: '192.168.10.23', status: 'Success', severity: 'Medium', details: { alertId: 2387, newStatus: 'ACKNOWLEDGED' } },
    { id: 'LOG-8919', timestamp: '2024-05-21T10:28:03Z', user: 'Mike Johnson', userRole: 'Investigator', action: 'Acknowledged', module: 'Alerts', entity: 'Alert', entityId: 'ALERT-2386', ip: '192.168.10.45', status: 'Success', severity: 'Medium', details: { alertId: 2386, assignedTo: 'Mike Johnson' } },
    { id: 'LOG-8918', timestamp: '2024-05-21T10:27:44Z', user: 'Emily Davis', userRole: 'Analyst', action: 'Logged In', module: 'Authentication', entity: 'User', entityId: 'USER-1004', ip: '192.168.10.67', status: 'Success', severity: 'Low', details: { mfaVerified: true, session: 'SESS-9941' } },
    { id: 'LOG-8917', timestamp: '2024-05-21T10:26:31Z', user: 'Robert Brown', userRole: 'Analyst', action: 'Deleted', module: 'Transactions', entity: 'Transaction', entityId: 'TXN-10032', ip: '192.168.10.15', status: 'Failed', severity: 'High', details: { reason: 'Unauthorized deletion attempt' } },
    { id: 'LOG-8916', timestamp: '2024-05-21T10:25:18Z', user: 'Daniel Martinez', userRole: 'Administrator', action: 'Updated', module: 'Users', entity: 'User', entityId: 'USER-1002', ip: '192.168.10.11', status: 'Success', severity: 'Medium', details: { updatedFields: ['role', 'department'] } },
    { id: 'LOG-8915', timestamp: '2024-05-21T10:24:05Z', user: 'Olivia Taylor', userRole: 'Analyst', action: 'Exported', module: 'Reports', entity: 'Report', entityId: 'RPT-2024-054', ip: '192.168.10.23', status: 'Success', severity: 'Low', details: { reportType: 'PDF', rowsCount: 1250 } },
    { id: 'LOG-8914', timestamp: '2024-05-21T10:22:50Z', user: 'System', userRole: 'System Process', action: 'Backup', module: 'System', entity: 'Database', entityId: 'DB-BACKUP-321', ip: '192.168.10.1', status: 'Success', severity: 'Low', details: { dumpSize: '4.2 GB', duration: '12s' } },
  ];

  // Filter logs
  const filteredLogs = mockAuditLogs.filter(l => {
    const matchesSearch = l.user.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.entityId.toLowerCase().includes(search.toLowerCase()) ||
      l.module.toLowerCase().includes(search.toLowerCase());

    const matchesUser = !userFilter || l.user === userFilter;
    const matchesModule = !moduleFilter || l.module === moduleFilter;
    const matchesAction = !actionFilter || l.action === actionFilter;
    const matchesStatus = !statusFilter || l.status.toUpperCase() === statusFilter.toUpperCase();
    const matchesSeverity = !severityFilter || l.severity.toUpperCase() === severityFilter.toUpperCase();

    return matchesSearch && matchesUser && matchesModule && matchesAction && matchesStatus && matchesSeverity;
  });

  // Chart data
  const logsOverTimeData = [
    { date: 'May 15', count: 1600 },
    { date: 'May 16', count: 1400 },
    { date: 'May 17', count: 1900 },
    { date: 'May 18', count: 1650 },
    { date: 'May 19', count: 1700 },
    { date: 'May 20', count: 1600 },
    { date: 'May 21', count: 2453 },
  ];

  const moduleDonutData = [
    { name: 'Alerts', value: 3245, share: '26.1%', color: '#2563eb' },
    { name: 'Rules', value: 2731, share: '21.9%', color: '#f59e0b' },
    { name: 'Users', value: 1987, share: '15.9%', color: '#22c55e' },
    { name: 'Transactions', value: 1876, share: '15.1%', color: '#8b5cf6' },
    { name: 'Authentication', value: 1324, share: '10.6%', color: '#ec4899' },
    { name: 'System', value: 1290, share: '10.4%', color: '#9ca3af' },
  ];

  const statusDonutData = [
    { name: 'Success', value: 9842, share: '79.1%', color: '#22c55e' },
    { name: 'Failed', value: 243, share: '2.0%', color: '#ef4444' },
    { name: 'Warning', value: 1128, share: '9.1%', color: '#f59e0b' },
    { name: 'Info', value: 1240, share: '9.8%', color: '#3b82f6' },
  ];

  const recentActivities = [
    { time: '10:30 AM', title: 'New rule created', ref: 'RULE-2024-1056 • John Smith', icon: '✓', color: 'bg-emerald-500' },
    { time: '10:29 AM', title: 'Alert acknowledged', ref: 'ALERT-2387 • Sarah Lee', icon: '🔔', color: 'bg-purple-500' },
    { time: '10:28 AM', title: 'User login', ref: 'john.smith@tmas.com', icon: '🔑', color: 'bg-emerald-500' },
    { time: '10:27 AM', title: 'Report exported', ref: 'Fraud Analysis Report', icon: '📥', color: 'bg-cyan-500' },
    { time: '10:26 AM', title: 'Transaction deleted', ref: 'TXN-10032 • Robert Brown', icon: '🗑️', color: 'bg-red-500' },
  ];

  const clearFilters = () => {
    setSearch('');
    setUserFilter('');
    setModuleFilter('');
    setActionFilter('');
    setStatusFilter('');
    setSeverityFilter('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Breadcrumb & Top Bar ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Dashboard</span>
            <span>›</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">Audit Logs</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-gray-900 dark:text-white">Audit Logs</h1>
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
              placeholder="Search logs..."
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
        </div>
      </div>

      {/* ── Row 1 — 5 KPI Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {/* Card 1 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Total Logs</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">12,453</p>
              <span className="mt-1 flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
                <TrendingUp className="h-3 w-3" /> +18.4% from last week
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <Sparkline data={[10000, 10800, 11200, 11800, 12453]} color="#2563eb" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Successful Actions</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">9,842</p>
              <span className="mt-1 flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
                <TrendingUp className="h-3 w-3" /> +16.7% from last week
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <Sparkline data={[8000, 8500, 8900, 9300, 9842]} color="#22c55e" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Failed Actions</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">243</p>
              <span className="mt-1 flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
                <TrendingUp className="h-3 w-3" /> +8.3% from last week
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <Sparkline data={[210, 220, 230, 238, 243]} color="#f59e0b" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Unique Users</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">128</p>
              <span className="mt-1 flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
                <TrendingUp className="h-3 w-3" /> +12.5% from last week
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <Sparkline data={[110, 115, 118, 122, 128]} color="#8b5cf6" />
          </div>
        </div>

        {/* Card 5 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Avg. Response Time</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">120 ms</p>
              <span className="mt-1 flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
                <TrendingDown className="h-3 w-3" /> -5.6% from last week
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <Sparkline data={[135, 130, 126, 122, 120]} color="#06b6d4" />
          </div>
        </div>
      </div>

      {/* ── Row 2 — Dropdown Filters Toolbar ──────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <span>User</span>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All</option>
              <option value="John Smith">John Smith</option>
              <option value="Sarah Lee">Sarah Lee</option>
              <option value="Mike Johnson">Mike Johnson</option>
              <option value="Emily Davis">Emily Davis</option>
              <option value="Robert Brown">Robert Brown</option>
              <option value="Daniel Martinez">Daniel Martinez</option>
              <option value="System">System</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <span>Module</span>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All</option>
              <option value="Rules">Rules</option>
              <option value="Alerts">Alerts</option>
              <option value="Authentication">Authentication</option>
              <option value="Transactions">Transactions</option>
              <option value="Users">Users</option>
              <option value="Reports">Reports</option>
              <option value="System">System</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <span>Action</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All</option>
              <option value="Created">Created</option>
              <option value="Updated">Updated</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="Logged In">Logged In</option>
              <option value="Deleted">Deleted</option>
              <option value="Exported">Exported</option>
              <option value="Backup">Backup</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <span>Severity</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All</option>
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

        <button
          onClick={() => setShowCharts(!showCharts)}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        >
          <span>{showCharts ? 'Hide Chart' : 'Show Chart'}</span>
        </button>
      </div>

      {/* ── Row 3 — Enterprise Audit Logs Data Table ────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50/80 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:bg-gray-800/80 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3.5 w-8" />
              <th className="px-4 py-3.5">Timestamp</th>
              <th className="px-4 py-3.5">User</th>
              <th className="px-4 py-3.5">Action</th>
              <th className="px-4 py-3.5">Module</th>
              <th className="px-4 py-3.5">Entity</th>
              <th className="px-4 py-3.5">Entity ID</th>
              <th className="px-4 py-3.5">IP Address</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Severity</th>
              <th className="px-4 py-3.5 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredLogs.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition">
                <td className="px-4 py-3.5">
                  <ActionIcon action={row.action} />
                </td>
                <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 font-mono">
                  {formatDate(row.timestamp)}
                </td>
                <td className="px-4 py-3.5 font-bold text-gray-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      {row.user.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{row.user}</p>
                      <p className="text-[10px] text-gray-400">{row.userRole}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold ${
                    row.action === 'Created' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                    row.action === 'Updated' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                    row.action === 'Acknowledged' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
                    row.action === 'Logged In' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                    row.action === 'Deleted' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                    row.action === 'Exported' ? 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400' :
                    'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                  }`}>
                    {row.action}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300 font-medium">
                  {row.module}
                </td>
                <td className="px-4 py-3.5 text-gray-500 font-medium">
                  {row.entity}
                </td>
                <td className="px-4 py-3.5 font-mono font-semibold text-gray-800 dark:text-gray-200">
                  {row.entityId}
                </td>
                <td className="px-4 py-3.5 font-mono text-gray-500">
                  {row.ip}
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                    row.status === 'Success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${row.status === 'Success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                    row.severity === 'High' ? 'text-red-500' :
                    row.severity === 'Medium' ? 'text-amber-500' :
                    'text-emerald-600'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      row.severity === 'High' ? 'bg-red-500' :
                      row.severity === 'Medium' ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`} />
                    {row.severity}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <button
                    onClick={() => setSelectedLog(row)}
                    className="rounded p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    title="View Log Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer Pagination */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-white px-5 py-3 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900">
          <span>Showing 1 to {filteredLogs.length} of 12,453 logs</span>
          <div className="flex items-center gap-1">
            <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">‹</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-sm">1</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">2</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">3</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">4</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">5</button>
            <span>…</span>
            <button className="flex h-7 px-2 items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">1,557</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">›</button>
          </div>
        </div>
      </div>

      {/* ── Row 4 — Analytics Charts & Activity Feed (4 Columns) ───────── */}
      {showCharts && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
          {/* Logs Over Time */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Logs Over Time</h2>
              <select className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <option>Daily</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={logsOverTimeData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="logGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString()} Logs`, 'Count']} />
                <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} fill="url(#logGrad)" dot={{ r: 3, fill: '#2563eb' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Logs by Module */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Logs by Module</h2>
              <a href="#" className="text-xs font-semibold text-blue-600 hover:underline">View All</a>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <PieChart width={130} height={130}>
                  <Pie data={moduleDonutData} cx={60} cy={60} innerRadius={42} outerRadius={60} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                    {moduleDonutData.map(e => <Cell key={e.name} fill={e.color} />)}
                  </Pie>
                </PieChart>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-black text-gray-900 dark:text-white">12,453</span>
                  <span className="text-[8px] text-gray-400">Total</span>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-1 text-[10px]">
                {moduleDonutData.map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: d.color }} />
                      <span className="text-gray-600 dark:text-gray-300">{d.name}</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{d.value.toLocaleString()} <span className="font-normal text-gray-400">({d.share})</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Log Status Distribution */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Log Status Distribution</h2>
              <a href="#" className="text-xs font-semibold text-blue-600 hover:underline">View All</a>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <PieChart width={130} height={130}>
                  <Pie data={statusDonutData} cx={60} cy={60} innerRadius={42} outerRadius={60} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                    {statusDonutData.map(e => <Cell key={e.name} fill={e.color} />)}
                  </Pie>
                </PieChart>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-black text-gray-900 dark:text-white">12,453</span>
                  <span className="text-[8px] text-gray-400">Total</span>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-1.5 text-[10px]">
                {statusDonutData.map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: d.color }} />
                      <span className="text-gray-600 dark:text-gray-300">{d.name}</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{d.value.toLocaleString()} <span className="font-normal text-gray-400">({d.share})</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity Timeline Feed */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Recent Activity</h2>
              <a href="#" className="text-xs font-semibold text-blue-600 hover:underline">View All</a>
            </div>
            <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-gray-800">
              {recentActivities.map((act, idx) => (
                <div key={idx} className="flex items-start gap-3 relative pl-6">
                  <span className={`absolute left-0 top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white ${act.color}`}>
                    {act.icon}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{act.title}</p>
                    <p className="text-[10px] text-gray-400">{act.ref}</p>
                  </div>
                  <span className="text-[10px] text-gray-400">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal — View Log JSON Details ───────────────────────────────── */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ActionIcon action={selectedLog.action} />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Log Payload #{selectedLog.id}</h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
                <div><span className="text-gray-400">User:</span> <strong className="text-gray-900 dark:text-white">{selectedLog.user}</strong></div>
                <div><span className="text-gray-400">Action:</span> <strong className="text-blue-600">{selectedLog.action}</strong></div>
                <div><span className="text-gray-400">Module:</span> <span>{selectedLog.module}</span></div>
                <div><span className="text-gray-400">IP Address:</span> <code>{selectedLog.ip}</code></div>
              </div>

              <div>
                <p className="mb-1 font-bold text-gray-700 dark:text-gray-300">Raw Event Payload (JSON)</p>
                <pre className="overflow-x-auto rounded-xl border border-gray-200 bg-gray-950 p-3 font-mono text-[11px] text-emerald-400">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
              >
                Close Payload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
