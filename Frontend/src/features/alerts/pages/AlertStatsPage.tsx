import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getAlertStats } from '@/lib/api/alerts';
import { MetricCard } from '@/components/common/MetricCard';
import { SkeletonCard } from '@/components/common/SkeletonLoader';
import { Clock, AlertTriangle, CheckCircle2, Search } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  OPEN:          '#ef4444',
  ACKNOWLEDGED:  '#f59e0b',
  INVESTIGATING: '#8b5cf6',
  CLOSED:        '#22c55e',
  DISMISSED:     '#9ca3af',
};

const SEV_COLORS: Record<string, string> = {
  LOW:      '#22c55e',
  MEDIUM:   '#f59e0b',
  HIGH:     '#ef4444',
  CRITICAL: '#8b5cf6',
};

export default function AlertStatsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['alert-stats'],
    queryFn:  getAlertStats,
  });

  // Build pie data from flat status fields returned by backend
  const statusPieData = data
    ? [
        { name: 'Open',          key: 'OPEN',          value: data.open },
        { name: 'Acknowledged',  key: 'ACKNOWLEDGED',  value: data.acknowledged },
        { name: 'Investigating', key: 'INVESTIGATING',  value: data.investigating },
        { name: 'Closed',        key: 'CLOSED',         value: data.closed },
        { name: 'Dismissed',     key: 'DISMISSED',      value: data.dismissed },
      ].filter(d => d.value > 0)
    : [];

  // Build severity pie data from bySeverity map
  const severityPieData = data?.bySeverity
    ? Object.entries(data.bySeverity)
        .map(([name, value]) => ({ name, value }))
        .filter(d => d.value > 0)
    : [];

  const totalCount = data?.total ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alert Statistics</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <MetricCard title="Open Alerts"   value={data?.open ?? 0}          icon={<AlertTriangle className="h-5 w-5" />} color="red"    />
            <MetricCard title="Acknowledged"  value={data?.acknowledged ?? 0}  icon={<Clock className="h-5 w-5" />}         color="yellow" />
            <MetricCard title="Investigating" value={data?.investigating ?? 0} icon={<Search className="h-5 w-5" />}        color="purple" />
            <MetricCard title="Closed"        value={data?.closed ?? 0}        icon={<CheckCircle2 className="h-5 w-5" />}  color="green"  />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Alerts by Status Pie */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Alerts by Status</h2>
          {statusPieData.length === 0 ? (
            <div className="flex h-[280px] items-center justify-center text-sm text-gray-400">No alert data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%" cy="45%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine
                >
                  {statusPieData.map((entry) => (
                    <Cell key={entry.key} fill={STATUS_COLORS[entry.key] ?? '#ccc'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} alerts`, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Alerts by Severity Pie */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Alerts by Severity</h2>
          {severityPieData.length === 0 ? (
            <div className="flex h-[280px] items-center justify-center text-sm text-gray-400">No severity data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={severityPieData}
                  cx="50%" cy="45%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine
                >
                  {severityPieData.map((entry) => (
                    <Cell key={entry.name} fill={SEV_COLORS[entry.name] ?? '#ccc'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} alerts`, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Status Breakdown Table */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Status Breakdown</h2>
        <div className="space-y-3">
          {statusPieData.map((item) => (
            <div key={item.key} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full" style={{ backgroundColor: STATUS_COLORS[item.key] }} />
                <span className="font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">{item.value}</span>
            </div>
          ))}
          {data && (
            <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-gray-700 dark:text-gray-300">Total</span>
                <span className="text-lg text-gray-900 dark:text-white">{totalCount}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
