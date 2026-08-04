import { useState } from 'react';
import {
  ComposedChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Search, Filter, Download, Calendar, Activity, AlertTriangle,
  CheckCircle2, Clock, TrendingUp, TrendingDown, DollarSign,
  ShieldCheck, Eye, Globe, Zap, UserCheck
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

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

// Merchant Icon helper
function MerchantIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  if (n.includes('amazon')) return <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 text-xs font-bold text-orange-600">a</span>;
  if (n.includes('flipkart')) return <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-600">fk</span>;
  if (n.includes('starbucks')) return <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-700">★</span>;
  if (n.includes('netflix')) return <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 text-xs font-bold text-red-600">N</span>;
  if (n.includes('uber')) return <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-900 text-xs font-bold text-white">U</span>;
  return <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-600">🏢</span>;
}

export default function ReportsPage() {
  const [search, setSearch] = useState('');
  const [volumePeriod, setVolumePeriod] = useState('Daily');
  const [trendPeriod, setTrendPeriod] = useState('Daily');
  const [fraudPeriod, setFraudPeriod] = useState('Weekly');
  const [heatmapPeriod, setHeatmapPeriod] = useState('Week');

  // Chart Data
  const volumeOverTimeData = [
    { date: 'May 15', transactions: 2400, amount: 620000 },
    { date: 'May 16', transactions: 3100, amount: 780000 },
    { date: 'May 17', transactions: 2600, amount: 640000 },
    { date: 'May 18', transactions: 3400, amount: 820000 },
    { date: 'May 19', transactions: 3600, amount: 950000 },
    { date: 'May 20', transactions: 3100, amount: 790000 },
    { date: 'May 21', transactions: 3900, amount: 1020000 },
  ];

  const severityDonutData = [
    { name: 'High', value: 67, color: '#ef4444' },
    { name: 'Medium', value: 89, color: '#f59e0b' },
    { name: 'Low', value: 92, color: '#22c55e' },
    { name: 'Informational', value: 80, color: '#3b82f6' },
  ];

  const alertTrendData = [
    { date: 'May 15', high: 60, medium: 40, low: 25, info: 10 },
    { date: 'May 16', high: 68, medium: 44, low: 26, info: 12 },
    { date: 'May 17', high: 64, medium: 42, low: 23, info: 8 },
    { date: 'May 18', high: 78, medium: 45, low: 28, info: 14 },
    { date: 'May 19', high: 90, medium: 52, low: 32, info: 16 },
    { date: 'May 20', high: 80, medium: 48, low: 28, info: 14 },
    { date: 'May 21', high: 85, medium: 45, low: 25, info: 10 },
  ];

  const typeDonutData = [
    { name: 'Debit', value: 7126, color: '#2563eb' },
    { name: 'Credit', value: 5327, color: '#22c55e' },
  ];

  const topMerchants = [
    { name: 'Amazon Marketplace', count: '1,245', amount: '$254,560', pct: 100 },
    { name: 'Flipkart', count: '945', amount: '$198,450', pct: 78 },
    { name: 'Starbucks Coffee', count: '743', amount: '$126,750', pct: 50 },
    { name: 'Netflix', count: '542', amount: '$98,210', pct: 38 },
    { name: 'Uber', count: '412', amount: '$75,320', pct: 30 },
  ];

  const fraudTrendData = [
    { date: 'Apr 15', high: 45 },
    { date: 'Apr 22', high: 58 },
    { date: 'Apr 29', high: 48 },
    { date: 'May 06', high: 62 },
    { date: 'May 13', high: 55 },
    { date: 'May 20', high: 67 },
  ];

  const statusDonutData = [
    { name: 'Open', value: 167, color: '#3b82f6' },
    { name: 'Acknowledged', value: 89, color: '#f59e0b' },
    { name: 'Investigating', value: 45, color: '#8b5cf6' },
    { name: 'Closed', value: 87, color: '#22c55e' },
    { name: 'Dismissed', value: 40, color: '#9ca3af' },
  ];

  const mostTriggeredRules = [
    { name: 'Amount Threshold Rule', count: 134, pct: 100, color: '#6366f1' },
    { name: 'Velocity Rule', count: 87, pct: 65, color: '#8b5cf6' },
    { name: 'New Payee Rule', count: 56, pct: 42, color: '#a855f7' },
    { name: 'Daily Limit Rule', count: 51, pct: 38, color: '#c084fc' },
    { name: 'Location Rule', count: 40, pct: 30, color: '#e879f9' },
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Breadcrumb & Top Bar ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Dashboard</span>
            <span>›</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">Reports</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-gray-900 dark:text-white">Reports & Analytics</h1>
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
              placeholder="Search reports..."
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

      {/* ── Row 1 — 6 KPI Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {/* Card 1 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Total Transactions</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">12,453</p>
              <span className="mt-1 flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
                <TrendingUp className="h-3 w-3" /> +15.8% from last week
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <Sparkline data={[10000, 11200, 10800, 11800, 12453]} color="#2563eb" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Total Amount</p>
              <p className="mt-1 text-xl font-black text-gray-900 dark:text-white">$1,254,750.00</p>
              <span className="mt-1 flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
                <TrendingUp className="h-3 w-3" /> +18.4% from last week
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <Sparkline data={[850000, 980000, 910000, 1050000, 1254750]} color="#22c55e" />
          </div>
        </div>

        {/* Card 3 */}
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
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <Sparkline data={[280, 310, 290, 340, 328]} color="#ef4444" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">High Severity Alerts</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">67</p>
              <span className="mt-1 flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
                <TrendingUp className="h-3 w-3" /> +12.1% from last week
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-900/30">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <Sparkline data={[55, 60, 58, 65, 67]} color="#f59e0b" />
          </div>
        </div>

        {/* Card 5 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Open Investigations</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">167</p>
              <span className="mt-1 flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
                <TrendingUp className="h-3 w-3" /> +10.3% from last week
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <Sparkline data={[140, 152, 148, 160, 167]} color="#8b5cf6" />
          </div>
        </div>

        {/* Card 6 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Fraud Detection Rate</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">98.7%</p>
              <span className="mt-1 flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
                <TrendingUp className="h-3 w-3" /> +1.2% from last week
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <Sparkline data={[97.2, 97.8, 98.1, 98.4, 98.7]} color="#06b6d4" />
          </div>
        </div>
      </div>

      {/* ── Row 2 — 3 Analytics Charts ──────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Transaction Volume Over Time */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Transaction Volume Over Time</h2>
            <select
              value={volumePeriod}
              onChange={(e) => setVolumePeriod(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <option>Daily</option>
              <option>Weekly</option>
            </select>
          </div>
          <div className="mb-2 flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-blue-600" />Transactions</span>
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-5 rounded bg-emerald-500" />Amount (USD)</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={volumeOverTimeData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip />
              <Bar yAxisId="left" dataKey="transactions" fill="#2563eb" radius={[3, 3, 0, 0]} name="Transactions" />
              <Line yAxisId="right" type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: '#22c55e' }} name="Amount (USD)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts by Severity */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Alerts by Severity</h2>
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <PieChart width={150} height={150}>
                <Pie data={severityDonutData} cx={70} cy={70} innerRadius={48} outerRadius={68} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                  {severityDonutData.map(e => <Cell key={e.name} fill={e.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-gray-900 dark:text-white">328</span>
                <span className="text-[10px] text-gray-400">Total</span>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-1.5 text-xs">
              {severityDonutData.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                    <span className="text-gray-600 dark:text-gray-300">{d.name}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{d.value} <span className="font-normal text-gray-400">({((d.value/328)*100).toFixed(1)}%)</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alert Trend Over Time */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Alert Trend Over Time</h2>
            <select
              value={trendPeriod}
              onChange={(e) => setTrendPeriod(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <option>Daily</option>
              <option>Weekly</option>
            </select>
          </div>
          <div className="mb-2 flex gap-3 text-[10px] text-gray-500">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />High</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />Medium</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Low</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" />Informational</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={alertTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <Tooltip />
              <Line type="monotone" dataKey="high" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} name="High" />
              <Line type="monotone" dataKey="medium" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} name="Medium" />
              <Line type="monotone" dataKey="low" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: '#22c55e' }} name="Low" />
              <Line type="monotone" dataKey="info" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} name="Informational" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 3 — 4 Analytics Panels ──────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        {/* Transactions by Type */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Transactions by Type</h2>
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <PieChart width={120} height={120}>
                <Pie data={typeDonutData} cx={55} cy={55} innerRadius={40} outerRadius={56} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                  {typeDonutData.map(e => <Cell key={e.name} fill={e.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-black text-gray-900 dark:text-white">12,453</span>
                <span className="text-[8px] text-gray-400">Total</span>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-blue-600" />Debit</span>
                <span className="font-bold">7,126 <span className="font-normal text-gray-400">(57.2%)</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />Credit</span>
                <span className="font-bold">5,327 <span className="font-normal text-gray-400">(42.8%)</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 Merchants by Volume */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Top 5 Merchants by Volume</h2>
            <a href="#" className="text-xs font-semibold text-blue-600 hover:underline">View All</a>
          </div>
          <div className="space-y-3 text-xs">
            {topMerchants.map(m => (
              <div key={m.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MerchantIcon name={m.name} />
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{m.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-12 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${m.pct}%` }} />
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{m.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fraud Trend (High Severity) */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Fraud Trend (High Severity)</h2>
            <select
              value={fraudPeriod}
              onChange={(e) => setFraudPeriod(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={fraudTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="fraudGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} />
              <Tooltip />
              <Area type="monotone" dataKey="high" stroke="#ef4444" strokeWidth={2} fill="url(#fraudGrad)" dot={{ r: 3, fill: '#ef4444' }} name="High Severity Alerts" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts by Status */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Alerts by Status</h2>
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <PieChart width={120} height={120}>
                <Pie data={statusDonutData} cx={55} cy={55} innerRadius={40} outerRadius={56} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                  {statusDonutData.map(e => <Cell key={e.name} fill={e.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-black text-gray-900 dark:text-white">328</span>
                <span className="text-[8px] text-gray-400">Total</span>
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

      {/* ── Row 4 — 4 Executive Analytics Cards / Maps ──────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        {/* Fraud Hotspots (By Location) */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Fraud Hotspots (By Location)</h2>
          <div className="rounded-xl border border-gray-100 bg-blue-50/30 p-4 text-center dark:border-gray-800 dark:bg-gray-800/40">
            <Globe className="mx-auto h-16 w-16 text-blue-400 opacity-60" />
            <p className="mt-2 text-xs font-semibold text-gray-700 dark:text-gray-300">Global Risk Heatmap</p>
          </div>
          <div className="mt-4 space-y-1.5 text-xs">
            <div className="flex justify-between"><span className="text-gray-500">North America</span><span className="font-bold text-red-600">42%</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Europe</span><span className="font-bold text-amber-600">28%</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Asia-Pacific</span><span className="font-bold text-blue-600">18%</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Others</span><span className="font-bold text-gray-600">12%</span></div>
          </div>
        </div>

        {/* Most Triggered Rules */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Most Triggered Rules</h2>
            <a href="/admin/rules" className="text-xs font-semibold text-blue-600 hover:underline">View All</a>
          </div>
          <div className="space-y-3">
            {mostTriggeredRules.map(r => (
              <div key={r.name}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="truncate font-semibold text-gray-700 dark:text-gray-300">{r.name}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{r.count}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div className="h-full rounded-full" style={{ width: `${r.pct}%`, backgroundColor: r.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Investigation Efficiency */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Investigation Efficiency</h2>
            <select className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <option>Monthly</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Clock className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-[10px]">Avg. Investigation Time</span>
              </div>
              <p className="mt-1 text-base font-black text-gray-900 dark:text-white">2h 45m</p>
              <span className="text-[9px] font-semibold text-emerald-600">↑ 18.4% from last month</span>
            </div>

            <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
              <div className="flex items-center gap-1.5 text-gray-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-[10px]">Closed Investigations</span>
              </div>
              <p className="mt-1 text-base font-black text-gray-900 dark:text-white">186</p>
              <span className="text-[9px] font-semibold text-emerald-600">↑ 16.2% from last month</span>
            </div>

            <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
              <div className="flex items-center gap-1.5 text-gray-400">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                <span className="text-[10px]">False Positive Rate</span>
              </div>
              <p className="mt-1 text-base font-black text-gray-900 dark:text-white">6.3%</p>
              <span className="text-[9px] font-semibold text-emerald-600">↓ 2.7% from last month</span>
            </div>

            <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
              <div className="flex items-center gap-1.5 text-gray-400">
                <ShieldCheck className="h-3.5 w-3.5 text-purple-500" />
                <span className="text-[10px]">Investigation Success</span>
              </div>
              <p className="mt-1 text-base font-black text-gray-900 dark:text-white">93.7%</p>
              <span className="text-[9px] font-semibold text-emerald-600">↑ 4.6% from last month</span>
            </div>
          </div>
        </div>

        {/* Alert Heatmap (By Hour & Day) */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Alert Heatmap (By Hour & Day)</h2>
            <select
              value={heatmapPeriod}
              onChange={(e) => setHeatmapPeriod(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <option>Week</option>
            </select>
          </div>
          <div className="space-y-1.5 text-[10px]">
            <div className="grid grid-cols-7 gap-1 text-center font-medium text-gray-400">
              <span />
              {heatmapTimes.map(t => <span key={t}>{t}</span>)}
            </div>
            {heatmapDays.map((day, dIdx) => (
              <div key={day} className="grid grid-cols-7 gap-1 items-center">
                <span className="font-semibold text-gray-500">{day}</span>
                {heatmapValues[dIdx].map((val, tIdx) => {
                  const opacity = Math.min(1, Math.max(0.15, val / 95));
                  return (
                    <div
                      key={tIdx}
                      title={`${day} ${heatmapTimes[tIdx]}: ${val} alerts`}
                      className="h-5 rounded-md transition hover:scale-105"
                      style={{ backgroundColor: `rgba(239, 68, 68, ${opacity})` }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-[9px] text-gray-400">
            <span>Low Alerts</span>
            <div className="h-1.5 w-20 rounded-full bg-gradient-to-r from-amber-200 via-orange-400 to-red-600" />
            <span>High Alerts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
