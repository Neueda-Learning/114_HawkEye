import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getAlerts } from '@/lib/api/alerts';
import { getTransactions } from '@/lib/api/transactions';
import { MetricCard } from '@/components/common/MetricCard';
import { SkeletonCard } from '@/components/common/SkeletonLoader';
import { mockDashboardStats } from '@/mocks/data';
import { formatCurrency } from '@/lib/utils';
import type { TransactionStatus, AlertStatus } from '@/lib/types';

const TX_STATUS_COLORS: Record<TransactionStatus, string> = {
  COMPLETED: '#22c55e', PENDING: '#f59e0b', FAILED: '#ef4444', REVERSED: '#9ca3af',
};

export default function AdminMetrics() {
  const [txStatus, setTxStatus] = useState<TransactionStatus | ''>('');

  const { data: txData,    isLoading: txLoading    } = useQuery({ queryKey: ['transactions', 'metrics', txStatus], queryFn: () => getTransactions({ status: txStatus as TransactionStatus || undefined, size: 5 }) });
  const { data: alertData, isLoading: alertLoading } = useQuery({ queryKey: ['alerts', 'metrics'],                 queryFn: () => getAlerts({ size: 5 }) });

  const stats = mockDashboardStats;

  const txStatusBreakdown: { name: TransactionStatus; value: number }[] = [
    { name: 'COMPLETED', value: 38 },
    { name: 'PENDING',   value: 5  },
    { name: 'FAILED',    value: 3  },
    { name: 'REVERSED',  value: 1  },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Metrics & Analytics</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Detailed system analytics with drill-down filters</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {txLoading || alertLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <MetricCard title="Total Transactions" value={txData?.totalElements ?? 0}    subtitle="All time"     color="blue"   trend={8}  />
            <MetricCard title="Total Alerts"       value={alertData?.totalElements ?? 0} subtitle="Generated"   color="red"    trend={-3} />
            <MetricCard title="Avg Daily Volume"   value={formatCurrency(214000)}         subtitle="Last 7 days" color="green"             />
            <MetricCard title="Rule Hit Rate"      value="34%"                            subtitle="Transactions triggering alerts" color="purple" />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <p className="self-center text-sm font-medium text-gray-600 dark:text-gray-400">Filter:</p>
        <select value={txStatus} onChange={(e) => setTxStatus(e.target.value as TransactionStatus)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white">
          <option value="">All Transaction Statuses</option>
          {(['COMPLETED', 'PENDING', 'FAILED', 'REVERSED'] as TransactionStatus[]).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Transaction amount trend */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Daily Transaction Amount</h2>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={stats.transactionVolumeTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(val: number) => formatCurrency(val)} />
              <Line type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Amount" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Transaction by status */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Transactions by Status</h2>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={txStatusBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Count">
                {txStatusBreakdown.map((entry) => (
                  <Cell key={entry.name} fill={TX_STATUS_COLORS[entry.name]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Alert trend */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Alert Volume Over Time</h2>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={stats.alertTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Alerts" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top rules table */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Top Triggered Rules</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="pb-2 text-left text-xs font-semibold uppercase text-gray-400">Rule</th>
                <th className="pb-2 text-right text-xs font-semibold uppercase text-gray-400">Triggers</th>
                <th className="pb-2 text-right text-xs font-semibold uppercase text-gray-400">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {stats.topTriggeredRules.map((rule) => {
                const total = stats.topTriggeredRules.reduce((s, r) => s + r.count, 0);
                const pct   = ((rule.count / total) * 100).toFixed(0);
                return (
                  <tr key={rule.ruleName}>
                    <td className="py-2 text-gray-700 dark:text-gray-300">{rule.ruleName}</td>
                    <td className="py-2 text-right font-semibold text-gray-900 dark:text-white">{rule.count}</td>
                    <td className="py-2 text-right text-gray-400">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

