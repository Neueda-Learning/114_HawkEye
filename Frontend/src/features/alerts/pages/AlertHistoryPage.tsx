import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { History } from 'lucide-react';
import { getAlertHistory } from '@/lib/api/alerts';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import { Pagination } from '@/components/common/Pagination';
import { SkeletonTable } from '@/components/common/SkeletonLoader';
import { formatDate } from '@/lib/utils';

export default function AlertHistoryPage() {
  const navigate    = useNavigate();
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['alerts-history', page],
    queryFn:  () => getAlertHistory({ page, size: 15, sort: 'closedAt,desc' }),
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <History className="h-6 w-6 text-hawk-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alert History</h1>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">All closed and dismissed alerts.</p>

      {isLoading ? <SkeletonTable rows={10} cols={6} /> : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {['ID', 'Status', 'Severity', 'Rule', 'Account', 'Closed At', 'Resolution'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {(data?.content ?? []).length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">No history records found</td></tr>
                ) : (data?.content ?? []).map((alert) => (
                  <tr
                    key={alert.alertId}
                    onClick={() => navigate(`/alerts/${alert.alertId}`)}
                    className="cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">#{alert.alertId}</td>
                    <td className="px-4 py-3"><StatusBadge status={alert.alertStatus} /></td>
                    <td className="px-4 py-3"><SeverityBadge severity={alert.severity} /></td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{alert.ruleName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{alert.accountId}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{alert.closedAt ? formatDate(alert.closedAt) : '—'}</td>
                    <td className="px-4 py-3 max-w-[180px] truncate text-xs text-gray-400">{alert.resolutionNotes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} size={data.size} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}

