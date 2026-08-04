import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, FunnelChart, Funnel,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Activity, AlertTriangle, ShieldCheck, TrendingUp } from 'lucide-react';
import { getAlerts } from '@/lib/api/alerts';
import { getTransactions } from '@/lib/api/transactions';
import { getRules } from '@/lib/api/rules';
import { MetricCard } from '@/components/common/MetricCard';
import { SkeletonCard } from '@/components/common/SkeletonLoader';
import { mockDashboardStats } from '@/mocks/data';
import { formatCurrency } from '@/lib/utils';

const FUNNEL_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e'];

export default function AdminDashboard() {
  const { data: alertsData,  isLoading: alertsLoading  } = useQuery({ queryKey: ['alerts', 'dashboard'], queryFn: () => getAlerts({ size: 1 }) });
  const { data: openAlerts,  isLoading: openLoading    } = useQuery({ queryKey: ['alerts', 'open'],      queryFn: () => getAlerts({ alertStatus: 'OPEN', size: 1 }) });
  const { data: critAlerts,  isLoading: critLoading    } = useQuery({ queryKey: ['alerts', 'critical'],  queryFn: () => getAlerts({ severity: 'CRITICAL', size: 1 }) });
  const { data: rulesData,   isLoading: rulesLoading   } = useQuery({ queryKey: ['rules', 'active'],     queryFn: () => getRules({ status: 'ACTIVE', size: 1 }) });
  const { data: txData,      isLoading: txLoading      } = useQuery({ queryKey: ['transactions', 'all'], queryFn: () => getTransactions({ size: 1 }) });

  const stats = mockDashboardStats;
  const isLoading = alertsLoading || openLoading || critLoading || rulesLoading || txLoading;

  const funnelData = [
    { name: 'Open',          value: openAlerts?.totalElements  ?? stats.openAlerts,    fill: '#ef4444' },
    { name: 'Acknowledged',  value: Math.floor((openAlerts?.totalElements ?? 2) * 1.5), fill: '#f59e0b' },
    { name: 'Investigating', value: 1, fill: '#3b82f6' },
    { name: 'Closed',        value: alertsData?.totalElements ?? 5, fill: '#22c55e' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Real-time transaction monitoring overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />) : (
          <>
            <MetricCard title="Total Transactions"  value={txData?.totalElements ?? stats.totalTransactionsWeek}      subtitle="All time"     icon={<Activity className="h-5 w-5" />}     color="blue"   trend={12} />
            <MetricCard title="Open Alerts"         value={openAlerts?.totalElements ?? stats.openAlerts}             subtitle="Need action"  icon={<AlertTriangle className="h-5 w-5" />} color="red"    trend={-5} />
            <MetricCard title="Critical Alerts"     value={critAlerts?.totalElements ?? stats.criticalAlerts}         subtitle="High priority" icon={<AlertTriangle className="h-5 w-5" />} color="purple" />
            <MetricCard title="Active Rules"        value={rulesData?.totalElements  ?? stats.activeRules}            subtitle="Monitoring"   icon={<ShieldCheck className="h-5 w-5" />}   color="green"  />
          </>
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Transaction Volume Trend */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">Transaction Volume (7 days)</h2>
          <p className="mb-4 text-xs text-gray-400">Count and total amount</p>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={stats.transactionVolumeTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(val: number, name: string) => name === 'amount' ? formatCurrency(val) : val} />
              <Line yAxisId="left"  type="monotone" dataKey="count"  stroke="#1a4fff" strokeWidth={2} dot={{ r: 3 }} name="Transactions" />
              <Line yAxisId="right" type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="amount" strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Alert Trend */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">Alert Trend (7 days)</h2>
          <p className="mb-4 text-xs text-gray-400">Alerts triggered per day</p>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={stats.alertTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} name="Alerts" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Triggered Rules */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Top Triggered Rules</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.topTriggeredRules} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="ruleName" tick={{ fontSize: 10 }} width={140} />
              <Tooltip />
              <Bar dataKey="count" fill="#1a4fff" radius={[0, 4, 4, 0]} name="Triggers">
                {stats.topTriggeredRules.map((_, i) => (
                  <Cell key={i} fill={['#1a4fff', '#3b82f6', '#60a5fa', '#93c5fd'][i % 4]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Alert Lifecycle Funnel */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Alert Lifecycle Funnel</h2>
          <div className="space-y-3">
            {funnelData.map((item, idx) => (
              <div key={item.name}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-gray-600 dark:text-gray-400">{item.name}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{item.value}</span>
                </div>
                <div className="h-6 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-full rounded-md transition-all"
                    style={{
                      width:           `${Math.max(10, (item.value / (funnelData[0].value || 1)) * 100)}%`,
                      backgroundColor: FUNNEL_COLORS[idx],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick stats footer */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Transactions Today', value: stats.totalTransactionsToday },
          { label: 'Transactions This Week', value: stats.totalTransactionsWeek },
          { label: 'Rules Monitoring', value: stats.activeRules },
          { label: 'Avg Alert Age', value: '42m' },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-900">
            <p className="text-2xl font-bold text-hawk-600 dark:text-hawk-400">{value}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

