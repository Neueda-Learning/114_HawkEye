import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ComposedChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  Search, Filter, Download, Calendar, Activity, AlertTriangle,
  CheckCircle2, Clock, TrendingUp, DollarSign,
  ShieldCheck, Globe, Zap, UserCheck,
} from 'lucide-react';
import dayjs from 'dayjs';
import { getAlertStats, getAlerts } from '@/lib/api/alerts';
import { getTransactions } from '@/lib/api/transactions';
import { getRules } from '@/lib/api/rules';
import type { Alert, Rule, TransactionResponse } from '@/lib/types';

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

function MerchantIcon({ name }: { name: string }) {
  const n = (name ?? '').toLowerCase();
  if (n.includes('amazon')) return <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 text-xs font-bold text-orange-600">a</span>;
  if (n.includes('flipkart')) return <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-600">fk</span>;
  if (n.includes('starbucks')) return <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-700">★</span>;
  if (n.includes('netflix')) return <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 text-xs font-bold text-red-600">N</span>;
  if (n.includes('uber')) return <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-900 text-xs font-bold text-white">U</span>;
  return <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-600">🏢</span>;
}

type PagedChunk<T> = { content: T[]; totalPages: number; last: boolean };

async function fetchAllPages<T>(
  fetchPage: (page: number, size: number) => Promise<PagedChunk<T>>,
  size = 100,
  maxPages = 10,
) {
  const items: T[] = [];
  for (let page = 0; page < maxPages; page += 1) {
    const result = await fetchPage(page, size);
    items.push(...result.content);
    if (result.last || page >= result.totalPages - 1) break;
  }
  return items;
}

function percentageChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function sumAmount(rows: TransactionResponse[]) {
  return rows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

function formatCurrencyFull(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

function formatCountAxis(value: number) {
  return Math.abs(value) >= 1000 ? `${(value / 1000).toFixed(0)}k` : `${value}`;
}

function formatMoneyAxis(value: number) {
  if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}m`;
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}k`;
  return `$${value}`;
}

const SEVERITY_COLORS: Record<string, string> = { LOW: '#22c55e', MEDIUM: '#f59e0b', HIGH: '#ef4444', CRITICAL: '#8b5cf6' };
const STATUS_COLORS: Record<string, string> = { OPEN: '#3b82f6', ACKNOWLEDGED: '#f59e0b', INVESTIGATING: '#8b5cf6', CLOSED: '#22c55e', DISMISSED: '#9ca3af' };
const RULE_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#e879f9'];
const HEATMAP_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HEATMAP_TIMES = ['12 AM', '4 AM', '8 AM', '12 PM', '4 PM', '8 PM'];

export default function ReportsPage() {
  const [search, setSearch] = useState('');
  const [volumePeriod, setVolumePeriod] = useState<'Daily' | 'Weekly'>('Daily');
  const [trendPeriod, setTrendPeriod] = useState<'Daily' | 'Weekly'>('Daily');
  const [fraudPeriod, setFraudPeriod] = useState<'Weekly' | 'Monthly'>('Weekly');
  const [heatmapPeriod, setHeatmapPeriod] = useState<'Week'>('Week');
  const [startDate, setStartDate] = useState(dayjs().subtract(6, 'day').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));

  const calendarStartIso = dayjs(startDate).startOf('day').format('YYYY-MM-DDTHH:mm:ss');
  const calendarEndIso = dayjs(endDate).endOf('day').format('YYYY-MM-DDTHH:mm:ss');

  const txSummaryQuery = useQuery({
    queryKey: ['reports', 'tx-summary', startDate, endDate],
    queryFn: () => getTransactions({ size: 1, startDate: calendarStartIso, endDate: calendarEndIso }),
    refetchInterval: 15000,
  });
  const transactionsQuery = useQuery({
    queryKey: ['reports', 'tx-all', startDate, endDate],
    queryFn: () => fetchAllPages<TransactionResponse>((p, s) => getTransactions({
      page: p,
      size: s,
      sort: 'timestamp,desc',
      startDate: calendarStartIso,
      endDate: calendarEndIso,
    })),
    refetchInterval: 15000,
  });
  const alertsQuery = useQuery({ queryKey: ['reports', 'alerts-all'], queryFn: () => fetchAllPages<Alert>((p, s) => getAlerts({ page: p, size: s, sort: 'createdAt,desc' })), refetchInterval: 15000 });
  const rulesQuery = useQuery({ queryKey: ['reports', 'rules-all'], queryFn: () => fetchAllPages<Rule>((p, s) => getRules({ page: p, size: s })), refetchInterval: 15000 });
  const alertStatsQuery = useQuery({ queryKey: ['reports', 'alert-stats'], queryFn: getAlertStats, refetchInterval: 15000 });

  const transactions = transactionsQuery.data ?? [];
  const alerts = alertsQuery.data ?? [];
  const rules = rulesQuery.data ?? [];
  const alertStats = alertStatsQuery.data;
  const totalTransactions = txSummaryQuery.data?.totalElements ?? transactions.length;
  const totalAlerts = alertStats?.total ?? alerts.length;
  const searchLower = search.trim().toLowerCase();
  const now = dayjs();

  const currentWeekStart = now.subtract(6, 'day').startOf('day');
  const previousWeekStart = currentWeekStart.subtract(7, 'day');
  const previousWeekEnd = currentWeekStart.subtract(1, 'day').endOf('day');

  const currentTransactions = transactions.filter((t) => { const ts = dayjs(t.timestamp); return ts.isAfter(currentWeekStart) || ts.isSame(currentWeekStart); });
  const previousTransactions = transactions.filter((t) => { const ts = dayjs(t.timestamp); return (ts.isAfter(previousWeekStart) || ts.isSame(previousWeekStart)) && (ts.isBefore(previousWeekEnd) || ts.isSame(previousWeekEnd)); });
  const currentAlerts = alerts.filter((a) => { const ts = dayjs(a.createdAt); return ts.isAfter(currentWeekStart) || ts.isSame(currentWeekStart); });
  const previousAlerts = alerts.filter((a) => { const ts = dayjs(a.createdAt); return (ts.isAfter(previousWeekStart) || ts.isSame(previousWeekStart)) && (ts.isBefore(previousWeekEnd) || ts.isSame(previousWeekEnd)); });
  const currentHighAlerts = currentAlerts.filter((a) => a.severity === 'HIGH' || a.severity === 'CRITICAL');
  const previousHighAlerts = previousAlerts.filter((a) => a.severity === 'HIGH' || a.severity === 'CRITICAL');

  const totalAmount = sumAmount(transactions);
  const currentAmount = sumAmount(currentTransactions);
  const previousAmount = sumAmount(previousTransactions);
  const detectionRate = totalTransactions > 0 ? Number(((totalAlerts / totalTransactions) * 100).toFixed(1)) : 0;
  const previousDetectionRate = previousTransactions.length > 0 ? Number(((previousAlerts.length / previousTransactions.length) * 100).toFixed(1)) : 0;

  const volumeOverTimeData = useMemo(() => {
    if (volumePeriod === 'Weekly') {
      return Array.from({ length: 6 }, (_, idx) => now.startOf('week').subtract(5 - idx, 'week')).map((wk) => {
        const wkEnd = wk.endOf('week');
        const rows = transactions.filter((t) => { const ts = dayjs(t.timestamp); return ts.isValid() && (ts.isAfter(wk) || ts.isSame(wk)) && (ts.isBefore(wkEnd) || ts.isSame(wkEnd)); });
        return { date: wk.format('MMM D'), transactions: rows.length, amount: sumAmount(rows) };
      });
    }
    return Array.from({ length: 7 }, (_, idx) => now.startOf('day').subtract(6 - idx, 'day')).map((day) => {
      const dayEnd = day.endOf('day');
      const rows = transactions.filter((t) => { const ts = dayjs(t.timestamp); return ts.isValid() && (ts.isAfter(day) || ts.isSame(day)) && (ts.isBefore(dayEnd) || ts.isSame(dayEnd)); });
      return { date: day.format('MMM D'), transactions: rows.length, amount: sumAmount(rows) };
    });
  }, [now, transactions, volumePeriod]);

  const severityDonutData = useMemo(() =>
    ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
      .map((name) => ({ name: name.charAt(0) + name.slice(1).toLowerCase(), value: Number(alertStats?.bySeverity?.[name] ?? 0), color: SEVERITY_COLORS[name] }))
      .filter((item) => item.value > 0),
  [alertStats]);

  const alertTrendData = useMemo(() => {
    const buildRow = (start: ReturnType<typeof dayjs>, end: ReturnType<typeof dayjs>, label: string) => {
      const rows = alerts.filter((a) => { const ts = dayjs(a.createdAt); return ts.isValid() && (ts.isAfter(start) || ts.isSame(start)) && (ts.isBefore(end) || ts.isSame(end)); });
      return { date: label, high: rows.filter((a) => a.severity === 'HIGH').length, medium: rows.filter((a) => a.severity === 'MEDIUM').length, low: rows.filter((a) => a.severity === 'LOW').length, critical: rows.filter((a) => a.severity === 'CRITICAL').length };
    };
    if (trendPeriod === 'Weekly') {
      return Array.from({ length: 6 }, (_, idx) => now.startOf('week').subtract(5 - idx, 'week')).map((wk) => buildRow(wk, wk.endOf('week'), wk.format('MMM D')));
    }
    return Array.from({ length: 7 }, (_, idx) => now.startOf('day').subtract(6 - idx, 'day')).map((day) => buildRow(day, day.endOf('day'), day.format('MMM D')));
  }, [alerts, now, trendPeriod]);

  const typeDonutData = useMemo(() => {
    const debit = transactions.filter((t) => t.transactionType === 'DEBIT').length;
    const credit = transactions.filter((t) => t.transactionType === 'CREDIT').length;
    return [{ name: 'Debit', value: debit, color: '#2563eb' }, { name: 'Credit', value: credit, color: '#22c55e' }].filter((i) => i.value > 0);
  }, [transactions]);

  const topMerchants = useMemo(() => {
    const grouped = new Map<string, { count: number; amount: number }>();
    transactions.forEach((t) => {
      const name = t.payeeName || t.payeeId || 'Unknown Merchant';
      if (!name) return;
      const cur = grouped.get(name) ?? { count: 0, amount: 0 };
      grouped.set(name, { count: cur.count + 1, amount: cur.amount + Number(t.amount ?? 0) });
    });
    const items = Array.from(grouped.entries())
      .map(([name, v]) => ({ name, ...v }))
      .filter((r) => r.name != null && r.name.toLowerCase().includes(searchLower))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    const max = Math.max(1, ...items.map((i) => i.amount));
    return items.map((i) => ({ ...i, pct: Math.round((i.amount / max) * 100) }));
  }, [transactions, searchLower]);

  const fraudTrendData = useMemo(() => {
    const buildRow = (start: ReturnType<typeof dayjs>, end: ReturnType<typeof dayjs>, label: string) => ({
      date: label,
      high: alerts.filter((a) => { const ts = dayjs(a.createdAt); return ts.isValid() && (ts.isAfter(start) || ts.isSame(start)) && (ts.isBefore(end) || ts.isSame(end)) && (a.severity === 'HIGH' || a.severity === 'CRITICAL'); }).length,
    });
    if (fraudPeriod === 'Monthly') {
      return Array.from({ length: 6 }, (_, idx) => now.startOf('month').subtract(5 - idx, 'month')).map((m) => buildRow(m, m.endOf('month'), m.format('MMM')));
    }
    return Array.from({ length: 6 }, (_, idx) => now.startOf('week').subtract(5 - idx, 'week')).map((wk) => buildRow(wk, wk.endOf('week'), wk.format('MMM D')));
  }, [alerts, fraudPeriod, now]);

  const statusDonutData = useMemo(() => [
    { name: 'Open', value: alertStats?.open ?? 0, color: STATUS_COLORS.OPEN },
    { name: 'Acknowledged', value: alertStats?.acknowledged ?? 0, color: STATUS_COLORS.ACKNOWLEDGED },
    { name: 'Investigating', value: alertStats?.investigating ?? 0, color: STATUS_COLORS.INVESTIGATING },
    { name: 'Closed', value: alertStats?.closed ?? 0, color: STATUS_COLORS.CLOSED },
    { name: 'Dismissed', value: alertStats?.dismissed ?? 0, color: STATUS_COLORS.DISMISSED },
  ].filter((i) => i.value > 0), [alertStats]);

  const mostTriggeredRules = useMemo(() => {
    const counts = new Map<string, number>();
    rules.forEach((r) => { const n = r.ruleName ?? `Rule #${r.ruleId}`; if (n) counts.set(n, 0); });
    alerts.forEach((a) => { const n = a.ruleName || `Rule #${a.ruleId}`; if (n) counts.set(n, (counts.get(n) ?? 0) + 1); });
    const items = Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .filter((r) => r.name != null && r.name.toLowerCase().includes(searchLower))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, 5);
    const max = Math.max(1, ...items.map((i) => i.count));
    return items.map((i, idx) => ({ ...i, pct: Math.round((i.count / max) * 100), color: RULE_COLORS[idx % RULE_COLORS.length] }));
  }, [alerts, rules, searchLower]);

  const hotspots = useMemo(() => {
    const counts = new Map<string, number>();
    alerts.forEach((a) => { const k = a.accountId || 'Unknown Account'; counts.set(k, (counts.get(k) ?? 0) + 1); });
    const items = Array.from(counts.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 4);
    const total = items.reduce((s, i) => s + i.count, 0) || 1;
    return items.map((i, idx) => ({ ...i, pct: Math.round((i.count / total) * 100), color: ['#ef4444', '#f59e0b', '#3b82f6', '#6b7280'][idx % 4] }));
  }, [alerts]);

  const efficiency = useMemo(() => {
    const resolved = alerts.filter((a) => a.closedAt || a.dismissedAt);
    const durations = resolved.map((a) => {
      const start = dayjs(a.investigatingAt || a.acknowledgedAt || a.createdAt);
      const end = dayjs(a.closedAt || a.dismissedAt || a.updatedAt);
      return start.isValid() && end.isValid() ? end.diff(start, 'minute') : null;
    }).filter((v): v is number => v !== null && v >= 0);
    const avgMin = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
    const closed = alertStats?.closed ?? 0;
    const dismissed = alertStats?.dismissed ?? 0;
    const res = closed + dismissed;
    return {
      avgTimeLabel: avgMin >= 60 ? `${Math.floor(avgMin / 60)}h ${avgMin % 60}m` : `${avgMin}m`,
      closedInvestigations: closed,
      falsePositiveRate: res > 0 ? Number(((dismissed / res) * 100).toFixed(1)) : 0,
      successRate: res > 0 ? Number(((closed / res) * 100).toFixed(1)) : 0,
    };
  }, [alerts, alertStats]);

  const heatmapValues = useMemo(() => {
    const matrix = Array.from({ length: 7 }, () => Array.from({ length: 6 }, () => 0));
    alerts.forEach((a) => {
      const ts = dayjs(a.createdAt);
      if (!ts.isValid()) return;
      const jsDay = ts.day();
      const day = jsDay === 0 ? 6 : jsDay - 1;
      matrix[day][Math.min(5, Math.floor(ts.hour() / 4))] += 1;
    });
    return matrix;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alerts, heatmapPeriod]);

  const sparkTx = volumeOverTimeData.map((d) => d.transactions);
  const sparkAmt = volumeOverTimeData.map((d) => Math.round(d.amount / 1000));
  const sparkAlerts = alertTrendData.map((d) => d.high + d.medium + d.low + d.critical);
  const sparkHigh = alertTrendData.map((d) => d.high + d.critical);
  const sparkInv = [...statusDonutData.map((d) => (d.name === 'Investigating' ? d.value : 0)), alertStats?.investigating ?? 0].slice(-5);
  const sparkDet = alertTrendData.map((d, idx) => { const tx = volumeOverTimeData[idx]?.transactions ?? 0; const al = d.high + d.medium + d.low + d.critical; return tx > 0 ? Number(((al / tx) * 100).toFixed(1)) : 0; });

  const lastDateLabel = `${dayjs(startDate).format('MMM D, YYYY')} - ${dayjs(endDate).format('MMM D, YYYY')}`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Dashboard</span><span>›</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">Reports</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-gray-900 dark:text-white">Reports & Analytics</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
            <Calendar className="h-4 w-4 text-gray-400" /><span>{lastDateLabel}</span>
          </div>
          <input
            type="date"
            value={startDate}
            max={endDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-2 py-2 text-xs text-gray-600 shadow-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          />
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-2 py-2 text-xs text-gray-600 shadow-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter merchant or rule names..." className="w-56 rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-blue-500 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
          </div>
          <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"><Filter className="h-3.5 w-3.5" /><span>Filters</span></button>
          <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"><Download className="h-3.5 w-3.5" /><span>Export</span></button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Total Transactions', value: totalTransactions.toLocaleString(), pct: percentageChange(currentTransactions.length, previousTransactions.length), spark: sparkTx, color: '#2563eb', icon: <Activity className="h-4 w-4" />, bg: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' },
          { label: 'Total Amount', value: formatCurrencyFull(totalAmount), pct: percentageChange(currentAmount, previousAmount), spark: sparkAmt, color: '#22c55e', icon: <DollarSign className="h-4 w-4" />, bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' },
          { label: 'Total Alerts', value: String(totalAlerts), pct: percentageChange(currentAlerts.length, previousAlerts.length), spark: sparkAlerts, color: '#ef4444', icon: <AlertTriangle className="h-4 w-4" />, bg: 'bg-red-50 text-red-600 dark:bg-red-900/30' },
          { label: 'High Severity Alerts', value: String((alertStats?.bySeverity?.HIGH ?? 0) + (alertStats?.bySeverity?.CRITICAL ?? 0)), pct: percentageChange(currentHighAlerts.length, previousHighAlerts.length), spark: sparkHigh, color: '#f59e0b', icon: <ShieldCheck className="h-4 w-4" />, bg: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30' },
          { label: 'Open Investigations', value: String(alertStats?.investigating ?? 0), pct: null, spark: sparkInv, color: '#8b5cf6', icon: <UserCheck className="h-4 w-4" />, bg: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30' },
          { label: 'Alert Detection Rate', value: `${detectionRate}%`, pct: percentageChange(detectionRate, previousDetectionRate), spark: sparkDet, color: '#06b6d4', icon: <Zap className="h-4 w-4" />, bg: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30' },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className="mt-1 text-xl font-black text-gray-900 dark:text-white">{card.value}</p>
                <span className="mt-1 flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  {card.pct !== null ? `${Math.abs(card.pct)}% from last week` : 'live status'}
                </span>
              </div>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.bg}`}>{card.icon}</div>
            </div>
            <div className="mt-2"><Sparkline data={card.spark.length ? card.spark : [0]} color={card.color} /></div>
          </div>
        ))}
      </div>

      {/* Volume + Severity + Alert Trend */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Transaction Volume Over Time</h2>
            <select value={volumePeriod} onChange={(e) => setVolumePeriod(e.target.value as 'Daily' | 'Weekly')} className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <option>Daily</option><option>Weekly</option>
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
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={formatCountAxis} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={formatMoneyAxis} />
              <Tooltip formatter={(v: number, n: string) => n === 'Amount (USD)' ? [formatCurrencyFull(v), n] : [v.toLocaleString(), n]} />
              <Bar yAxisId="left" dataKey="transactions" fill="#2563eb" radius={[3, 3, 0, 0]} name="Transactions" />
              <Line yAxisId="right" type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: '#22c55e' }} name="Amount (USD)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Alerts by Severity</h2>
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <PieChart width={150} height={150}>
                <Pie data={severityDonutData} cx={70} cy={70} innerRadius={48} outerRadius={68} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                  {severityDonutData.map((e) => <Cell key={e.name} fill={e.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-gray-900 dark:text-white">{totalAlerts}</span>
                <span className="text-[10px] text-gray-400">Total</span>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-1.5 text-xs">
              {severityDonutData.length === 0 && <p className="text-gray-400">No data yet</p>}
              {severityDonutData.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: d.color }} /><span className="text-gray-600 dark:text-gray-300">{d.name}</span></div>
                  <span className="font-bold text-gray-900 dark:text-white">{d.value} <span className="font-normal text-gray-400">({totalAlerts ? ((d.value / totalAlerts) * 100).toFixed(1) : '0.0'}%)</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Alert Trend Over Time</h2>
            <select value={trendPeriod} onChange={(e) => setTrendPeriod(e.target.value as 'Daily' | 'Weekly')} className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <option>Daily</option><option>Weekly</option>
            </select>
          </div>
          <div className="mb-2 flex gap-3 text-[10px] text-gray-500">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-violet-500" />Critical</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />High</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />Medium</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Low</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={alertTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <Tooltip />
              <Line type="monotone" dataKey="critical" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} name="Critical" />
              <Line type="monotone" dataKey="high" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="High" />
              <Line type="monotone" dataKey="medium" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Medium" />
              <Line type="monotone" dataKey="low" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Low" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Type + Merchants + Fraud Trend + Status */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Transactions by Type</h2>
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <PieChart width={120} height={120}>
                <Pie data={typeDonutData} cx={55} cy={55} innerRadius={40} outerRadius={56} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                  {typeDonutData.map((e) => <Cell key={e.name} fill={e.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-black text-gray-900 dark:text-white">{totalTransactions.toLocaleString()}</span>
                <span className="text-[8px] text-gray-400">Total</span>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-2 text-xs">
              {typeDonutData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />{item.name}</span>
                  <span className="font-bold">{item.value.toLocaleString()} <span className="font-normal text-gray-400">({totalTransactions ? ((item.value / totalTransactions) * 100).toFixed(1) : '0.0'}%)</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Top 5 Merchants by Volume</h2>
            <span className="text-xs font-semibold text-blue-600">Live</span>
          </div>
          <div className="space-y-3 text-xs">
            {topMerchants.length === 0 && <p className="text-gray-400">No merchant data available.</p>}
            {topMerchants.map((m) => (
              <div key={m.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MerchantIcon name={m.name} />
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{m.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-12 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${m.pct}%` }} />
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(m.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Fraud Trend (High Severity)</h2>
            <select value={fraudPeriod} onChange={(e) => setFraudPeriod(e.target.value as 'Weekly' | 'Monthly')} className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <option>Weekly</option><option>Monthly</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={fraudTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="fraudGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
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

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Alerts by Status</h2>
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <PieChart width={120} height={120}>
                <Pie data={statusDonutData} cx={55} cy={55} innerRadius={40} outerRadius={56} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                  {statusDonutData.map((e) => <Cell key={e.name} fill={e.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-black text-gray-900 dark:text-white">{totalAlerts}</span>
                <span className="text-[8px] text-gray-400">Total</span>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-1 text-[10px]">
              {statusDonutData.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ backgroundColor: d.color }} /><span className="text-gray-600 dark:text-gray-300">{d.name}</span></div>
                  <span className="font-bold text-gray-900 dark:text-white">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hotspots + Rules + Efficiency + Heatmap */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Alert Hotspots (By Account)</h2>
          <div className="rounded-xl border border-gray-100 bg-blue-50/30 p-4 text-center dark:border-gray-800 dark:bg-gray-800/40">
            <Globe className="mx-auto h-16 w-16 text-blue-400 opacity-60" />
            <p className="mt-2 text-xs font-semibold text-gray-700 dark:text-gray-300">Highest alert volumes by account</p>
          </div>
          <div className="mt-4 space-y-1.5 text-xs">
            {hotspots.length === 0 && <p className="text-gray-400">No hotspot data available.</p>}
            {hotspots.map((item) => (
              <div key={item.name} className="flex justify-between">
                <span className="text-gray-500">{item.name}</span>
                <span className="font-bold" style={{ color: item.color }}>{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Most Triggered Rules</h2>
            <a href="/admin/rules" className="text-xs font-semibold text-blue-600 hover:underline">View All</a>
          </div>
          <div className="space-y-3">
            {mostTriggeredRules.length === 0 && <p className="text-xs text-gray-400">No rule-trigger data available.</p>}
            {mostTriggeredRules.map((r) => (
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

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Investigation Efficiency</h2>
            <span className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">Live</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              { icon: <Clock className="h-3.5 w-3.5 text-blue-500" />, label: 'Avg. Investigation Time', value: efficiency.avgTimeLabel, sub: 'from resolved alerts' },
              { icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />, label: 'Closed Investigations', value: String(efficiency.closedInvestigations), sub: 'live closed alerts' },
              { icon: <AlertTriangle className="h-3.5 w-3.5 text-red-500" />, label: 'False Positive Rate', value: `${efficiency.falsePositiveRate}%`, sub: 'dismissed vs resolved' },
              { icon: <ShieldCheck className="h-3.5 w-3.5 text-purple-500" />, label: 'Investigation Success', value: `${efficiency.successRate}%`, sub: 'closed vs resolved' },
            ].map((card) => (
              <div key={card.label} className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
                <div className="flex items-center gap-1.5 text-gray-400">{card.icon}<span className="text-[10px]">{card.label}</span></div>
                <p className="mt-1 text-base font-black text-gray-900 dark:text-white">{card.value}</p>
                <span className="text-[9px] font-semibold text-emerald-600">{card.sub}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Alert Heatmap (By Hour &amp; Day)</h2>
            <select value={heatmapPeriod} onChange={(e) => setHeatmapPeriod(e.target.value as 'Week')} className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <option>Week</option>
            </select>
          </div>
          <div className="space-y-1.5 text-[10px]">
            <div className="grid grid-cols-7 gap-1 text-center font-medium text-gray-400">
              <span />{HEATMAP_TIMES.map((t) => <span key={t}>{t}</span>)}
            </div>
            {HEATMAP_DAYS.map((day, dIdx) => (
              <div key={day} className="grid grid-cols-7 gap-1 items-center">
                <span className="font-semibold text-gray-500">{day}</span>
                {heatmapValues[dIdx].map((val, tIdx) => {
                  const maxVal = Math.max(1, ...heatmapValues.flat());
                  const opacity = Math.min(1, Math.max(0.15, val / maxVal));
                  return <div key={tIdx} title={`${day} ${HEATMAP_TIMES[tIdx]}: ${val} alerts`} className="h-5 rounded-md transition hover:scale-105" style={{ backgroundColor: `rgba(239, 68, 68, ${opacity})` }} />;
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
