import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { getTransactions } from '@/lib/api/transactions';
import { DataTable, type Column } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { TransactionResponse, TransactionStatus, TransactionType } from '@/lib/types';

const TX_STATUSES: TransactionStatus[] = ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'];
const TX_TYPES: TransactionType[]      = ['DEBIT', 'CREDIT'];

const STATUS_COLOR: Record<TransactionStatus, string> = {
  PENDING:   'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED:    'bg-red-100 text-red-800',
  REVERSED:  'bg-gray-100 text-gray-600',
};

export default function TransactionListPage() {
  const { user } = useAuthStore();
  const navigate  = useNavigate();

  const [page, setPage]     = useState(0);
  const [status, setStatus] = useState('');
  const [type, setType]     = useState('');
  const [minAmt, setMinAmt] = useState('');
  const [maxAmt, setMaxAmt] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', user?.accountId, page, status, type, minAmt, maxAmt],
    queryFn:  () => getTransactions({
      accountId:       user?.accountId,
      page,
      size:            10,
      sort:            'timestamp,desc',
      status:          (status as TransactionStatus) || undefined,
      transactionType: (type as TransactionType) || undefined,
      minAmount:       minAmt ? Number(minAmt) : undefined,
      maxAmount:       maxAmt ? Number(maxAmt) : undefined,
    }),
  });

  const columns: Column<TransactionResponse>[] = [
    {
      key: 'transactionId', header: 'ID', sortable: true,
      render: (row) => <span className="font-mono text-xs text-gray-500">#{row.transactionId}</span>,
    },
    {
      key: 'payeeName', header: 'Payee', sortable: true,
      render: (row) => <span className="font-medium text-gray-900 dark:text-white">{row.payeeName}</span>,
    },
    {
      key: 'transactionType', header: 'Type',
      render: (row) => (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${row.transactionType === 'DEBIT' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {row.transactionType}
        </span>
      ),
    },
    {
      key: 'amount', header: 'Amount', sortable: true,
      render: (row) => (
        <span className={`font-semibold ${row.transactionType === 'DEBIT' ? 'text-red-600' : 'text-green-600'}`}>
          {row.transactionType === 'DEBIT' ? '-' : '+'}{formatCurrency(row.amount, row.currency)}
        </span>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (row) => (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOR[row.status]}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'timestamp', header: 'Date', sortable: true,
      render: (row) => <span className="text-xs text-gray-500">{formatDate(row.timestamp)}</span>,
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Transactions</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search payee…" className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-hawk-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white">
          <option value="">All Statuses</option>
          {TX_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(0); }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white">
          <option value="">All Types</option>
          {TX_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <input value={minAmt} onChange={(e) => { setMinAmt(e.target.value); setPage(0); }}
            placeholder="Min $" type="number"
            className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
          <span className="text-gray-400">–</span>
          <input value={maxAmt} onChange={(e) => { setMaxAmt(e.target.value); setPage(0); }}
            placeholder="Max $" type="number"
            className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data?.content ?? []}
        keyExtractor={(row) => row.transactionId}
        onRowClick={(row) => navigate(`/customer/transactions/${row.transactionId}`)}
        isLoading={isLoading}
        emptyMessage="No transactions found"
      />

      {/* Pagination */}
      {data && (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          size={data.size}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

