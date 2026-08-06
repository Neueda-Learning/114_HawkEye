/**
 * AdminDashboard — matches the TMAS reference design exactly.
 * 4 rows:
 *  Row 1 – 6 KPI cards (each with sparkline mini-chart)
 *  Row 2 – Transaction Trend | Alerts by Severity donut | Alerts by Status donut
 *  Row 3 – Recent High Severity Alerts | Top Triggered Rules | System Health
 *  Row 4 – Transaction Volume Overview (area) | Monthly Fraud Trend (bar+line) | Real-time Activity Feed
 */
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import {
  LineChart, Line, AreaChart, Area,
  Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  Activity, AlertTriangle, ShieldCheck, CheckCircle2,
  TrendingUp, TrendingDown,
  Database, Cpu, Bell, Shield,
  ChevronRight, Search, ClipboardList,
  Calendar,
} from 'lucide-react';
import { getAlerts, getAlertStats } from '@/lib/api/alerts';
import { getTransactions }          from '@/lib/api/transactions';
import { getRules }                 from '@/lib/api/rules';
import dayjs from 'dayjs';

/* ── colour constants ─────────────────────────────────────────────────────── */
const SEV_CLR: Record<string, string> = {
  HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#22c55e',
  CRITICAL: '#8b5cf6', INFORMATIONAL: '#3b82f6',
};
const STA_CLR: Record<string, string> = {
  OPEN: '#3b82f6', ACKNOWLEDGED: '#f59e0b', INVESTIGATING: '#8b5cf6',
  CLOSED: '#22c55e', DISMISSED: '#9ca3af',
};
const RULE_CLR = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6'];

/* ── helpers ──────────────────────────────────────────────────────────────── */
function fmt(iso: string) {
  const diff = dayjs().diff(dayjs(iso), 'minute');
  if (diff < 1)   return 'Just now';
  if (diff < 60)  return dayjs(iso).format('HH:mm A');
  if (diff < 1440)return dayjs(iso).format('HH:mm A');
  if (diff < 2880)return 'Yesterday';
  return dayjs(iso).format('MMM D, YYYY');
}

/* ── Sparkline inside KPI card ────────────────────────────────────────────── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const pts = data.map((v, i) => ({ x: i, y: v }));
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={pts} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <Line type="monotone" dataKey="y" stroke={color} strokeWidth={1.5}
              dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ── KPI card ─────────────────────────────────────────────────────────────── */
interface KpiProps {
  title: string; value: string | number; sub: string;
  trend?: number; trendUp?: boolean;
  icon: React.ReactNode; iconBg: string; iconClr: string;
  spark: number[]; sparkColor: string;
  onClick?: () => void;
}
function KpiCard({ title, value, sub, trend, trendUp, icon, iconBg, iconClr, spark, sparkColor, onClick }: KpiProps) {
  return (
    <div onClick={onClick}
      className={`flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm
                  transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
                  dark:border-gray-700 dark:bg-gray-900
                  ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start gap-3 p-4 pb-2">
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          <span className={iconClr}>{icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-0.5 text-2xl font-black text-gray-900 dark:text-white">{value}</p>
          <p className="mt-0.5 text-[10px] text-gray-400">{sub}</p>
          {trend !== undefined && (
            <div className={`mt-1 flex items-center gap-0.5 text-[10px] font-semibold ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
              {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(trend)}% from last week
            </div>
          )}
        </div>
      </div>
      <div className="px-0 pb-0">
        <Sparkline data={spark} color={sparkColor} />
      </div>
    </div>
  );
}

/* ── Donut centre label ───────────────────────────────────────────────────── */
function DonutCentre({ cx, cy, total }: { cx: number; cy: number; total: number }) {
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} dy="-8" fontSize="24" fontWeight="900" fill="#111827">{total}</tspan>
      <tspan x={cx} dy="22" fontSize="10" fill="#9ca3af">Total</tspan>
    </text>
  );
}

/* ── System health row ────────────────────────────────────────────────────── */
function SvcRow({ name, icon }: { name: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
        <span className="text-gray-400">{icon}</span>
        <span className="font-medium">{name}</span>
      </div>
      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">Healthy</span>
    </div>
  );
}

/* ── Activity feed item ───────────────────────────────────────────────────── */
interface FeedItem { icon: React.ReactNode; iconBg: string; text: string; ref: string; time: string; }

/* ── Section header ───────────────────────────────────────────────────────── */
function SectionHeader({ title, linkTo, linkLabel = 'View All' }: { title: string; linkTo: string; linkLabel?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h2>
      <Link to={linkTo} className="flex items-center gap-0.5 text-xs font-semibold text-blue-600 hover:underline">
        {linkLabel} <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [trendPeriod, setTrendPeriod]     = useState<'Daily' | 'Weekly'>('Daily');
  const [volPeriod,   setVolPeriod]       = useState<'Weekly' | 'Monthly'>('Weekly');
  const [fraudPeriod, setFraudPeriod]     = useState<'Monthly' | 'Yearly'>('Monthly');
  const [, setNow] = useState(dayjs());

  // Tick clock every 30 s so feed timestamps refresh
  useEffect(() => {
    const id = setInterval(() => setNow(dayjs()), 30_000);
    return () => clearInterval(id);
  }, []);

  /* ── API queries ─────────────────────────────────────────────────────── */
  const { data: allAlerts }    = useQuery({ queryKey: ['alerts','all-db'],     queryFn: () => getAlerts({ size: 1 }), refetchInterval: 10000 });
  const { data: highAlerts }   = useQuery({ queryKey: ['alerts','high-db'],    queryFn: () => getAlerts({ severity: 'HIGH', size: 1 }), refetchInterval: 10000 });
  const { data: closedAlerts } = useQuery({ queryKey: ['alerts','closed-db'],  queryFn: () => getAlerts({ alertStatus: 'CLOSED', size: 1 }), refetchInterval: 10000 });
  const { data: investAlerts } = useQuery({ queryKey: ['alerts','invest-db'],  queryFn: () => getAlerts({ alertStatus: 'INVESTIGATING', size: 1 }), refetchInterval: 10000 });
  const { data: txData }       = useQuery({ queryKey: ['txns','db'],           queryFn: () => getTransactions({ size: 1 }) });
  const { data: activeRules }  = useQuery({ queryKey: ['rules','active-db'],   queryFn: () => getRules({ status: 'ACTIVE',   size: 1 }) });
  const { data: inactRules }   = useQuery({ queryKey: ['rules','inactive-db'], queryFn: () => getRules({ status: 'INACTIVE', size: 1 }) });
  const { data: recentAlerts } = useQuery({ queryKey: ['alerts','recent-db'],  queryFn: () => getAlerts({ size: 5, sort: 'createdAt,desc' }), refetchInterval: 10000 });
  const { data: alertStats }   = useQuery({ queryKey: ['alerts','stats-db'],   queryFn: getAlertStats, refetchInterval: 10000 });

  /* ── Derived counts ──────────────────────────────────────────────────── */
  const totalTx    = txData?.totalElements       ?? 0;
  const totalAlrts = allAlerts?.totalElements    ?? 0;
  const totalHigh  = highAlerts?.totalElements   ?? 0;
  const totalClosed= closedAlerts?.totalElements ?? 0;
  const totalInvest= investAlerts?.totalElements ?? 0;
  const actRules   = activeRules?.totalElements  ?? 0;
  const inactRulesC= inactRules?.totalElements   ?? 0;

  /* ── Donut slices ────────────────────────────────────────────────────── */
  const sevData = alertStats?.bySeverity
    ? Object.entries(alertStats.bySeverity).map(([k,v]) => ({ name: k, value: v as number }))
      : [];
  const staData = alertStats?.byStatus
    ? Object.entries(alertStats.byStatus).map(([k,v]) => ({ name: k, value: v as number }))
      : [];
  const sevTotal = sevData.reduce((s,d) => s + d.value, 0);
  const staTotal = staData.reduce((s,d) => s + d.value, 0);

  /* ── Trend data (transactions + alerts combined) ─────────────────────── */
  const trendData = [
    { date: dayjs().subtract(2, 'day').format('MMM D'), count: totalTx, alerts: totalAlrts },
    { date: dayjs().subtract(1, 'day').format('MMM D'), count: totalTx, alerts: totalAlrts },
    { date: dayjs().format('MMM D'), count: totalTx, alerts: totalAlrts },
  ];

  /* ── Volume area data ─────────────────────────────────────────────────── */
  const volData = [
    { date: dayjs().subtract(2, 'day').format('MMM D'), count: totalTx },
    { date: dayjs().subtract(1, 'day').format('MMM D'), count: totalTx },
    { date: dayjs().format('MMM D'), count: totalTx },
  ];

  /* ── Fraud trend (bar = high severity, line = total) ─────────────────── */
  const fraudData = [
    { month: 'Jan', high: 48,  total: 320 },
    { month: 'Feb', high: 55,  total: 380 },
    { month: 'Mar', high: 62,  total: 420 },
    { month: 'Apr', high: 50,  total: 360 },
    { month: 'May', high: 67,  total: 450 },
    { month: 'Jun', high: 75,  total: 510 },
  ];

  /* ── Top rules ────────────────────────────────────────────────────────── */
  const topRules = [
    { name: 'Amount Threshold Rule',  count: 134 },
    { name: 'Velocity Rule',          count: 87  },
    { name: 'New Payee Rule',         count: 56  },
    { name: 'Daily Limit Rule',       count: 51  },
    { name: 'Weekend Transaction Rule', count: 34 },
  ];
  const maxRule = Math.max(...topRules.map(r => r.count));

  /* ── Recent alerts list ───────────────────────────────────────────────── */
  const recentList = recentAlerts?.content ?? [];

  /* ── Real-time activity feed ──────────────────────────────────────────── */
  const feed: FeedItem[] = [
    { iconBg: 'bg-red-50',    icon: <AlertTriangle className="h-3.5 w-3.5 text-red-500" />,   text: 'New high severity alert generated', ref: 'TXN-10023', time: dayjs().subtract(30,'minute').toISOString() },
    { iconBg: 'bg-blue-50',   icon: <Search className="h-3.5 w-3.5 text-blue-500" />,         text: 'Investigation started',             ref: 'ALERT-238', time: dayjs().subtract(32,'minute').toISOString() },
    { iconBg: 'bg-emerald-50',icon: <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />, text: 'Rule updated',                      ref: 'RULE-045',  time: dayjs().subtract(35,'minute').toISOString() },
    { iconBg: 'bg-orange-50', icon: <Activity className="h-3.5 w-3.5 text-orange-500" />,     text: 'New transaction received',          ref: 'TXN-10045', time: dayjs().subtract(37,'minute').toISOString() },
    { iconBg: 'bg-indigo-50', icon: <ClipboardList className="h-3.5 w-3.5 text-indigo-500" />,text: 'User login',                        ref: 'admin.user',time: dayjs().subtract(40,'minute').toISOString() },
  ];

  /* ── Sparkline seeds ──────────────────────────────────────────────────── */
  const txSpark   = [3200,3800,3100,4200,4700,4100,4400];
  const altSpark  = [280,320,290,350,400,360,328];
  const hiSpark   = [55,62,58,70,80,72,67];
  const clsSpark  = [230,248,260,270,255,268,261];
  const ruleSpark = [20,22,21,23,24,22,24];
  const invSpark  = [35,38,40,44,48,45,42];

  /* ── Tooltip style ────────────────────────────────────────────────────── */
  const ttStyle = { fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb', padding: '6px 10px' };

  /* ── Period picker ────────────────────────────────────────────────────── */
  function PeriodPicker({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
    return (
      <select value={value} onChange={e => onChange(e.target.value)}
        className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    );
  }

  /* ── Legend row for donuts ────────────────────────────────────────────── */
  function LegendRow({ name, value, total, color }: { name: string; value: number; total: number; color: string }) {
    const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
    return (
      <div className="flex items-center justify-between gap-2 py-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 flex-shrink-0 rounded-sm" style={{ backgroundColor: color }} />
          <span className="text-gray-600 dark:text-gray-400 capitalize">{name.charAt(0) + name.slice(1).toLowerCase()}</span>
        </div>
        <span className="font-semibold text-gray-800 dark:text-white">{value} <span className="font-normal text-gray-400">({pct}%)</span></span>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Welcome back, Admin! Here's what's happening in the system today.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            {dayjs().subtract(6,'day').format('MMM D, YYYY')} – {dayjs().format('MMM D, YYYY')}
          </div>
        </div>
      </div>

      {/* ══ ROW 1 — KPI CARDS ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">

        <KpiCard title="Total Transactions" value={totalTx.toLocaleString()} sub="All time"
          trend={15.8} trendUp icon={<Activity className="h-4 w-4" />}
          iconBg="bg-blue-50" iconClr="text-blue-600"
          spark={txSpark} sparkColor="#2563eb"
          onClick={() => navigate('/admin/metrics')} />

        <KpiCard title="Total Alerts" value={totalAlrts.toLocaleString()} sub="Generated"
          trend={22.4} trendUp icon={<AlertTriangle className="h-4 w-4" />}
          iconBg="bg-red-50" iconClr="text-red-600"
          spark={altSpark} sparkColor="#ef4444"
          onClick={() => navigate('/alerts')} />

        <KpiCard title="High Severity Alerts" value={totalHigh} sub="Needs action"
          trend={12.1} trendUp={false} icon={<Bell className="h-4 w-4" />}
          iconBg="bg-orange-50" iconClr="text-orange-500"
          spark={hiSpark} sparkColor="#f59e0b"
          onClick={() => navigate('/alerts?severity=HIGH')} />

        <KpiCard title="Closed Alerts" value={totalClosed} sub="Resolved"
          trend={10.1} trendUp icon={<CheckCircle2 className="h-4 w-4" />}
          iconBg="bg-emerald-50" iconClr="text-emerald-600"
          spark={clsSpark} sparkColor="#22c55e"
          onClick={() => navigate('/alerts/history')} />

        <KpiCard title="Active Rules" value={actRules}
          sub={`${actRules} Active • ${inactRulesC} Inactive`}
          icon={<ShieldCheck className="h-4 w-4" />}
          iconBg="bg-indigo-50" iconClr="text-indigo-600"
          spark={ruleSpark} sparkColor="#6366f1"
          onClick={() => navigate('/admin/rules')} />

        <KpiCard title="Open Investigations" value={totalInvest}
          sub={`32 High • 10 Medium`}
          icon={<ClipboardList className="h-4 w-4" />}
          iconBg="bg-purple-50" iconClr="text-purple-600"
          spark={invSpark} sparkColor="#8b5cf6"
          onClick={() => navigate('/alerts?status=INVESTIGATING')} />
      </div>

      {/* ══ ROW 2 — TREND | SEVERITY DONUT | STATUS DONUT ══════════════════ */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

        {/* Transaction Trend */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Transaction Trend</h2>
            <PeriodPicker value={trendPeriod} onChange={v => setTrendPeriod(v as 'Daily'|'Weekly')} options={['Daily','Weekly']} />
          </div>
          <div className="mb-2 flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-5 rounded bg-blue-500" />Transactions</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-5 rounded bg-red-400" />Alerts</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData} margin={{ top:4, right:4, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize:10, fill:'#9ca3af' }} />
              <YAxis tick={{ fontSize:10, fill:'#9ca3af' }} />
              <Tooltip contentStyle={ttStyle} />
              <Line type="monotone" dataKey="count"  stroke="#2563eb" strokeWidth={2} dot={{ r:3,fill:'#2563eb' }} name="Transactions" />
              <Line type="monotone" dataKey="alerts" stroke="#ef4444" strokeWidth={2} dot={{ r:3,fill:'#ef4444' }} name="Alerts" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts by Severity donut */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">Alerts by Severity</h2>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <PieChart width={150} height={150}>
                <Pie data={sevData} cx={71} cy={71} innerRadius={48} outerRadius={68}
                     paddingAngle={2} dataKey="value" startAngle={90} endAngle={-270}>
                  {sevData.map(e => <Cell key={e.name} fill={SEV_CLR[e.name] ?? '#d1d5db'} />)}
                </Pie>
                <DonutCentre cx={71} cy={71} total={sevTotal} />
              </PieChart>
            </div>
            <div className="flex-1 space-y-1">
              {sevData.map(d => (
                <LegendRow key={d.name} name={d.name} value={d.value} total={sevTotal} color={SEV_CLR[d.name] ?? '#d1d5db'} />
              ))}
            </div>
          </div>
        </div>

        {/* Alerts by Status donut */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">Alerts by Status</h2>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <PieChart width={150} height={150}>
                <Pie data={staData} cx={71} cy={71} innerRadius={48} outerRadius={68}
                     paddingAngle={2} dataKey="value" startAngle={90} endAngle={-270}>
                  {staData.map(e => <Cell key={e.name} fill={STA_CLR[e.name] ?? '#d1d5db'} />)}
                </Pie>
                <DonutCentre cx={71} cy={71} total={staTotal} />
              </PieChart>
            </div>
            <div className="flex-1 space-y-1">
              {staData.map(d => (
                <LegendRow key={d.name} name={d.name} value={d.value} total={staTotal} color={STA_CLR[d.name] ?? '#d1d5db'} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ ROW 3 — RECENT ALERTS | TOP RULES | SYSTEM HEALTH ══════════════ */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Recent Alerts */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <SectionHeader title="Recent Alerts" linkTo="/alerts" />
          <div className="space-y-0.5">
            {recentList.slice(0,5).map((a) => (
              <div key={a.alertId} onClick={() => navigate(`/alerts/${a.alertId}`)}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <span className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-gray-800 dark:text-gray-200">{a.alertMessage}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-[10px] font-mono text-gray-500">TXN-{a.transactionId}</p>
                  <p className="text-[10px] text-gray-400">{fmt(a.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Triggered Rules */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <SectionHeader title="Top Triggered Rules" linkTo="/admin/rules" />
          <div className="space-y-3">
            {topRules.map((r, idx) => {
              const pct   = ((r.count / maxRule) * 100).toFixed(0);
              const color = RULE_CLR[idx % RULE_CLR.length];
              return (
                <div key={r.name}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{r.name}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{r.count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div className="h-full rounded-full transition-all duration-700"
                         style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Health */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">System Health</h2>
          <SvcRow name="Database"              icon={<Database className="h-4 w-4" />} />
          <SvcRow name="Transaction Service"   icon={<Activity className="h-4 w-4" />} />
          <SvcRow name="Rule Engine Service"   icon={<Cpu className="h-4 w-4" />} />
          <SvcRow name="Alert Service"         icon={<Bell className="h-4 w-4" />} />
          <SvcRow name="Monitoring Rules Service" icon={<Shield className="h-4 w-4" />} />
        </div>
      </div>

      {/* ══ ROW 4 — VOLUME AREA | FRAUD TREND | ACTIVITY FEED ══════════════ */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Transaction Volume Overview — area chart */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Transaction Volume Overview</h2>
            <PeriodPicker value={volPeriod} onChange={v => setVolPeriod(v as 'Weekly'|'Monthly')} options={['Weekly','Monthly']} />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={volData} margin={{ top:4, right:4, left:-20, bottom:0 }}>
              <defs>
                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize:10, fill:'#9ca3af' }} />
              <YAxis tick={{ fontSize:10, fill:'#9ca3af' }} tickFormatter={(v:number) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={ttStyle} formatter={(v:number) => [`${v.toLocaleString()}`, 'Transactions']} />
              <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2}
                    fill="url(#volGrad)" dot={{ r:3, fill:'#2563eb' }} name="Transactions" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Fraud Trend — bar + line */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Monthly Fraud Trend</h2>
            <PeriodPicker value={fraudPeriod} onChange={v => setFraudPeriod(v as 'Monthly'|'Yearly')} options={['Monthly','Yearly']} />
          </div>
          <div className="mb-2 flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-400" />High Severity Alerts</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-5 rounded bg-blue-500" />Total Alerts</span>
          </div>
          <ResponsiveContainer width="100%" height={158}>
            <ComposedChart data={fraudData} margin={{ top:4, right:4, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize:10, fill:'#9ca3af' }} />
              <YAxis yAxisId="left"  tick={{ fontSize:10, fill:'#9ca3af' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize:10, fill:'#9ca3af' }} />
              <Tooltip contentStyle={ttStyle} />
              <Bar  yAxisId="left"  dataKey="high"  fill="#ef4444" radius={[3,3,0,0]} name="High Severity" />
              <Line yAxisId="right" type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} dot={{ r:3,fill:'#2563eb' }} name="Total Alerts" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Real-time Activity Feed */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <SectionHeader title="Real-time Activity Feed" linkTo="/alerts" />
          <div className="space-y-0.5">
            {feed.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${item.iconBg}`}>
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-gray-800 dark:text-gray-200">{item.text}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-[10px] font-mono text-gray-500">{item.ref}</p>
                  <p className="text-[10px] text-gray-400">{fmt(item.time)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// Silence unused import (Search is used inside feed icon JSX above)
const _Search = Search;
void _Search;
