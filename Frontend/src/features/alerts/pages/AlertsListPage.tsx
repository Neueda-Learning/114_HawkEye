import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { getAlerts } from '@/lib/api/alerts';
import { DataTable, type Column } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import { formatDate, ruleTypeLabel } from '@/lib/utils';
import type { Alert, AlertStatus, Severity, RuleType } from '@/lib/types';

const STATUSES: AlertStatus[] = ['OPEN', 'ACKNOWLEDGED', 'INVESTIGATING', 'CLOSED', 'DISMISSED'];
const SEVERITIES: Severity[]  = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const RULE_TYPES: RuleType[]  = ['AMOUNT_THRESHOLD', 'VELOCITY', 'NEW_PAYEE', 'DAILY_LIMIT'];

export default function AlertsListPage() {
  const navigate = useNavigate();
  const [page, setPage]         = useState(0);
  const [status, setStatus]     = useState('');
  const [severity, setSeverity] = useState('');
  const [ruleType, setRuleType] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['alerts', page, status, severity, ruleType],
    queryFn:  () => getAlerts({
      page, size: 10, sort: 'createdAt,desc',
      alertStatus: (status as AlertStatus) || undefined,
      severity:    (severity as Severity) || undefined,
      ruleType:    (ruleType as RuleType) || undefined,
    }),
  });

  const columns: Column<Alert>[] = [
    {
      key: 'alertId', header: 'ID', sortable: true,
      render: (row) => <span className="font-mono text-xs text-gray-500">#{row.alertId}</span>,
    },
    {
      key: 'alertStatus', header: 'Status',
      render: (row) => <StatusBadge status={row.alertStatus} />,
    },
    {
      key: 'severity', header: 'Severity',
      render: (row) => <SeverityBadge severity={row.severity} />,
    },
    {
      key: 'ruleName', header: 'Rule', sortable: true,
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{row.ruleName}</p>
          <p className="text-xs text-gray-400">{ruleTypeLabel[row.ruleType]}</p>
        </div>
      ),
    },
    {
      key: 'accountId', header: 'Account',
      render: (row) => (
        <div>
          <p className="font-mono text-xs text-gray-600 dark:text-gray-400">{row.accountId}</p>
          <p className="text-xs text-gray-400">{row.accountName}</p>
        </div>
      ),
    },
    {
      key: 'alertMessage', header: 'Message',
      render: (row) => <span className="max-w-[240px] truncate text-xs text-gray-500 dark:text-gray-400">{row.alertMessage}</span>,
    },
    {
      key: 'createdAt', header: 'Created', sortable: true,
      render: (row) => <span className="text-xs text-gray-400">{formatDate(row.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alert Management</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search alerts…"
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-hawk-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={severity} onChange={(e) => { setSeverity(e.target.value); setPage(0); }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white">
          <option value="">All Severities</option>
          {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={ruleType} onChange={(e) => { setRuleType(e.target.value); setPage(0); }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white">
          <option value="">All Rule Types</option>
          {RULE_TYPES.map((t) => <option key={t} value={t}>{ruleTypeLabel[t]}</option>)}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        keyExtractor={(r) => r.alertId}
        onRowClick={(r) => navigate(`/alerts/${r.alertId}`)}
        isLoading={isLoading}
        emptyMessage="No alerts found"
      />

      {data && <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} size={data.size} onPageChange={setPage} />}
    </div>
  );
}

