import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, History } from 'lucide-react';
import { getRuleAuditTrail } from '@/lib/api/rules';
import { JsonViewer } from '@/components/common/JsonViewer';
import { Pagination } from '@/components/common/Pagination';
import { PageSkeleton } from '@/components/common/SkeletonLoader';
import { formatDate } from '@/lib/utils';
import type { RuleAuditEntry } from '@/lib/types';

const ACTION_COLOR: Record<RuleAuditEntry['action'], string> = {
  CREATE:     'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  UPDATE:     'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  DELETE:     'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  ACTIVATE:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  DEACTIVATE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

export default function RuleAuditTrailPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['rule-audit', id, page],
    queryFn:  () => getRuleAuditTrail(Number(id)),
    enabled:  !!id,
  });

  if (isLoading) return <PageSkeleton />;

  const entries = data?.content ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <ArrowLeft className="h-4 w-4" /> Back to Rule
      </button>

      <div className="flex items-center gap-3">
        <History className="h-6 w-6 text-hawk-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Trail — Rule #{id}</h1>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-400 dark:border-gray-700 dark:bg-gray-900">
          No audit records found for this rule.
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.auditId} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
              {/* Header row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ACTION_COLOR[entry.action]}`}>
                    {entry.action}
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    by <strong>{entry.changedBy}</strong>
                  </span>
                </div>
                <time className="text-xs text-gray-400">{formatDate(entry.changedAt)}</time>
              </div>

              {/* Reason */}
              {entry.changeReason && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-600 dark:text-gray-300">Reason:</span> {entry.changeReason}
                </p>
              )}

              {/* Config diff */}
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {entry.previousConfig && (
                  <JsonViewer data={entry.previousConfig} title="Previous Config" />
                )}
                {entry.newConfig && (
                  <JsonViewer data={entry.newConfig} title="New Config" defaultExpanded />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {data && (
        <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} size={data.size} onPageChange={setPage} />
      )}
    </div>
  );
}

