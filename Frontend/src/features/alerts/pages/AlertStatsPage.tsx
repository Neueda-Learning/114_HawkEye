import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getAlertStats } from '@/lib/api/alerts';
import { MetricCard } from '@/components/common/MetricCard';
import { SkeletonCard } from '@/components/common/SkeletonLoader';
import { Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  OPEN:          '#ef4444',
  ACKNOWLEDGED:  '#f59e0b',
  INVESTIGATING: '#3b82f6',
  CLOSED:        '#22c55e',
  DISMISSED:     '#9ca3af',
};

const SEVERITY_COLORS: Record<string, string> = {
  LOW:      '#64748b',
  MEDIUM:   '#f97316',
  HIGH:     '#ef4444',
  CRITICAL: '#7c3aed',
};

export default function AlertStatsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['alert-stats'],
    queryFn:  getAlertStats,
  });

  const statusPieData  = data ? Object.entries(data.byStatus).map(([name, value]) => ({ name, value })) : [];
  const severityData   = data ? Object.entries(data.bySeverity).map(([name, value]) => ({ name, value })) : [];
  const trendData      = data?.dailyTrend ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alert Statistics</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <MetricCard title="Open Alerts"     value={data?.byStatus['OPEN'] ?? 0}     icon={<AlertTriangle className="h-5 w-5" />} color="red"    />
            <MetricCard title="Acknowledged"    value={data?.byStatus['ACKNOWLEDGED'] ?? 0} icon={<Clock className="h-5 w-5" />}         color="yellow" />
            <MetricCard title="Closed"          value={data?.byStatus['CLOSED'] ?? 0}   icon={<CheckCircle2 className="h-5 w-5" />}  color="green"  />
            <MetricCard title="Avg Resolution"  value={`${data?.avgResolutionTimeMinutes ?? 0}m`} icon={<XCircle className="h-5 w-5" />} color="blue" subtitle="minutes" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Alerts by Status (Pie) */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Alerts by Status</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusPieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {statusPieData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#ccc'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Table */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Status Breakdown</h2>
          <div className="space-y-3">
            {statusPieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="h-4 w-4 rounded-full" style={{ backgroundColor: STATUS_COLORS[item.name] }} />
                  <span className="font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{item.value}</span>
              </div>
            ))}
            {data && (
              <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="text-gray-700 dark:text-gray-300">Total</span>
                  <span className="text-lg text-gray-900 dark:text-white">{data.total}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

