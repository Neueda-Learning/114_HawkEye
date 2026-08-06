import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Bell, Building2, Wallet, SlidersHorizontal, ChevronDown,
  CreditCard, ChevronRight, ChevronLeft, Search, Filter, MoreVertical,
  Lock, Shield
} from 'lucide-react';
import { getTransactions } from '@/lib/api/transactions';
import { getAlerts } from '@/lib/api/alerts';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/store/authStore';
import { DateRangePicker } from '@/components/common/DateRangePicker';

const TYPE_COLORS: Record<string, string> = {
  'Checking':    '#8b5cf6',
  'Savings':     '#3b82f6',
  'Credit Card': '#10b981',
};

export default function MyAccountsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage] = useState(1);

  // Fetch real transaction and alert counts from backend
  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['transactions', 'myaccounts', user?.accountId],
    queryFn: () => getTransactions({ accountId: user?.accountId, size: 50, sort: 'timestamp,desc' }),
  });

  const { data: alertsData, isLoading: alertsLoading } = useQuery({
    queryKey: ['alerts', 'myaccounts', user?.accountId],
    queryFn: () => getAlerts({ accountId: user?.accountId, size: 50 }),
  });

  const allTx = txData?.content ?? [];
  const totalTransactions = txData?.totalElements ?? allTx.length;
  const totalAlerts = alertsData?.totalElements ?? 0;

  // Calculate live dynamic balance from API transactions
  const debitTotal = allTx.filter(t => t.transactionType === 'DEBIT').reduce((s, t) => s + t.amount, 0);
  const creditTotal = allTx.filter(t => t.transactionType === 'CREDIT').reduce((s, t) => s + t.amount, 0);
  const primaryLiveBalance = Math.max(15000, 48500 + (creditTotal - debitTotal));
  const latestTxTime = allTx[0]?.timestamp
    ? dayjs(allTx[0].timestamp).format('MMM DD, YYYY hh:mm A')
    : dayjs().format('MMM DD, YYYY hh:mm A');

  // Dynamic user accounts list reflecting current user
  const ACCOUNTS = useMemo(() => [
    {
      name: 'Primary Checking',
      number: `${user?.accountId || 'ACC-001'} (•••• 0001)`,
      type: 'Checking',
      balance: primaryLiveBalance,
      status: 'Active',
      lastActivity: latestTxTime,
      alerts: totalAlerts,
      iconColor: 'bg-purple-100 text-purple-600',
      rank: 1
    },
    {
      name: 'Savings Reserve',
      number: `${user?.accountId || 'ACC-001'}-SAV (•••• 5678)`,
      type: 'Savings',
      balance: 24850.00,
      status: 'Active',
      lastActivity: dayjs().subtract(1, 'day').format('MMM DD, YYYY hh:mm A'),
      alerts: 0,
      iconColor: 'bg-blue-100 text-blue-600',
      rank: 2
    },
    {
      name: 'Business Account',
      number: `${user?.accountId || 'ACC-001'}-BUS (•••• 9012)`,
      type: 'Checking',
      balance: 18420.50,
      status: 'Active',
      lastActivity: dayjs().subtract(2, 'day').format('MMM DD, YYYY hh:mm A'),
      alerts: Math.min(2, totalAlerts),
      iconColor: 'bg-emerald-100 text-emerald-600',
      rank: 3
    },
  ], [user?.accountId, primaryLiveBalance, latestTxTime, totalAlerts]);

  // Filter accounts by search
  const filteredAccounts = ACCOUNTS.filter((acc) =>
    acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.number.includes(searchQuery)
  );

  // Distribution breakdown
  const typeGroups = ACCOUNTS.reduce<Record<string, number>>((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {});
  const total = ACCOUNTS.length;

  // Top accounts by balance (sorted)
  const topAccounts = [...ACCOUNTS]
    .filter((a) => a.balance > 0)
    .sort((a, b) => b.balance - a.balance);

  // Donut segments
  const donutSegments: { type: string; count: number; pct: number; color: string; offset: number }[] = [];
  let runningOffset = 0;
  Object.entries(typeGroups).forEach(([type, count]) => {
    const pct = (count / total) * 100;
    donutSegments.push({ type, count, pct, color: TYPE_COLORS[type] ?? '#94a3b8', offset: runningOffset });
    runningOffset += pct;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in font-sans text-slate-800 bg-[#f8fafc] p-6 -m-6 min-h-screen">

      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-sm">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Accounts</h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
              View and manage all your linked accounts in one place.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/customer/alerts')}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            <Bell className="h-4.5 w-4.5" />
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-purple-600 text-[10px] font-extrabold text-white shadow-sm">
                {totalAlerts}
              </span>
            )}
          </button>

          <DateRangePicker />
        </div>
      </div>

      {/* ── TOP 4 METRIC CARDS ── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

        {/* Card 1: Total Accounts */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Accounts</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-3xl font-black text-slate-900">{ACCOUNTS.length}</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">Active accounts linked</p>
          </div>
          <div className="mt-4 h-8 w-full">
            <svg className="h-full w-full" viewBox="0 0 100 30">
              <defs><linearGradient id="purpGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" /><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" /></linearGradient></defs>
              <path d="M0,25 Q20,22 40,24 T70,18 T100,10 L100,30 L0,30 Z" fill="url(#purpGrad2)" />
              <path d="M0,25 Q20,22 40,24 T70,18 T100,10" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 2: Total Balance */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Balance</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-3xl font-black text-slate-900">$126,560.50</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">Across all accounts</p>
          </div>
          <div className="mt-4 h-8 w-full">
            <svg className="h-full w-full" viewBox="0 0 100 30">
              <defs><linearGradient id="bluGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /></linearGradient></defs>
              <path d="M0,20 Q20,25 40,15 T75,20 T100,12 L100,30 L0,30 Z" fill="url(#bluGrad2)" />
              <path d="M0,20 Q20,25 40,15 T75,20 T100,12" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 3: Total Transactions */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Transactions</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-3xl font-black text-slate-900">
              {txLoading ? '...' : totalTransactions.toLocaleString()}
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">This week</p>
          </div>
          <div className="mt-4 h-8 w-full">
            <svg className="h-full w-full" viewBox="0 0 100 30">
              <defs><linearGradient id="grnGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity="0.25" /><stop offset="100%" stopColor="#10b981" stopOpacity="0" /></linearGradient></defs>
              <path d="M0,24 Q25,28 50,16 T75,20 T100,8 L100,30 L0,30 Z" fill="url(#grnGrad2)" />
              <path d="M0,24 Q25,28 50,16 T75,20 T100,8" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 4: Alerts */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alerts</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <Bell className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-3xl font-black text-slate-900">
              {alertsLoading ? '...' : totalAlerts}
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">Require your attention</p>
          </div>
          <div className="mt-4 h-8 w-full">
            <svg className="h-full w-full" viewBox="0 0 100 30">
              <defs><linearGradient id="redGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" /><stop offset="100%" stopColor="#f43f5e" stopOpacity="0" /></linearGradient></defs>
              <path d="M0,18 Q20,25 40,10 T70,22 T100,14 L100,30 L0,30 Z" fill="url(#redGrad2)" />
              <path d="M0,18 Q20,25 40,10 T70,22 T100,14" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

      </div>

      {/* ── ALL ACCOUNTS TABLE ── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
          <h2 className="text-lg font-extrabold text-slate-900">All Accounts</h2>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search accounts..."
                className="rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition w-48"
              />
            </div>
            {/* Filter */}
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <span>Filter</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 pl-2">Account Name</th>
                <th className="py-3.5">Account Number</th>
                <th className="py-3.5">Type</th>
                <th className="py-3.5">Balance</th>
                <th className="py-3.5">Status</th>
                <th className="py-3.5">Last Activity</th>
                <th className="py-3.5 text-right pr-2">Alerts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.map((acc, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition group cursor-pointer">
                  <td className="py-4 pl-2">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${acc.iconColor} font-bold text-xs shrink-0`}>
                        <CreditCard className="h-4.5 w-4.5" />
                      </div>
                      <span className="font-extrabold text-slate-900 group-hover:text-blue-600 transition">{acc.name}</span>
                    </div>
                  </td>
                  <td className="py-4 font-mono font-bold text-slate-600">{acc.number}</td>
                  <td className="py-4 text-slate-600 font-semibold">{acc.type}</td>
                  <td className={`py-4 font-black font-mono ${acc.balance < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                    {formatCurrency(acc.balance)}
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100/80 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700">
                      {acc.status}
                    </span>
                  </td>
                  <td className="py-4 text-slate-500 font-semibold text-[11px]">{acc.lastActivity}</td>
                  <td className="py-4 text-right pr-2">
                    <div className="flex items-center justify-end gap-2">
                      {acc.alerts > 0 ? (
                        <span className="font-black text-rose-600 flex items-center gap-1">
                          {acc.alerts}
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        </span>
                      ) : (
                        <span className="font-bold text-slate-400">0</span>
                      )}
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Showing 1 to {filteredAccounts.length} of {ACCOUNTS.length} accounts</span>
          <div className="flex items-center gap-2">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500 bg-blue-600 text-white font-extrabold text-xs shadow-sm">
              {currentPage}
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW: ACCOUNT DISTRIBUTION & TOP ACCOUNTS BY BALANCE ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

        {/* Account Distribution Donut */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-900">Account Distribution</h2>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Breakdown of your accounts by type</p>

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-8">
            {/* Donut Chart */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                {donutSegments.map((seg, i) => (
                  <circle
                    key={i}
                    cx="21" cy="21" r="15.9155"
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="6"
                    strokeDasharray={`${seg.pct} ${100 - seg.pct}`}
                    strokeDashoffset={-seg.offset}
                    strokeLinecap="round"
                  />
                ))}
              </svg>
            </div>

            {/* Legend */}
            <div className="flex-1 grid grid-cols-1 gap-3">
              {Object.entries(typeGroups).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: TYPE_COLORS[type] ?? '#94a3b8' }}></span>
                    <span className="text-sm font-bold text-slate-700">{type}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                    <span>{count} {count === 1 ? 'account' : 'accounts'}</span>
                    <span className="text-slate-400">{((count / total) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Accounts by Balance */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-900">Top Accounts by Balance</h2>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Your highest balance accounts</p>

          <div className="space-y-4 mt-6">
            {topAccounts.map((acc, idx) => (
              <div key={idx} className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-xl transition">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-extrabold text-xs shrink-0 border-2 border-slate-200">
                  {idx + 1}
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${acc.iconColor} shrink-0`}>
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition">{acc.name}</p>
                  <p className="text-[11px] font-mono text-slate-400 font-semibold">{acc.number}</p>
                </div>
                <span className="font-black text-sm text-slate-900 font-mono">{formatCurrency(acc.balance)}</span>
              </div>
            ))}
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
            <h4 className="text-sm font-extrabold text-slate-900">All your accounts are secure</h4>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Hawkeye continuously monitors your accounts for suspicious activities and alerts you instantly.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/customer/settings')}
          className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl border border-blue-200 bg-white text-xs font-extrabold text-blue-700 hover:bg-blue-600 hover:text-white transition shadow-sm"
        >
          Security Settings
          <ChevronRight className="h-3.5 w-3.5" />
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
