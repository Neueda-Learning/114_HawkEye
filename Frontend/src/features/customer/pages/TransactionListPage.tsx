import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRightLeft, Bell, Calendar, ChevronDown, ChevronLeft, ChevronRight,
  Search, Filter, ArrowUpRight, ArrowDownLeft, Send, TrendingUp,
  CheckCircle2, Clock, XCircle, RefreshCcw, MoreVertical, Shield, Lock,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { getTransactions } from '@/lib/api/transactions';
import { getAlerts } from '@/lib/api/alerts';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { TransactionStatus, TransactionType } from '@/lib/types';

const TX_STATUSES: TransactionStatus[] = ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'];
const TX_TYPES: TransactionType[] = ['DEBIT', 'CREDIT'];

const STATUS_CONFIG: Record<TransactionStatus, { label: string; classes: string; icon: React.ReactNode }> = {
  COMPLETED: { label: 'Completed', classes: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  PENDING:   { label: 'Pending',   classes: 'bg-amber-100 text-amber-700',    icon: <Clock className="h-3.5 w-3.5" /> },
  FAILED:    { label: 'Failed',    classes: 'bg-rose-100 text-rose-700',      icon: <XCircle className="h-3.5 w-3.5" /> },
  REVERSED:  { label: 'Reversed',  classes: 'bg-slate-100 text-slate-600',    icon: <RefreshCcw className="h-3.5 w-3.5" /> },
};

export default function MyTransactionsPage() {
  const { user }   = useAuthStore();
  const navigate   = useNavigate();

  const [page, setPage]       = useState(0);
  const [status, setStatus]   = useState<TransactionStatus | ''>('');
  const [type, setType]       = useState<TransactionType | ''>('');
  const [search, setSearch]   = useState('');
  const [minAmt, setMinAmt]   = useState('');
  const [maxAmt, setMaxAmt]   = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', user?.accountId, page, status, type, minAmt, maxAmt],
    queryFn: () => getTransactions({
      accountId:       user?.accountId,
      page,
      size:            10,
      sort:            'timestamp,desc',
      status:          status || undefined,
      transactionType: type || undefined,
      minAmount:       minAmt ? Number(minAmt) : undefined,
      maxAmount:       maxAmt ? Number(maxAmt) : undefined,
    }),
  });

  const { data: alertsData } = useQuery({
    queryKey: ['alerts', 'txpage'],
    queryFn: () => getAlerts({ size: 1 }),
  });

  const rows = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages    = data?.totalPages ?? 1;
  const totalAlerts   = alertsData?.totalElements ?? 0;

  // Summary stats derived from current page
  const totalDebit  = rows.filter(r => r.transactionType === 'DEBIT').reduce((s, r) => s + r.amount, 0);
  const totalCredit = rows.filter(r => r.transactionType === 'CREDIT').reduce((s, r) => s + r.amount, 0);
  const completedCount = rows.filter(r => r.status === 'COMPLETED').length;
  const pendingCount   = rows.filter(r => r.status === 'PENDING').length;

  // client-side payee name search
  const filtered = search
    ? rows.filter(r => r.payeeName?.toLowerCase().includes(search.toLowerCase()) || String(r.transactionId).includes(search))
    : rows;

  return (
    <div className="space-y-6 pb-12 animate-fade-in font-sans text-slate-800 bg-[#f8fafc] p-6 -m-6 min-h-screen">

      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
            <ArrowRightLeft className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Transactions</h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
              View, search and filter all your transaction history.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/alerts')}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            <Bell className="h-4.5 w-4.5" />
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-purple-600 text-[10px] font-extrabold text-white shadow-sm">
                {totalAlerts}
              </span>
            )}
          </button>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 transition">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>All Time</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <button
            type="button"
            onClick={() => navigate('/customer/send-money')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-extrabold hover:bg-blue-700 transition shadow-sm"
          >
            <Send className="h-3.5 w-3.5" />
            Send Money
          </button>
        </div>
      </div>

      {/* ── METRIC CARDS ── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

        {/* Total Transactions */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Transactions</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-3xl font-black text-slate-900">
              {isLoading ? '...' : totalElements.toLocaleString()}
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">All time total</p>
          </div>
          <div className="mt-4 h-8 w-full">
            <svg className="h-full w-full" viewBox="0 0 100 30">
              <defs><linearGradient id="bluGradTx" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25"/><stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/></linearGradient></defs>
              <path d="M0,20 Q20,25 40,15 T75,20 T100,12 L100,30 L0,30 Z" fill="url(#bluGradTx)"/>
              <path d="M0,20 Q20,25 40,15 T75,20 T100,12" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Total Sent (Debit) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sent</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-3xl font-black text-rose-600">
              {isLoading ? '...' : formatCurrency(totalDebit)}
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">Outgoing this page</p>
          </div>
          <div className="mt-4 h-8 w-full">
            <svg className="h-full w-full" viewBox="0 0 100 30">
              <defs><linearGradient id="redGradTx" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25"/><stop offset="100%" stopColor="#f43f5e" stopOpacity="0"/></linearGradient></defs>
              <path d="M0,18 Q20,25 40,10 T70,22 T100,14 L100,30 L0,30 Z" fill="url(#redGradTx)"/>
              <path d="M0,18 Q20,25 40,10 T70,22 T100,14" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Total Received (Credit) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Received</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-3xl font-black text-emerald-600">
              {isLoading ? '...' : formatCurrency(totalCredit)}
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">Incoming this page</p>
          </div>
          <div className="mt-4 h-8 w-full">
            <svg className="h-full w-full" viewBox="0 0 100 30">
              <defs><linearGradient id="grnGradTx" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity="0.25"/><stop offset="100%" stopColor="#10b981" stopOpacity="0"/></linearGradient></defs>
              <path d="M0,24 Q25,28 50,16 T75,20 T100,8 L100,30 L0,30 Z" fill="url(#grnGradTx)"/>
              <path d="M0,24 Q25,28 50,16 T75,20 T100,8" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Pending / Completed */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-3xl font-black text-slate-900">
              {isLoading ? '...' : completedCount}
              <span className="text-base font-bold text-slate-400 ml-1">/ {rows.length}</span>
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              {pendingCount > 0 ? `${pendingCount} pending` : 'No pending'}
            </p>
          </div>
          <div className="mt-4 h-8 w-full">
            <svg className="h-full w-full" viewBox="0 0 100 30">
              <defs><linearGradient id="purpGradTx" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25"/><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/></linearGradient></defs>
              <path d="M0,25 Q20,22 40,24 T70,18 T100,10 L100,30 L0,30 Z" fill="url(#purpGradTx)"/>
              <path d="M0,25 Q20,22 40,24 T70,18 T100,10" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

      </div>

      {/* ── TRANSACTIONS TABLE ── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
          <h2 className="text-lg font-extrabold text-slate-900">All Transactions</h2>
          <div className="flex flex-wrap items-center gap-3">

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search payee or ID..."
                className="rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition w-48"
              />
            </div>

            {/* Status filter */}
            <div className="relative">
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value as TransactionStatus | ''); setPage(0); }}
                className="appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition cursor-pointer"
              >
                <option value="">All Statuses</option>
                {TX_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Type filter */}
            <div className="relative">
              <select
                value={type}
                onChange={(e) => { setType(e.target.value as TransactionType | ''); setPage(0); }}
                className="appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition cursor-pointer"
              >
                <option value="">All Types</option>
                {TX_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Amount range */}
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <input
                value={minAmt}
                onChange={(e) => { setMinAmt(e.target.value); setPage(0); }}
                placeholder="Min $"
                type="number"
                className="w-20 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 transition"
              />
              <span className="text-slate-400 text-xs font-bold">–</span>
              <input
                value={maxAmt}
                onChange={(e) => { setMaxAmt(e.target.value); setPage(0); }}
                placeholder="Max $"
                type="number"
                className="w-20 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 pl-2">Transaction</th>
                <th className="py-3.5">Payee</th>
                <th className="py-3.5">Type</th>
                <th className="py-3.5">Amount</th>
                <th className="py-3.5">Status</th>
                <th className="py-3.5">Date & Time</th>
                <th className="py-3.5 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="py-4 pl-2">
                      <div className="h-4 w-full rounded-lg bg-slate-100" />
                    </td>
                  </tr>
                ))
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 font-semibold text-sm">
                    No transactions found.
                  </td>
                </tr>
              )}
              {!isLoading && filtered.map((tx) => {
                const statusCfg = STATUS_CONFIG[tx.status] ?? STATUS_CONFIG.PENDING;
                const isDebit = tx.transactionType === 'DEBIT';
                return (
                  <tr
                    key={tx.transactionId}
                    onClick={() => navigate(`/customer/transactions/${tx.transactionId}`)}
                    className="hover:bg-slate-50/80 transition group cursor-pointer"
                  >
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isDebit ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {isDebit
                            ? <ArrowUpRight className="h-4.5 w-4.5" />
                            : <ArrowDownLeft className="h-4.5 w-4.5" />}
                        </div>
                        <span className="font-mono text-xs text-slate-500 font-bold">#{tx.transactionId}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="font-extrabold text-slate-900 group-hover:text-blue-600 transition">{tx.payeeName}</span>
                      {tx.description && (
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate max-w-[160px]">{tx.description}</p>
                      )}
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[11px] font-extrabold ${isDebit ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {tx.transactionType}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`font-black font-mono text-sm ${isDebit ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {isDebit ? '−' : '+'}{formatCurrency(tx.amount, tx.currency)}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[11px] font-extrabold ${statusCfg.classes}`}>
                        {statusCfg.icon}
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="py-4 text-slate-500 font-semibold text-[11px]">
                      {formatDate(tx.timestamp)}
                    </td>
                    <td className="py-4 pr-2 text-right">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); navigate(`/customer/transactions/${tx.transactionId}`); }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>
            Showing {page * 10 + 1}–{Math.min((page + 1) * 10, totalElements)} of {totalElements.toLocaleString()} transactions
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-extrabold transition ${
                    pageNum === page
                      ? 'border-blue-500 bg-blue-600 text-white shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── SECURITY BANNER ── */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-600 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900">All transactions are monitored in real-time</h4>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Hawkeye continuously analyses every transaction for suspicious activity and flags anomalies instantly.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/customer/send-money')}
          className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl border border-blue-200 bg-white text-xs font-extrabold text-blue-700 hover:bg-blue-600 hover:text-white transition shadow-sm"
        >
          <Send className="h-3.5 w-3.5" />
          Send Money
        </button>
      </div>

      {/* ── FOOTER ── */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-400 pt-4 border-t border-slate-200/80">
        <span>© 2024 Hawkeye. All rights reserved.</span>
        <span className="flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5" />
          <span>Secure • Encrypted • Protected</span>
        </span>
      </div>

    </div>
  );
}
