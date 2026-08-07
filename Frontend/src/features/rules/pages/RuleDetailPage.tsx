import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil, History, ToggleLeft, ToggleRight } from 'lucide-react';
import { getRuleById, toggleRule } from '@/lib/api/rules';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import { JsonViewer } from '@/components/common/JsonViewer';
import { PageSkeleton } from '@/components/common/SkeletonLoader';
import { toast } from '@/components/common/Toast';
import { formatDate, ruleStatusColor, ruleTypeLabel } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/store/authStore';

export default function RuleDetailPage() {
  const { id }      = useParams<{ id: string }>();
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const { user }    = useAuthStore();

  const { data: rule, isLoading } = useQuery({
    queryKey: ['rule', id],
    queryFn:  () => getRuleById(Number(id)),
    enabled:  !!id,
  });

  const toggleMutation = useMutation({
    mutationFn: (active: boolean) =>
      toggleRule(Number(id), { active, performedBy: user?.email ?? 'admin', reason: 'Toggled from detail page' }),
    onSuccess: (_updated, active) => {
      toast.success(`Rule ${active ? 'activated' : 'deactivated'}`);
      void queryClient.invalidateQueries({ queryKey: ['rule', id] });
      void queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
    onError: () => toast.error('Toggle failed'),
  });

  if (isLoading) return <PageSkeleton />;
  if (!rule) return <div className="py-20 text-center text-gray-400">Rule not found</div>;

  const isActive = rule.status === 'ACTIVE';

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <ArrowLeft className="h-4 w-4" /> Back to Rules
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{rule.ruleName}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{rule.description ?? 'No description'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleMutation.mutate(!isActive)}
            disabled={toggleMutation.isPending || rule.status === 'DELETED'}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${isActive ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'} disabled:opacity-50`}
          >
            {isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
            {isActive ? 'Deactivate' : 'Activate'}
          </button>
          <Link to={`/admin/rules/${id}/edit`}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">
            <Pencil className="h-4 w-4" /> Edit
          </Link>
          <Link to={`/admin/rules/${id}/audit-trail`}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">
            <History className="h-4 w-4" /> Audit Trail
          </Link>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Type',      value: ruleTypeLabel[rule.ruleType] },
          { label: 'Severity',  value: <SeverityBadge severity={rule.severity} /> },
          { label: 'Status',    value: <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ruleStatusColor[rule.status]}`}>{rule.status}</span> },
          { label: 'Updated',   value: formatDate(rule.updatedAt) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
            <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{value}</div>
          </div>
        ))}
      </div>

      {/* Parameters */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Rule Parameters</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Object.entries(rule.parameters).map(([key, val]) => (
            <div key={key} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-xs font-medium text-gray-400">{key}</p>
              <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">{String(val)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <JsonViewer data={rule.parameters} title="Raw Parameters JSON" />
        </div>
      </div>

      {/* Metadata */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Metadata</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-xs text-gray-400">Rule ID</dt><dd className="font-mono font-semibold text-gray-900 dark:text-white">#{rule.ruleId}</dd></div>
          <div><dt className="text-xs text-gray-400">Created</dt><dd className="text-gray-700 dark:text-gray-300">{formatDate(rule.createdAt)}</dd></div>
          <div><dt className="text-xs text-gray-400">Last Updated</dt><dd className="text-gray-700 dark:text-gray-300">{formatDate(rule.updatedAt)}</dd></div>
        </dl>
      </div>
    </div>
  );
}

