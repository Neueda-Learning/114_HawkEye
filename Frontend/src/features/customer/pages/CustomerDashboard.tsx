import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Building2, Wallet, SlidersHorizontal, AlertTriangle,
  ChevronRight, Send, FileText,
  PlusCircle, Settings, HelpCircle, Lock,
  CreditCard
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { getTransactions } from '@/lib/api/transactions';
import { getAlerts } from '@/lib/api/alerts';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DateRangePicker } from '@/components/common/DateRangePicker';

export default function CustomerDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [statementSuccess, setStatementSuccess] = useState(false);

  // 1. Fetch Real Transactions API data
  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['transactions', 'customer', user?.accountId],
    queryFn: () => getTransactions({ accountId: user?.accountId, size: 10, sort: 'timestamp,desc' }),
  });

  // 2. Fetch Real Alerts API data
  const { data: alertsData, isLoading: alertsLoading } = useQuery({
    queryKey: ['alerts', 'customer'],
    queryFn: () => getAlerts({ size: 10 }),
  });

  const transactions = txData?.content ?? [];
  const alerts = alertsData?.content ?? [];

  // Metrics calculation
  const totalTransactionsCount = txData?.totalElements ?? transactions.length;
  const totalAlertsCount = alertsData?.totalElements ?? alerts.length;

  // Breakdown counts for Donut Chart
  const highRiskCount = alerts.filter((a) => a.severity === 'HIGH' || a.severity === 'CRITICAL').length;
  const mediumRiskCount = alerts.filter((a) => a.severity === 'MEDIUM').length;
  const lowRiskCount = alerts.filter((a) => a.severity === 'LOW').length;
  const infoRiskCount = alerts.filter((a) => (a.severity as string) === 'INFO' || !a.severity).length;

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

  // Dynamic Accounts Data linked to user (matching My Accounts page)
  const debitTotal = transactions.filter(t => t.transactionType === 'DEBIT').reduce((s, t) => s + t.amount, 0);
  const creditTotal = transactions.filter(t => t.transactionType === 'CREDIT').reduce((s, t) => s + t.amount, 0);
  const primaryLiveBalance = Math.max(15000, 48500 + (creditTotal - debitTotal));

  const accountsList = [
    {
      name: 'Primary Checking',
      number: `${user?.accountId || 'ACC-001'} (•••• 0001)`,
      type: 'Checking',
      balance: primaryLiveBalance,
      status: 'Active',
      alerts: totalAlertsCount,
      iconColor: 'bg-purple-100 text-purple-600',
    },
    {
      name: 'Savings Reserve',
      number: `${user?.accountId || 'ACC-001'}-SAV (•••• 5678)`,
      type: 'Savings',
      balance: 24850.00,
      status: 'Active',
      alerts: 0,
      iconColor: 'bg-blue-100 text-blue-600',
    },
    {
      name: 'Business Account',
      number: `${user?.accountId || 'ACC-001'}-BUS (•••• 9012)`,
      type: 'Checking',
      balance: 18420.50,
      status: 'Active',
      alerts: Math.min(2, totalAlertsCount),
      iconColor: 'bg-amber-100 text-amber-600',
    },
  ];

  const totalAccountsCount = accountsList.length;
  const totalBalanceAmount = accountsList.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-6 pb-12 animate-fade-in font-sans text-slate-800 bg-[#f8fafc] p-6 -m-6 rounded-none min-h-screen">
      
      {/* ── TOP HEADER BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Welcome back, {user?.name?.split(' ')[0] || 'fourgrads'}! 👋
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Here's what's happening across your accounts.
          </p>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/customer/alerts')}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition shadow-sm cursor-pointer"
            title="View Alerts"
          >
            <Bell className="h-4.5 w-4.5" />
            {totalAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-purple-600 text-[10px] font-extrabold text-white shadow-sm">
                {totalAlertsCount}
              </span>
            )}
          </button>

          <DateRangePicker />
        </div>
      </div>

      {/* ── TOP 4 SUMMARY METRIC CARDS ── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1: Total Accounts */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Accounts</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{totalAccountsCount}</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">Active Accounts</p>
            </div>
          </div>
          {/* Mini Sparkline Chart */}
          <div className="mt-4 h-8 w-full">
            <svg className="h-full w-full overflow-visible" viewBox="0 0 100 30">
              <defs>
                <linearGradient id="purpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0,25 Q15,22 30,24 T60,18 T100,10 L100,30 L0,30 Z" fill="url(#purpGrad)" />
              <path d="M0,25 Q15,22 30,24 T60,18 T100,10" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 2: Total Balance */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Balance</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{formatCurrency(totalBalanceAmount)}</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">Across all accounts</p>
            </div>
          </div>
          {/* Mini Sparkline Chart */}
          <div className="mt-4 h-8 w-full">
            <svg className="h-full w-full overflow-visible" viewBox="0 0 100 30">
              <defs>
                <linearGradient id="bluGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0,20 Q20,25 40,15 T80,20 T100,12 L100,30 L0,30 Z" fill="url(#bluGrad)" />
              <path d="M0,20 Q20,25 40,15 T80,20 T100,12" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 3: Total Transactions */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Transactions</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                {txLoading ? '...' : totalTransactionsCount.toLocaleString()}
              </h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">This week</p>
            </div>
          </div>
          {/* Mini Sparkline Chart */}
          <div className="mt-4 h-8 w-full">
            <svg className="h-full w-full overflow-visible" viewBox="0 0 100 30">
              <defs>
                <linearGradient id="grnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0,24 Q25,28 50,16 T75,20 T100,8 L100,30 L0,30 Z" fill="url(#grnGrad)" />
              <path d="M0,24 Q25,28 50,16 T75,20 T100,8" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 4: Total Alerts */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Alerts</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <Bell className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                {alertsLoading ? '...' : totalAlertsCount}
              </h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">Requires attention</p>
            </div>
          </div>
          {/* Mini Sparkline Chart */}
          <div className="mt-4 h-8 w-full">
            <svg className="h-full w-full overflow-visible" viewBox="0 0 100 30">
              <defs>
                <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0,18 Q20,25 40,10 T70,22 T100,14 L100,30 L0,30 Z" fill="url(#redGrad)" />
              <path d="M0,18 Q20,25 40,10 T70,22 T100,14" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

      </div>

      {/* ── MIDDLE ROW: ACCOUNTS OVERVIEW & ALERTS SUMMARY (65% / 35%) ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Accounts Overview Table Panel */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Accounts Overview</h2>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">Summary of all your linked accounts</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/customer/accounts')}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-sm cursor-pointer"
              >
                View All Accounts
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pl-2">Account Name</th>
                    <th className="pb-3">Account Number</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Balance</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right pr-2">Alerts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accountsList.map((acc, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${acc.iconColor} font-bold text-xs shrink-0`}>
                            <CreditCard className="h-4 w-4" />
                          </div>
                          <span className="font-extrabold text-slate-900">{acc.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 font-mono font-bold text-slate-700">{acc.number}</td>
                      <td className="py-3.5 text-slate-600 font-semibold">{acc.type}</td>
                      <td className={`py-3.5 font-bold font-mono ${acc.balance < 0 ? 'text-slate-900' : 'text-slate-900'}`}>
                        {formatCurrency(acc.balance)}
                      </td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100/80 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700">
                          {acc.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        {acc.alerts > 0 ? (
                          <span className="inline-flex items-center gap-1 font-bold text-slate-700 hover:text-blue-600 cursor-pointer">
                            <span>{acc.alerts}</span>
                            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-slate-400">
                            <span>0</span>
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 pt-3 text-center border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/customer/accounts')}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm cursor-pointer"
            >
              Manage Accounts
            </button>
          </div>
        </div>

        {/* Alerts Summary Donut & Banner Panel */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-4">
              Alerts Summary
            </h2>

            {/* Donut Chart Visual & Legend Breakdown */}
            <div className="mt-6 flex items-center justify-between gap-4">
              
              {/* Donut Ring Chart SVG */}
              <div className="relative h-36 w-36 shrink-0 flex items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 42 42">
                  <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#f1f5f9" strokeWidth="5" />
                  
                  {/* High Risk (Red) */}
                  <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#ef4444" strokeWidth="5" strokeDasharray="30, 100" strokeDashoffset="0" strokeLinecap="round" />
                  
                  {/* Medium Risk (Orange) */}
                  <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#f97316" strokeWidth="5" strokeDasharray="40, 100" strokeDashoffset="-32" strokeLinecap="round" />
                  
                  {/* Low Risk (Yellow) */}
                  <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#eab308" strokeWidth="5" strokeDasharray="15, 100" strokeDashoffset="-74" strokeLinecap="round" />
                  
                  {/* Info (Blue) */}
                  <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#3b82f6" strokeWidth="5" strokeDasharray="10, 100" strokeDashoffset="-90" strokeLinecap="round" />
                </svg>

                {/* Donut Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-slate-900 leading-none">{totalAlertsCount}</span>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase mt-1">Total Alerts</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-3 text-xs font-bold text-slate-700 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span>High Risk</span>
                  </div>
                  <span className="font-black text-slate-900">{highRiskCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                    <span>Medium Risk</span>
                  </div>
                  <span className="font-black text-slate-900">{mediumRiskCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                    <span>Low Risk</span>
                  </div>
                  <span className="font-black text-slate-900">{lowRiskCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span>Info</span>
                  </div>
                  <span className="font-black text-slate-900">{infoRiskCount}</span>
                </div>
              </div>

            </div>
          </div>

          {/* High Risk Alerts Banner */}
          <div className="mt-6 rounded-2xl bg-rose-50/70 border border-rose-100 p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-rose-900">
                {highRiskCount > 0 ? `${highRiskCount} high risk alerts need your attention.` : 'All alerts are currently under review.'}
              </h4>
              <p className="text-[11px] text-slate-600 font-medium mt-1 leading-relaxed">
                Review them now to keep your accounts secure.
              </p>
              <button
                type="button"
                onClick={() => navigate('/customer/alerts')}
                className="mt-2 text-xs font-extrabold text-blue-600 hover:text-blue-700 transition flex items-center gap-1 cursor-pointer"
              >
                <span>View Alerts</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ── BOTTOM ROW: RECENT ACTIVITY & QUICK ACTIONS (55% / 45%) ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Recent Activity List Panel */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-slate-900">Recent Activity</h2>
            <button
              type="button"
              onClick={() => navigate('/customer/transactions')}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-sm"
            >
              View All Activity
            </button>
          </div>

          <div className="space-y-4 mt-5">
            {transactions.slice(0, 5).map((tx, idx) => (
              <div
                key={tx.transactionId || idx}
                onClick={() => navigate(`/customer/transactions/${tx.transactionId}`)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl ${tx.transactionType === 'DEBIT' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'} flex items-center justify-center shrink-0`}>
                    <SlidersHorizontal className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">
                      {tx.payeeName ? `Transfer to ${tx.payeeName}` : `Transaction #${tx.transactionId}`}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {tx.accountId} • {formatCurrency(tx.amount)} • {formatDate(tx.timestamp)}
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-md font-extrabold text-[11px] ${tx.status === 'COMPLETED' ? 'bg-emerald-100/80 text-emerald-700' : 'bg-amber-100/80 text-amber-700'}`}>
                  {tx.status}
                </span>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="p-6 text-center text-xs font-semibold text-slate-400">
                No recent activity recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Panel (6 Cards: 2 Cols x 3 Rows) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-4">
            Quick Actions
          </h2>

          <div className="grid grid-cols-2 gap-4 mt-5">
            
            {/* Card 1: Send Money */}
            <button
              type="button"
              onClick={() => navigate('/customer/send-money')}
              className="p-4 rounded-2xl border border-slate-100 bg-[#f8fafc] hover:bg-blue-50/50 hover:border-blue-300 hover:shadow-md transition text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
                <Send className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-extrabold text-slate-900 mt-3 group-hover:text-blue-600 transition">
                Send Money
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                Transfer money between your accounts
              </p>
            </button>

            {/* Card 2: Download Report */}
            <button
              type="button"
              onClick={handleDownloadStatement}
              className="p-4 rounded-2xl border border-slate-100 bg-[#f8fafc] hover:bg-blue-50/50 hover:border-blue-300 hover:shadow-md transition text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-extrabold text-slate-900 mt-3 group-hover:text-blue-600 transition">
                {statementSuccess ? 'Downloaded!' : 'Download Report'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                Get your transaction reports
              </p>
            </button>

            {/* Card 3: Manage Alerts */}
            <button
              type="button"
              onClick={() => navigate('/customer/alerts')}
              className="p-4 rounded-2xl border border-slate-100 bg-[#f8fafc] hover:bg-purple-50/50 hover:border-purple-300 hover:shadow-md transition text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-105 transition">
                <Bell className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-extrabold text-slate-900 mt-3 group-hover:text-purple-600 transition">
                Manage Alerts
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                Customize alert preferences
              </p>
            </button>

            {/* Card 4: Add Account */}
            <button
              type="button"
              onClick={() => navigate('/customer/send-money')}
              className="p-4 rounded-2xl border border-slate-100 bg-[#f8fafc] hover:bg-purple-50/50 hover:border-purple-300 hover:shadow-md transition text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-105 transition">
                <PlusCircle className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-extrabold text-slate-900 mt-3 group-hover:text-purple-600 transition">
                Add Account
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                Link a new account to Hawkeye
              </p>
            </button>

            {/* Card 5: Account Settings */}
            <button
              type="button"
              onClick={() => navigate('/customer/settings')}
              className="p-4 rounded-2xl border border-slate-100 bg-[#f8fafc] hover:bg-[#f1f5f9] hover:border-slate-300 hover:shadow-md transition text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-105 transition">
                <Settings className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-extrabold text-slate-900 mt-3 group-hover:text-purple-600 transition">
                Account Settings
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                Manage account preferences
              </p>
            </button>

            {/* Card 6: Help Center */}
            <button
              type="button"
              onClick={() => navigate('/customer/settings')}
              className="p-4 rounded-2xl border border-slate-100 bg-[#f8fafc] hover:bg-[#f1f5f9] hover:border-slate-300 hover:shadow-md transition text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
                <HelpCircle className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-extrabold text-slate-900 mt-3 group-hover:text-blue-600 transition">
                Help Center
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                Get help and support when you need it
              </p>
            </button>

          </div>
        </div>

      </div>

      {/* ── FOOTER ROW ── */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-400 pt-6 border-t border-slate-200/80">
        <span>© 2024 Hawkeye. All rights reserved.</span>
        <span className="flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-slate-400" />
          <span>Secure • Encrypted • Protected</span>
        </span>
      </div>

    </div>
  );
}
