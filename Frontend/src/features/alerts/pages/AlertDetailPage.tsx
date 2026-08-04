import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Bell } from 'lucide-react';
import { getAlertById, getAlertAuditTrail, getAlertTransactions } from '@/lib/api/alerts';
import { AlertActionPanel } from '../components/AlertActionPanel';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import { Timeline, type TimelineEvent } from '@/components/common/Timeline';
import { JsonViewer } from '@/components/common/JsonViewer';
import { PageSkeleton } from '@/components/common/SkeletonLoader';
import { formatDate, formatCurrency, ruleTypeLabel } from '@/lib/utils';
import type { AlertStatus } from '@/lib/types';

type Tab = 'overview' | 'transactions' | 'rule' | 'activity';

const STATUS_TO_COLOR: Record<AlertStatus, TimelineEvent['color']> = {
  OPEN: 'red', ACKNOWLEDGED: 'yellow', INVESTIGATING: 'blue', CLOSED: 'green', DISMISSED: 'gray',
};

export default function AlertDetailPage() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');

  const { data: alert, isLoading, refetch } = useQuery({
    queryKey: ['alert', id],
    queryFn:  () => getAlertById(Number(id)),
    enabled:  !!id,
  });

  const { data: auditTrail } = useQuery({
    queryKey: ['alert-audit', id],
    queryFn:  () => getAlertAuditTrail(Number(id)),
    enabled:  !!id && tab === 'activity',
  });

  const { data: txData } = useQuery({
    queryKey: ['alert-transactions', id],
    queryFn:  () => getAlertTransactions(Number(id)),
    enabled:  !!id && tab === 'transactions',
  });

  if (isLoading) return <PageSkeleton />;
  if (!alert)    return <div className="py-20 text-center text-gray-400">Alert not found</div>;

  const timelineEvents: TimelineEvent[] = (auditTrail ?? []).map((e) => ({
    id:          e.auditId,
    title:       e.previousStatus ? `${e.previousStatus} → ${e.newStatus}` : `Alert Created (${e.newStatus})`,
    description: e.changeReason ? `by ${e.changedBy} — ${e.changeReason}` : `by ${e.changedBy}`,
    timestamp:   e.changedAt,
    color:       STATUS_TO_COLOR[e.newStatus],
  }));

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview',     label: 'Overview'     },
    { key: 'transactions', label: 'Transactions' },
    { key: 'rule',         label: 'Rule Info'    },
    { key: 'activity',     label: 'Activity'     },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <ArrowLeft className="h-4 w-4" /> Back to Alerts
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
            <Bell className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alert #{alert.alertId}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{alert.alertMessage}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SeverityBadge severity={alert.severity} />
          <StatusBadge status={alert.alertStatus} />
        </div>
      </div>

      {/* Action Panel */}
      <AlertActionPanel alert={alert} onUpdated={() => void refetch()} />

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex gap-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-3 text-sm font-medium transition ${tab === t.key
                ? 'border-b-2 border-hawk-600 text-hawk-600 dark:border-hawk-400 dark:text-hawk-400'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { label: 'Alert ID',     value: `#${alert.alertId}` },
              { label: 'Account',      value: `${alert.accountId} — ${alert.accountName}` },
              { label: 'Transaction',  value: `#${alert.transactionId}` },
              { label: 'Rule',         value: alert.ruleName },
              { label: 'Created',      value: formatDate(alert.createdAt) },
              { label: 'Acknowledged', value: alert.acknowledgedAt ? formatDate(alert.acknowledgedAt) : '—' },
              { label: 'Investigating',value: alert.investigatingAt ? formatDate(alert.investigatingAt) : '—' },
              { label: 'Closed',       value: alert.closedAt ? formatDate(alert.closedAt) : '—' },
              { label: 'Closed By',    value: alert.closedBy ?? '—' },
              { label: 'Resolution',   value: alert.closedReason ?? '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{value}</dd>
              </div>
            ))}
          </dl>
          {alert.alertDetails && (
            <div className="mt-4">
              <JsonViewer data={alert.alertDetails} title="Alert Details JSON" defaultExpanded />
            </div>
          )}
        </div>
      )}

      {tab === 'transactions' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Linked Transactions</h3>
          {!txData || txData.length === 0 ? (
            <p className="text-sm text-gray-400">No linked transactions found.</p>
          ) : (
            <div className="space-y-3">
              {txData.map((tx: { transactionId: number; payeeName: string; amount: number; currency: string; transactionType: string; status: string; timestamp: string }) => (
                <div key={tx.transactionId} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-700">
                  <div>
                    <p className="font-mono text-xs text-gray-500">#{tx.transactionId}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{tx.payeeName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(tx.amount, tx.currency)}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(tx.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'rule' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Rule Information</h3>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-xs text-gray-400">Rule ID</dt><dd className="font-mono font-semibold">#{alert.ruleId}</dd></div>
            <div><dt className="text-xs text-gray-400">Rule Name</dt><dd className="font-medium text-gray-900 dark:text-white">{alert.ruleName}</dd></div>
            <div><dt className="text-xs text-gray-400">Type</dt><dd>{ruleTypeLabel[alert.ruleType]}</dd></div>
            <div><dt className="text-xs text-gray-400">Severity</dt><dd><SeverityBadge severity={alert.severity} /></dd></div>
          </dl>
        </div>
      )}

      {tab === 'activity' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Activity Timeline</h3>
          <Timeline events={timelineEvents} />
        </div>
      )}
    </div>
  );
}

