import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Send, TrendingUp, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { getTransactions } from '@/lib/api/transactions';
import { MetricCard } from '@/components/common/MetricCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function CustomerDashboard() {
  const { user } = useAuthStore();
  const navigate  = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', 'customer', user?.accountId],
    queryFn:  () => getTransactions({ accountId: user?.accountId, size: 5, sort: 'timestamp,desc' }),
    enabled:  !!user?.accountId,
  });

  const transactions = data?.content ?? [];

  const completed = transactions.filter((t) => t.status === 'COMPLETED').length;
  const totalSpent = transactions
    .filter((t) => t.transactionType === 'DEBIT' && t.status === 'COMPLETED')
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Account: <span className="font-mono font-semibold">{user?.accountId}</span>
          </p>
        </div>
        <button
          onClick={() => navigate('/customer/send-money')}
          className="flex items-center gap-2 rounded-xl bg-hawk-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-hawk-700 focus:outline-none focus:ring-2 focus:ring-hawk-500"
        >
          <Send className="h-4 w-4" />
          Send Money
        </button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Recent Transactions"
          value={data?.totalElements ?? 0}
          subtitle="All time"
          icon={<TrendingUp className="h-5 w-5" />}
          color="blue"
          isLoading={isLoading}
        />
        <MetricCard
          title="Completed"
          value={completed}
          subtitle="Last 5 shown"
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="green"
          isLoading={isLoading}
        />
        <MetricCard
          title="Total Spent"
          value={formatCurrency(totalSpent)}
          subtitle="Debit transactions"
          icon={<ArrowUpRight className="h-5 w-5" />}
          color="default"
          isLoading={isLoading}
        />
        <MetricCard
          title="Pending"
          value={transactions.filter((t) => t.status === 'PENDING').length}
          subtitle="Awaiting completion"
          icon={<Clock className="h-5 w-5" />}
          color="yellow"
          isLoading={isLoading}
        />
      </div>

      {/* Recent Transactions */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
          <button
            onClick={() => navigate('/customer/transactions')}
            className="flex items-center gap-1 text-xs font-medium text-hawk-600 hover:underline dark:text-hawk-400"
          >
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </div>
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-400">
            <XCircle className="mb-2 h-10 w-10" />
            <p className="text-sm">No transactions yet</p>
            <button
              onClick={() => navigate('/customer/send-money')}
              className="mt-3 text-sm font-medium text-hawk-600 hover:underline"
            >
              Make your first transaction
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50 dark:divide-gray-800">
            {transactions.map((tx) => (
              <li
                key={tx.transactionId}
                onClick={() => navigate(`/customer/transactions/${tx.transactionId}`)}
                className="flex cursor-pointer items-center gap-4 px-5 py-4 transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                {/* Icon */}
                <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${tx.transactionType === 'DEBIT' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {tx.transactionType === 'DEBIT' ? '↑' : '↓'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{tx.payeeName}</p>
                  <p className="text-xs text-gray-400">{formatDate(tx.timestamp)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${tx.transactionType === 'DEBIT' ? 'text-red-600' : 'text-green-600'}`}>
                    {tx.transactionType === 'DEBIT' ? '-' : '+'}{formatCurrency(tx.amount, tx.currency)}
                  </p>
                  <StatusBadge status={tx.status as never} className="mt-0.5" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

