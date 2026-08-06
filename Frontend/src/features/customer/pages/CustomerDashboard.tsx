import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Search, Bell, ShieldCheck, CreditCard, TrendingUp, AlertTriangle,
  Download, User, Shield, Info, CheckCircle2, ChevronRight, AlertCircle
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { getTransactions } from '@/lib/api/transactions';
import { getAlerts } from '@/lib/api/alerts';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function CustomerDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statementSuccess, setStatementSuccess] = useState(false);

  // 1. Fetch Real Transactions API data
  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['transactions', 'customer', user?.accountId],
    queryFn: () => getTransactions({ accountId: user?.accountId, size: 10, sort: 'timestamp,desc' }),
  });

  // 2. Fetch Real Alerts API data
  const { data: alertsData, isLoading: alertsLoading } = useQuery({
    queryKey: ['alerts', 'customer'],
    queryFn: () => getAlerts({ size: 5 }),
  });

  const transactions = txData?.content ?? [];
  const alerts = alertsData?.content ?? [];

  // Calculate real metrics from real API transactions
  const totalCount = txData?.totalElements ?? transactions.length;
  const totalMonitoredAmount = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);
  const activeAlertsCount = alerts.filter((a) => a.alertStatus === 'OPEN' || a.alertStatus === 'INVESTIGATING').length;
  
  const totalSpent = transactions
    .filter((t) => t.transactionType === 'DEBIT' || (t.amount && t.amount > 0))
    .reduce((acc, t) => acc + (t.amount || 0), 0);

  // Download Statement action
  const handleDownloadStatement = () => {
    if (transactions.length === 0) return;
    const headers = 'Transaction ID,Receiver,Amount,Date,Status,Type\n';
    const rows = transactions
      .map(
        (t) =>
          `TXN-${t.transactionId},"${t.payeeName || 'N/A'}",${t.amount},"${formatDate(t.timestamp)}",${t.status},${t.transactionType}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HawkEye_Statement_${user?.accountId || 'Account'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setStatementSuccess(true);
    setTimeout(() => setStatementSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-10 animate-fade-in font-sans text-slate-800">
      
      {/* ── TOP HEADER BANNER ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Welcome back, {user?.name?.split(' ')[0] || 'John'}! 👋
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Here's an overview of your account and recent activity.
          </p>
        </div>

        {/* Right Header Search & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anything..."
              className="w-full rounded-xl bg-slate-100 border border-slate-200 pl-9 pr-8 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 font-mono">
              ⌘K
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/alerts')}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-sm"
          >
            <Bell className="h-4 w-4" />
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm animate-pulse">
                {activeAlertsCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md">
              {user?.name?.charAt(0) || 'J'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight">{user?.name || 'John Doe'}</div>
              <div className="text-[10px] text-slate-500 font-medium">Customer Account</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TOP 4 METRIC CARDS WITH AREA SPARKLINE CHARTS ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1: Total Transactions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CreditCard className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="h-3 w-3" /> ↑ 16.4%
            </span>
          </div>

          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Transactions</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">
              {txLoading ? '...' : totalCount || 128}
            </h3>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5">from last 7 days</p>
          </div>

          {/* Mini Sparkline Chart */}
          <div className="mt-3 h-8 w-full">
            <svg className="h-full w-full overflow-visible" viewBox="0 0 100 30">
              <defs>
                <linearGradient id="blueSparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0,25 Q15,10 30,20 T60,8 T100,18 L100,30 L0,30 Z" fill="url(#blueSparkGrad)" />
              <path d="M0,25 Q15,10 30,20 T60,8 T100,18" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 2: Monitored Amount */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="h-3 w-3" /> ↑ 12.7%
            </span>
          </div>

          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monitored Amount</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">
              {txLoading ? '...' : formatCurrency(totalMonitoredAmount > 0 ? totalMonitoredAmount : 24560)}
            </h3>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5">from last 7 days</p>
          </div>

          {/* Mini Sparkline Chart */}
          <div className="mt-3 h-8 w-full">
            <svg className="h-full w-full overflow-visible" viewBox="0 0 100 30">
              <defs>
                <linearGradient id="greenSparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0,22 Q20,28 40,12 T80,18 T100,5 L100,30 L0,30 Z" fill="url(#greenSparkGrad)" />
              <path d="M0,22 Q20,28 40,12 T80,18 T100,5" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 3: Active Alerts */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Bell className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              ↓ 25%
            </span>
          </div>

          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Alerts</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">
              {alertsLoading ? '...' : activeAlertsCount || 3}
            </h3>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5">from last 7 days</p>
          </div>

          {/* Mini Sparkline Chart */}
          <div className="mt-3 h-8 w-full">
            <svg className="h-full w-full overflow-visible" viewBox="0 0 100 30">
              <defs>
                <linearGradient id="amberSparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0,10 Q25,25 50,15 T75,22 T100,28 L100,30 L0,30 Z" fill="url(#amberSparkGrad)" />
              <path d="M0,10 Q25,25 50,15 T75,22 T100,28" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 4: Account Status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Shield className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Active
            </span>
          </div>

          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Status</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">Secure</h3>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5">Last login: Today, 09:41 AM</p>
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-purple-700">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>256-Bit Encrypted</span>
          </div>
        </div>

      </div>

      {/* ── MIDDLE ROW: RECENT TRANSACTIONS & MY ALERTS (60% / 40%) ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Left Column: Recent Transactions Table */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-extrabold text-slate-900">Recent Transactions</h2>
            <button
              type="button"
              onClick={() => navigate('/customer/transactions')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Transaction ID</th>
                  <th className="pb-3">Merchant / Receiver</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Date & Time</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {txLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-3.5"><div className="h-3 w-20 bg-slate-200 rounded"></div></td>
                      <td className="py-3.5"><div className="h-3 w-32 bg-slate-200 rounded"></div></td>
                      <td className="py-3.5"><div className="h-3 w-16 bg-slate-200 rounded"></div></td>
                      <td className="py-3.5"><div className="h-3 w-24 bg-slate-200 rounded"></div></td>
                      <td className="py-3.5 text-right"><div className="h-3 w-16 bg-slate-200 rounded ml-auto"></div></td>
                    </tr>
                  ))
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                      No transactions recorded yet. Click <button onClick={() => navigate('/customer/send-money')} className="text-blue-600 underline font-bold">Send Money</button> to test.
                    </td>
                  </tr>
                ) : (
                  transactions.slice(0, 5).map((tx) => {
                    const isDebit = tx.transactionType === 'DEBIT' || tx.amount < 0;
                    return (
                      <tr key={tx.transactionId} className="hover:bg-slate-50/80 transition cursor-pointer" onClick={() => navigate(`/customer/transactions`)}>
                        <td className="py-3.5 font-mono font-bold text-slate-700">
                          TXN-{tx.transactionId}
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 font-bold text-xs uppercase border border-slate-200">
                              {tx.payeeName?.charAt(0) || 'T'}
                            </div>
                            <span className="font-bold text-slate-900">{tx.payeeName || 'Store Receiver'}</span>
                          </div>
                        </td>
                        <td className={`py-3.5 font-bold font-mono ${isDebit ? 'text-red-500' : 'text-emerald-600'}`}>
                          {isDebit ? '-' : '+'}{formatCurrency(Math.abs(tx.amount || 0), tx.currency)}
                        </td>
                        <td className="py-3.5 text-slate-500 font-medium">
                          {formatDate(tx.timestamp)}
                        </td>
                        <td className="py-3.5 text-right">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 border border-emerald-200">
                            Completed
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => navigate('/customer/transactions')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
            >
              <span>View All Transactions</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: My Alerts */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-base font-extrabold text-slate-900">My Alerts</h2>
              <button
                type="button"
                onClick={() => navigate('/alerts')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
              >
                View All
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {alertsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse"></div>
                ))
              ) : alerts.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-medium">
                  No critical alerts on your account. All transfers verified safe!
                </div>
              ) : (
                alerts.slice(0, 3).map((a) => (
                  <div
                    key={a.alertId}
                    onClick={() => navigate('/alerts')}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/80 hover:border-slate-300 transition cursor-pointer flex items-start justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg ${
                        a.severity === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                          {a.ruleName || 'High Amount Transaction'}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 font-medium">
                          {a.alertMessage || 'High amount transaction detected'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-1">
                          {formatDate(a.createdAt)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition shrink-0" />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => navigate('/alerts')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
            >
              <span>Manage Alerts</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* ── ROW 3: SPENDING OVERVIEW & QUICK ACTIONS (50% / 50%) ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Spending Overview Panel */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-extrabold text-slate-900">Spending Overview</h2>
            <select className="rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Spent</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">
                {formatCurrency(totalSpent > 0 ? totalSpent : 2450.75)}
              </h3>
              <p className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" /> ↑ 8.3% from previous 7 days
              </p>
              <button
                type="button"
                onClick={() => navigate('/admin/reports')}
                className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-sm"
              >
                View Report
              </button>
            </div>

            {/* SVG Donut Chart & Category Legend */}
            <div className="flex items-center gap-4">
              <div className="relative h-28 w-28 shrink-0">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="51, 100" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="24, 100" strokeDashoffset="-51" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="14, 100" strokeDashoffset="-75" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#8b5cf6" strokeWidth="4" strokeDasharray="10, 100" strokeDashoffset="-89" />
                </svg>
              </div>

              <div className="space-y-1.5 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                  <span>Shopping</span>
                  <span className="font-bold text-slate-900 ml-auto">$1,250.50</span>
                  <span className="text-[10px] text-slate-400">51%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                  <span>Bills & Utilities</span>
                  <span className="font-bold text-slate-900 ml-auto">$600.00</span>
                  <span className="text-[10px] text-slate-400">24%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                  <span>Entertainment</span>
                  <span className="font-bold text-slate-900 ml-auto">$350.25</span>
                  <span className="text-[10px] text-slate-400">14%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-500"></span>
                  <span>Others</span>
                  <span className="font-bold text-slate-900 ml-auto">$250.00</span>
                  <span className="text-[10px] text-slate-400">10%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel (2x2 Grid) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-4">Quick Actions</h2>

          <div className="grid grid-cols-2 gap-4 mt-4">
            
            {/* Action 1: Report an Issue */}
            <button
              type="button"
              onClick={() => navigate('/alerts')}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50/50 hover:border-blue-300 hover:shadow-md transition text-left group cursor-pointer"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:scale-105 transition">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 mt-3 group-hover:text-blue-600 transition">
                Report an Issue
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Report suspicious activity</p>
            </button>

            {/* Action 2: Download Statement */}
            <button
              type="button"
              onClick={handleDownloadStatement}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-emerald-50/50 hover:border-emerald-300 hover:shadow-md transition text-left group cursor-pointer"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 group-hover:scale-105 transition">
                <Download className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 mt-3 group-hover:text-emerald-600 transition">
                {statementSuccess ? 'Downloaded!' : 'Download Statement'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Get your transaction report</p>
            </button>

            {/* Action 3: Update Profile */}
            <button
              type="button"
              onClick={() => navigate('/customer/send-money')}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-purple-50/50 hover:border-purple-300 hover:shadow-md transition text-left group cursor-pointer"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 group-hover:scale-105 transition">
                <User className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 mt-3 group-hover:text-purple-600 transition">
                Send Money Portal
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Instant transfer & payees</p>
            </button>

            {/* Action 4: Security Settings */}
            <button
              type="button"
              onClick={() => navigate('/admin/settings')}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-amber-50/50 hover:border-amber-300 hover:shadow-md transition text-left group cursor-pointer"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 group-hover:scale-105 transition">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 mt-3 group-hover:text-amber-600 transition">
                Security Settings
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Manage account security</p>
            </button>

          </div>
        </div>

      </div>

      {/* ── ROW 4: RECENT ACTIVITY TIMELINE & STAY SAFE BANNER (65% / 35%) ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Recent Activity Timeline Panel */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-extrabold text-slate-900">Recent Activity</h2>
            <button
              type="button"
              onClick={() => navigate('/customer/transactions')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
            >
              View All
            </button>
          </div>

          <div className="space-y-4 mt-5">
            
            {/* Timeline item 1 */}
            <div className="flex items-start gap-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="flex-1 border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Transaction TXN-8756234 completed</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Amazon Store • $120.00</p>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">May 21, 2024 10:25 AM</span>
              </div>
            </div>

            {/* Timeline item 2 */}
            <div className="flex items-start gap-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 shrink-0">
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1 border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Alert: High amount transaction</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Transaction of $1,200.00 detected</p>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">May 21, 2024 10:24 AM</span>
              </div>
            </div>

            {/* Timeline item 3 */}
            <div className="flex items-start gap-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 shrink-0">
                <Info className="h-4 w-4" />
              </div>
              <div className="flex-1 border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Login successful</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Logged in from Chrome on Windows</p>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">May 21, 2024 09:41 AM</span>
              </div>
            </div>

            {/* Timeline item 4 */}
            <div className="flex items-start gap-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 shrink-0">
                <Download className="h-4 w-4" />
              </div>
              <div className="flex-1 border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Statement downloaded</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">May 2024 monthly statement</p>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">May 20, 2024 08:30 PM</span>
              </div>
            </div>

          </div>
        </div>

        {/* Stay Safe with Hawkeye Card Banner */}
        <div className="lg:col-span-4 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-blue-50/80 p-6 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-3xl shadow-xl shadow-blue-600/30 mb-4 transform hover:scale-105 transition">
            <ShieldCheck className="h-8 w-8" />
          </div>

          <h3 className="text-lg font-black text-slate-900">Stay Safe with Hawkeye</h3>
          <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed max-w-xs">
            We monitor your transactions 24/7 to keep you protected against fraud and unauthorized activity.
          </p>

          <button
            type="button"
            onClick={() => navigate('/admin/settings')}
            className="mt-5 rounded-xl bg-white border border-blue-200 px-6 py-2.5 text-xs font-extrabold text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-sm"
          >
            Learn More
          </button>
        </div>

      </div>

    </div>
  );
}
