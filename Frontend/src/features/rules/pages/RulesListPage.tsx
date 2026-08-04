import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ToggleLeft, ToggleRight, Pencil, Trash2, Eye } from 'lucide-react';
import { getRules, deleteRule, toggleRule } from '@/lib/api/rules';
import { DataTable, type Column } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { toast } from '@/components/common/Toast';
import { formatDate, ruleStatusColor, ruleTypeLabel } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { Rule, RuleType, RuleStatus, Severity } from '@/lib/types';

const RULE_TYPES: RuleType[] = ['AMOUNT_THRESHOLD', 'VELOCITY', 'NEW_PAYEE', 'DAILY_LIMIT'];
const STATUSES: RuleStatus[]  = ['ACTIVE', 'INACTIVE'];
const SEVERITIES: Severity[]  = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function RulesListPage() {
  const navigate      = useNavigate();
  const queryClient   = useQueryClient();
  const { user }      = useAuthStore();

  const [page, setPage]         = useState(0);
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('');
  const [ruleType, setRuleType] = useState('');
  const [severity, setSeverity] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Rule | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['rules', page, search, status, ruleType, severity],
    queryFn:  () => getRules({ page, size: 10, search, status: status as RuleStatus || undefined, ruleType: ruleType as RuleType || undefined, severity: severity as Severity || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRule(id, user?.email ?? 'admin', 'Deleted from rules list'),
    onSuccess: () => {
      toast.success('Rule deleted');
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
    onError: () => toast.error('Failed to delete rule'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      toggleRule(id, { active, performedBy: user?.email ?? 'admin', reason: 'Toggled from rules list' }),
    onSuccess: (updated) => {
      toast.success(`Rule ${updated.status === 'ACTIVE' ? 'activated' : 'deactivated'}`);
      void queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
    onError: () => toast.error('Failed to toggle rule'),
  });

  const columns: Column<Rule>[] = [
    {
      key: 'ruleName', header: 'Rule Name', sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{row.ruleName}</p>
          {row.description && <p className="text-xs text-gray-400 truncate max-w-[200px]">{row.description}</p>}
        </div>
      ),
    },
    {
      key: 'ruleType', header: 'Type',
      render: (row) => <span className="text-xs font-mono text-gray-600 dark:text-gray-400">{ruleTypeLabel[row.ruleType]}</span>,
    },
    { key: 'severity', header: 'Severity', render: (row) => <SeverityBadge severity={row.severity} /> },
    {
      key: 'status', header: 'Status',
      render: (row) => (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${ruleStatusColor[row.status]}`}>
          {row.status}
        </span>
      ),
    },
    { key: 'updatedAt', header: 'Last Updated', sortable: true, render: (row) => <span className="text-xs text-gray-400">{formatDate(row.updatedAt)}</span> },
    {
      key: 'actions', header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => navigate(`/admin/rules/${row.ruleId}`)} title="View" className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800">
            <Eye className="h-4 w-4" />
          </button>
          <button onClick={() => navigate(`/admin/rules/${row.ruleId}/edit`)} title="Edit" className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-800">
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => toggleMutation.mutate({ id: row.ruleId, active: row.status !== 'ACTIVE' })}
            title={row.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-yellow-600 dark:hover:bg-gray-800"
          >
            {row.status === 'ACTIVE' ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4" />}
          </button>
          <button onClick={() => setDeleteTarget(row)} title="Delete" className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-800">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rule Management</h1>
        <button
          onClick={() => navigate('/admin/rules/new')}
          className="flex items-center gap-2 rounded-xl bg-hawk-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-hawk-700"
        >
          <Plus className="h-4 w-4" /> Create Rule
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search rules…"
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-hawk-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
        </div>
        <select value={ruleType} onChange={(e) => { setRuleType(e.target.value); setPage(0); }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white">
          <option value="">All Types</option>
          {RULE_TYPES.map((t) => <option key={t} value={t}>{ruleTypeLabel[t]}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={severity} onChange={(e) => { setSeverity(e.target.value); setPage(0); }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white">
          <option value="">All Severities</option>
          {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        keyExtractor={(r) => r.ruleId}
        onRowClick={(r) => navigate(`/admin/rules/${r.ruleId}`)}
        isLoading={isLoading}
        emptyMessage="No rules found"
      />

      {data && <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} size={data.size} onPageChange={setPage} />}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Rule"
        message={`Are you sure you want to delete "${deleteTarget?.ruleName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.ruleId)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

