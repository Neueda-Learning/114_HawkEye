import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  Calendar, RefreshCw, Filter, Download, CheckCircle2,
  AlertTriangle, Server, Cpu, Bell, Activity, ExternalLink
} from 'lucide-react';
import { getTransactions } from '@/lib/api/transactions';
import { getRules } from '@/lib/api/rules';
import { getAlertStats, getAlertHistory } from '@/lib/api/alerts';
import type { Rule } from '@/lib/types';

// Sparkline Mini Component
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const pts = data.map((v, i) => ({ x: i, y: v }));
  return (
    <ResponsiveContainer width="100%" height={24}>
      <LineChart data={pts} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <Line type="monotone" dataKey="y" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Donut Gauge Progress Indicator
function GaugeProgress({ value, color }: { value: number; color: string }) {
  const data = [{ value }, { value: Math.max(0, 100 - value) }];
  return (
    <div className="relative flex items-center justify-center">
      <PieChart width={110} height={110}>
        <Pie data={data} cx={50} cy={50} innerRadius={36} outerRadius={48} dataKey="value" startAngle={90} endAngle={-270}>
          <Cell fill={color} />
          <Cell fill="#f3f4f6" />
        </Pie>
      </PieChart>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-xl font-black text-gray-900 dark:text-white">{value}%</span>
        <span className="text-[9px] text-gray-400">Average</span>
      </div>
    </div>
  );
}

type TimedResult<T> = {
  data: T;
  latencyMs: number;
  checkedAt: string;
};

async function fetchWithTiming<T>(fn: () => Promise<T>): Promise<TimedResult<T>> {
  const startedAt = performance.now();
  const data = await fn();
  const endedAt = performance.now();
  return {
    data,
    latencyMs: Math.max(1, Math.round(endedAt - startedAt)),
    checkedAt: new Date().toISOString(),
  };
}

function formatMs(value?: number) {
  return typeof value === 'number' ? `${value} ms` : '--';
}

function safePct(part: number, total: number) {
  if (!total) return 0;
  return Math.min(100, Math.max(0, Math.round((part / total) * 100)));
}

export default function SystemHealthPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [resourcePeriod, setResourcePeriod] = useState('Last 7 Days');
  const [uptimePeriod, setUptimePeriod] = useState('Last 30 Days');
  const [responseTimePeriod, setResponseTimePeriod] = useState('Last 7 Days');
  const [uptimeTrendData, setUptimeTrendData] = useState<{ date: string; uptime: number }[]>([]);
  const [responseTimeData, setResponseTimeData] = useState<{
    date: string;
    txn: number;
    rule: number;
    alert: number;
    monitoring: number;
  }[]>([]);

  const refetchInterval = autoRefresh ? 15000 : false;

  const transactionsHealth = useQuery({
    queryKey: ['system-health', 'transactions'],
    queryFn: () => fetchWithTiming(() => getTransactions({ page: 0, size: 1 })),
    refetchInterval,
  });

  const rulesHealth = useQuery({
    queryKey: ['system-health', 'rules'],
    queryFn: () => fetchWithTiming(() => getRules({ page: 0, size: 300 })),
    refetchInterval,
  });

  const activeRulesHealth = useQuery({
    queryKey: ['system-health', 'rules-active'],
    queryFn: () => fetchWithTiming(() => getRules({ status: 'ACTIVE', page: 0, size: 1 })),
    refetchInterval,
  });

  const alertStatsHealth = useQuery({
    queryKey: ['system-health', 'alert-stats'],
    queryFn: () => fetchWithTiming(() => getAlertStats()),
    refetchInterval,
  });

  const monitoringHealth = useQuery({
    queryKey: ['system-health', 'alerts-history'],
    queryFn: () => fetchWithTiming(() => getAlertHistory({ page: 0, size: 5 })),
    refetchInterval,
  });

  const ruleRows: Rule[] = rulesHealth.data?.data.content ?? [];
  const totalRules = rulesHealth.data?.data.totalElements ?? 0;
  const activeRules = activeRulesHealth.data?.data.totalElements ?? 0;
  const totalTransactions = transactionsHealth.data?.data.totalElements ?? 0;

  const statsRaw = (alertStatsHealth.data?.data ?? {}) as {
    open?: number;
    acknowledged?: number;
    investigating?: number;
    closed?: number;
    dismissed?: number;
    total?: number;
  };

  const openAlerts = Number(statsRaw.open ?? 0);
  const investigatingAlerts = Number(statsRaw.investigating ?? 0);
  const totalAlerts = Number(statsRaw.total ?? 0);

  const checks = [transactionsHealth, rulesHealth, activeRulesHealth, alertStatsHealth, monitoringHealth];
  const healthyChecks = checks.filter((q) => q.isSuccess).length;
  const degradedChecks = checks.filter((q) => q.isError).length;
  const checkedCount = healthyChecks + degradedChecks;
  const currentUptime = checkedCount > 0 ? Number(((healthyChecks / checkedCount) * 100).toFixed(2)) : 0;

  const latestCheckedAt = useMemo(() => {
    const values = checks
      .map((q) => q.data?.checkedAt)
      .filter((v): v is string => Boolean(v));
    if (values.length === 0) return null;
    return new Date(values.sort().at(-1) as string);
  }, [
    transactionsHealth.data?.checkedAt,
    rulesHealth.data?.checkedAt,
    activeRulesHealth.data?.checkedAt,
    alertStatsHealth.data?.checkedAt,
    monitoringHealth.data?.checkedAt,
  ]);

  useEffect(() => {
    if (!latestCheckedAt) return;

    const label = latestCheckedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const txnMs = transactionsHealth.data?.latencyMs ?? 0;
    const ruleMs = rulesHealth.data?.latencyMs ?? 0;
    const alertMs = alertStatsHealth.data?.latencyMs ?? 0;
    const monitoringMs = monitoringHealth.data?.latencyMs ?? 0;

    setUptimeTrendData((prev) => {
      const next = [...prev, { date: label, uptime: currentUptime }];
      return next.slice(-7);
    });

    setResponseTimeData((prev) => {
      const next = [...prev, { date: label, txn: txnMs, rule: ruleMs, alert: alertMs, monitoring: monitoringMs }];
      return next.slice(-7);
    });
  }, [
    latestCheckedAt?.toISOString(),
    currentUptime,
    transactionsHealth.data?.latencyMs,
    rulesHealth.data?.latencyMs,
    alertStatsHealth.data?.latencyMs,
    monitoringHealth.data?.latencyMs,
  ]);

  const effectiveUptimeData = uptimeTrendData.length > 0 ? uptimeTrendData : [{ date: 'Now', uptime: currentUptime }];
  const effectiveResponseData = responseTimeData.length > 0 ? responseTimeData : [{
    date: 'Now',
    txn: transactionsHealth.data?.latencyMs ?? 0,
    rule: rulesHealth.data?.latencyMs ?? 0,
    alert: alertStatsHealth.data?.latencyMs ?? 0,
    monitoring: monitoringHealth.data?.latencyMs ?? 0,
  }];

  const allOperational = degradedChecks === 0 && healthyChecks === checks.length;
  const serviceStatus = {
    transactions: transactionsHealth.isError ? 'Degraded' : transactionsHealth.isSuccess ? 'Healthy' : 'Checking',
    rules: rulesHealth.isError ? 'Degraded' : rulesHealth.isSuccess ? 'Healthy' : 'Checking',
    alerts: alertStatsHealth.isError ? 'Degraded' : alertStatsHealth.isSuccess ? 'Healthy' : 'Checking',
    monitoring: monitoringHealth.isError ? 'Degraded' : monitoringHealth.isSuccess ? 'Healthy' : 'Checking',
  };

  const incidents = (monitoringHealth.data?.data.content ?? []).map((a) => ({
    time: new Date(a.updatedAt ?? a.createdAt).toLocaleString(),
    text: a.alertMessage,
    type: a.alertStatus === 'OPEN' || a.alertStatus === 'INVESTIGATING' ? 'warn' : 'info',
    status: a.alertStatus,
  }));

  const microservices = [
    {
      name: 'Transaction Service',
      status: serviceStatus.transactions,
      icon: <Server className="h-5 w-5 text-emerald-600" />,
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
      availability: transactionsHealth.isSuccess ? 'Online' : transactionsHealth.isError ? 'Offline' : 'Checking',
      respTime: formatMs(transactionsHealth.data?.latencyMs),
      metricLabel: 'Transactions',
      metricValue: `${totalTransactions}`,
      spark: effectiveResponseData.map((d) => d.txn),
      color: '#22c55e',
    },
    {
      name: 'Rule Engine Service',
      status: serviceStatus.rules,
      icon: <Cpu className="h-5 w-5 text-blue-600" />,
      iconBg: 'bg-blue-50 dark:bg-blue-900/30',
      availability: rulesHealth.isSuccess ? 'Online' : rulesHealth.isError ? 'Offline' : 'Checking',
      respTime: formatMs(rulesHealth.data?.latencyMs),
      metricLabel: 'Rules',
      metricValue: `${totalRules}`,
      spark: effectiveResponseData.map((d) => d.rule),
      color: '#2563eb',
    },
    {
      name: 'Alert Service',
      status: serviceStatus.alerts,
      icon: <Bell className="h-5 w-5 text-purple-600" />,
      iconBg: 'bg-purple-50 dark:bg-purple-900/30',
      availability: alertStatsHealth.isSuccess ? 'Online' : alertStatsHealth.isError ? 'Offline' : 'Checking',
      respTime: formatMs(alertStatsHealth.data?.latencyMs),
      metricLabel: 'Open Alerts',
      metricValue: `${openAlerts}`,
      spark: effectiveResponseData.map((d) => d.alert),
      color: '#8b5cf6',
    },
    {
      name: 'Monitoring Rules Service',
      status: serviceStatus.monitoring,
      icon: <Activity className="h-5 w-5 text-orange-600" />,
      iconBg: 'bg-orange-50 dark:bg-orange-900/30',
      availability: monitoringHealth.isSuccess ? 'Online' : monitoringHealth.isError ? 'Offline' : 'Checking',
      respTime: formatMs(monitoringHealth.data?.latencyMs),
      metricLabel: 'History Events',
      metricValue: `${monitoringHealth.data?.data.totalElements ?? 0}`,
      spark: effectiveResponseData.map((d) => d.monitoring),
      color: '#f59e0b',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Breadcrumb & Top Bar ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Dashboard</span>
            <span>›</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">System Health</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-gray-900 dark:text-white">System Health</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{latestCheckedAt ? `Last checked: ${latestCheckedAt.toLocaleString()}` : 'Waiting for backend checks...'}</span>
          </div>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${autoRefresh ? 'text-emerald-500 animate-spin' : 'text-gray-400'}`} />
            <span>Auto Refresh: <strong className={autoRefresh ? 'text-emerald-600' : 'text-gray-400'}>{autoRefresh ? 'On' : 'Off'}</strong></span>
          </button>

          <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters</span>
          </button>

          <button className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700">
            <Download className="h-3.5 w-3.5" />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      {/* ── Row 1 — 4 Microservice Service Cards ────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {microservices.map((svc) => (
          <div key={svc.name} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${svc.iconBg}`}>
                  {svc.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">{svc.name}</h3>
                </div>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                {svc.status}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-b border-gray-50 py-3 dark:border-gray-800 text-xs">
              <div>
                <p className="text-[10px] text-gray-400">Availability</p>
                <p className="mt-0.5 text-lg font-black text-emerald-600 dark:text-emerald-400">{svc.availability}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400">Response Time</p>
                <p className="mt-0.5 text-lg font-black text-gray-900 dark:text-white">{svc.respTime}</p>
              </div>
            </div>

            <div className="mt-3 space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">{svc.metricLabel} <strong className="text-gray-900 dark:text-white">{svc.metricValue}</strong></span>
                <div className="w-20"><Sparkline data={svc.spark} color={svc.color} /></div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 pt-2 border-t border-gray-50 dark:border-gray-800">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{svc.status === 'Healthy' ? 'Healthy backend response' : svc.status === 'Degraded' ? 'Backend call failed' : 'Health check in progress'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 2 — Resource Utilization (Overall) (4 Donut Gauges) ────── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Resource Utilization (Overall)</h2>
          <select
            value={resourcePeriod}
            onChange={(e) => setResourcePeriod(e.target.value)}
            className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {/* Gauge 1 — CPU */}
          <div className="flex items-center gap-4 rounded-xl border border-gray-50 bg-gray-50/40 p-4 dark:border-gray-800 dark:bg-gray-800/40">
            <GaugeProgress value={Math.round(currentUptime)} color="#22c55e" />
            <div className="flex-1 space-y-1 text-xs">
              <p className="font-bold text-gray-900 dark:text-white">API Availability</p>
              <div className="flex justify-between text-[11px] text-gray-500"><span>Successful checks</span><strong className="text-gray-800 dark:text-gray-200">{healthyChecks}</strong></div>
              <div className="flex justify-between text-[11px] text-gray-500"><span>Failed checks</span><strong className="text-gray-800 dark:text-gray-200">{degradedChecks}</strong></div>
              <div className="flex justify-between text-[11px] text-gray-500"><span>Coverage</span><strong className="text-gray-800 dark:text-gray-200">{checks.length} services</strong></div>
              <span className="inline-block pt-1 text-[10px] font-semibold text-emerald-600">Live backend checks</span>
            </div>
          </div>

          {/* Gauge 2 — Memory */}
          <div className="flex items-center gap-4 rounded-xl border border-gray-50 bg-gray-50/40 p-4 dark:border-gray-800 dark:bg-gray-800/40">
            <GaugeProgress value={safePct(openAlerts, Math.max(1, totalAlerts))} color="#2563eb" />
            <div className="flex-1 space-y-1 text-xs">
              <p className="font-bold text-gray-900 dark:text-white">Open Alerts Ratio</p>
              <div className="flex justify-between text-[11px] text-gray-500"><span>Open alerts</span><strong className="text-gray-800 dark:text-gray-200">{openAlerts}</strong></div>
              <div className="flex justify-between text-[11px] text-gray-500"><span>Total alerts</span><strong className="text-gray-800 dark:text-gray-200">{totalAlerts}</strong></div>
              <div className="flex justify-between text-[11px] text-gray-500"><span>Investigating</span><strong className="text-gray-800 dark:text-gray-200">{investigatingAlerts}</strong></div>
              <span className="inline-block pt-1 text-[10px] font-semibold text-emerald-600">Derived from `/alerts/stats`</span>
            </div>
          </div>

          {/* Gauge 3 — Disk */}
          <div className="flex items-center gap-4 rounded-xl border border-gray-50 bg-gray-50/40 p-4 dark:border-gray-800 dark:bg-gray-800/40">
            <GaugeProgress value={safePct(activeRules, Math.max(1, totalRules))} color="#8b5cf6" />
            <div className="flex-1 space-y-1 text-xs">
              <p className="font-bold text-gray-900 dark:text-white">Active Rules Ratio</p>
              <div className="flex justify-between text-[11px] text-gray-500"><span>Active rules</span><strong className="text-gray-800 dark:text-gray-200">{activeRules}</strong></div>
              <div className="flex justify-between text-[11px] text-gray-500"><span>Total rules</span><strong className="text-gray-800 dark:text-gray-200">{totalRules}</strong></div>
              <div className="flex justify-between text-[11px] text-gray-500"><span>Loaded rules</span><strong className="text-gray-800 dark:text-gray-200">{ruleRows.length}</strong></div>
              <span className="inline-block pt-1 text-[10px] font-semibold text-emerald-600">Derived from `/rules`</span>
            </div>
          </div>

          {/* Gauge 4 — Network */}
          <div className="flex items-center gap-4 rounded-xl border border-gray-50 bg-gray-50/40 p-4 dark:border-gray-800 dark:bg-gray-800/40">
            <GaugeProgress value={safePct(totalTransactions, totalTransactions + totalAlerts + totalRules)} color="#f59e0b" />
            <div className="flex-1 space-y-1 text-xs">
              <p className="font-bold text-gray-900 dark:text-white">Data Throughput Mix</p>
              <div className="flex justify-between text-[11px] text-gray-500"><span>Transactions</span><strong className="text-gray-800 dark:text-gray-200">{totalTransactions}</strong></div>
              <div className="flex justify-between text-[11px] text-gray-500"><span>Alerts</span><strong className="text-gray-800 dark:text-gray-200">{totalAlerts}</strong></div>
              <div className="flex justify-between text-[11px] text-gray-500"><span>Rules</span><strong className="text-gray-800 dark:text-gray-200">{totalRules}</strong></div>
              <span className="inline-block pt-1 text-[10px] font-semibold text-emerald-600">Derived from live totals</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3 — Availability, Response Times & Recent Incidents (3 Columns) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* System Availability (Uptime) */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">System Availability (Uptime)</h2>
            <select
              value={uptimePeriod}
              onChange={(e) => setUptimePeriod(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <option>Last 30 Days</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={effectiveUptimeData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9ca3af' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#9ca3af' }} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v: number) => [`${v}%`, 'Uptime']} />
              <Line type="monotone" dataKey="uptime" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: '#22c55e' }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-4 gap-2 border-t border-gray-100 pt-3 text-center text-xs dark:border-gray-800">
            <div><p className="text-sm font-black text-gray-900 dark:text-white">{currentUptime.toFixed(2)}%</p><p className="text-[9px] text-gray-400">Current Uptime</p></div>
            <div><p className="text-sm font-black text-emerald-600">{healthyChecks}</p><p className="text-[9px] text-gray-400">Healthy Checks</p></div>
            <div><p className="text-sm font-black text-amber-500">{degradedChecks}</p><p className="text-[9px] text-gray-400">Failed Checks</p></div>
            <div><p className="text-sm font-black text-gray-900 dark:text-white">{checks.length}</p><p className="text-[9px] text-gray-400">Services Checked</p></div>
          </div>
        </div>

        {/* Service Response Time (ms) */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Service Response Time (ms)</h2>
            <select
              value={responseTimePeriod}
              onChange={(e) => setResponseTimePeriod(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="mb-2 flex flex-wrap gap-2 text-[9px] text-gray-500">
            <span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded bg-emerald-500" />Txn</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded bg-blue-500" />Rule Engine</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded bg-purple-500" />Alert</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded bg-amber-500" />Monitoring</span>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={effectiveResponseData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} />
              <Tooltip />
              <Line type="monotone" dataKey="txn" stroke="#22c55e" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="rule" stroke="#2563eb" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="alert" stroke="#8b5cf6" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="monitoring" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-3 grid grid-cols-4 gap-1 border-t border-gray-100 pt-2 text-center text-[10px] dark:border-gray-800">
            <div><p className="font-bold text-emerald-600">{formatMs(transactionsHealth.data?.latencyMs)}</p><p className="text-gray-400">Transaction</p></div>
            <div><p className="font-bold text-blue-600">{formatMs(rulesHealth.data?.latencyMs)}</p><p className="text-gray-400">Rule Engine</p></div>
            <div><p className="font-bold text-purple-600">{formatMs(alertStatsHealth.data?.latencyMs)}</p><p className="text-gray-400">Alert Service</p></div>
            <div><p className="font-bold text-amber-600">{formatMs(monitoringHealth.data?.latencyMs)}</p><p className="text-gray-400">Monitoring Rules</p></div>
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Recent Incidents</h2>
            <a href="/alerts/history" className="text-xs font-semibold text-blue-600 hover:underline">View All</a>
          </div>
          <div className="space-y-3 text-xs">
            {incidents.length === 0 && (
              <div className="rounded-lg border border-dashed border-gray-200 p-3 text-[11px] text-gray-500 dark:border-gray-700">
                No incident history returned from backend.
              </div>
            )}
            {incidents.map((inc, i) => (
              <div key={i} className="flex items-start justify-between gap-2 border-b border-gray-50 pb-2.5 last:border-0 dark:border-gray-800">
                <div className="flex items-start gap-2">
                  {inc.type === 'info' && <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />}
                  {inc.type === 'warn' && <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />}
                  {inc.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />}
                  <div>
                    <p className="text-[10px] text-gray-400">{inc.time}</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{inc.text}</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {inc.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 4 — System Operational Status Footer Bar ───────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">{allOperational ? 'All Systems Operational' : 'Partial Degradation Detected'}</h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">Status is based on live backend endpoint checks and recent alert history.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-emerald-800 dark:text-emerald-300">
          <span>Last Checked: <strong>{latestCheckedAt ? latestCheckedAt.toLocaleString() : '--'}</strong></span>
          <a href="/alerts/stats" className="flex items-center gap-1 rounded-xl border border-emerald-200 bg-white px-3 py-1.5 font-bold text-emerald-700 shadow-sm hover:bg-emerald-50 dark:border-emerald-800 dark:bg-gray-900 dark:text-emerald-300">
            <span>View Alert Stats</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
