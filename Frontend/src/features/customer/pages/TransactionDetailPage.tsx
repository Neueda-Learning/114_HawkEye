import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Receipt, AlertTriangle } from 'lucide-react';
import { getTransactionById } from '@/lib/api/transactions';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import { Timeline, type TimelineEvent } from '@/components/common/Timeline';
import { PageSkeleton } from '@/components/common/SkeletonLoader';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { AlertSummary, AlertStatus } from '@/lib/types';

const STATUS_COLOR_MAP: Record<AlertStatus, TimelineEvent['color']> = {
  OPEN:          'red',
  ACKNOWLEDGED:  'yellow',
  INVESTIGATING: 'blue',
  CLOSED:        'green',
  DISMISSED:     'gray',
};

export default function TransactionDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: tx, isLoading, isError } = useQuery({
    queryKey: ['transaction', id],
    queryFn:  () => getTransactionById(Number(id)),
    enabled:  !!id,
  });

  if (isLoading) return <PageSkeleton />;

  if (isError || !tx) {
    return (
      <div className="flex flex-col items-center py-20 text-gray-400">
        <Receipt className="mb-3 h-12 w-12" />
        <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">Transaction not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-sm text-hawk-600 hover:underline">
          Go back
        </button>
      </div>
    );
  }

  // Build timeline from alert statuses
  const timelineEvents: TimelineEvent[] = [
    {
      id:          'created',
      title:       'Transaction Created',
      description: `${tx.transactionType} of ${formatCurrency(tx.amount, tx.currency)} to ${tx.payeeName}`,
      timestamp:   tx.createdAt,
      color:       'blue',
    },
    ...tx.alerts.map((a: AlertSummary) => ({
      id:          `alert-${a.alertId}`,
      title:       `Alert Triggered`,
      description: a.alertMessage,
      timestamp:   a.createdAt,
      color:       STATUS_COLOR_MAP[a.alertStatus],
    })),
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Transaction #{tx.transactionId}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{formatDate(tx.timestamp)}</p>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${tx.transactionType === 'DEBIT' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {tx.transactionType}
        </span>
      </div>

      {/* Detail Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">Transaction Details</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { label: 'From Account',  value: `${tx.accountId} — ${tx.accountName}` },
            { label: 'To Payee',      value: `${tx.payeeId} — ${tx.payeeName}` },
            { label: 'Amount',        value: <span className="text-lg font-bold text-hawk-700 dark:text-hawk-300">{formatCurrency(tx.amount, tx.currency)}</span> },
            { label: 'Status',        value: <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${tx.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{tx.status}</span> },
            { label: 'Currency',      value: tx.currency },
            { label: 'Description',   value: tx.description ?? '—' },
            { label: 'Timestamp',     value: formatDate(tx.timestamp) },
            { label: 'Created At',    value: formatDate(tx.createdAt) },
          ].map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Linked Alerts */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Linked Alerts ({tx.alerts.length})
          </h2>
        </div>
        {tx.alerts.length === 0 ? (
          <p className="text-sm text-gray-400">No alerts triggered for this transaction.</p>
        ) : (
          <div className="space-y-3">
            {tx.alerts.map((alert: AlertSummary) => (
              <div
                key={alert.alertId}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-700"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{alert.alertMessage}</p>
                  <p className="text-xs text-gray-400">{formatDate(alert.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={alert.severity} />
                  <StatusBadge status={alert.alertStatus} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Timeline</h2>
        <Timeline events={timelineEvents} />
      </div>
    </div>
  );
}

