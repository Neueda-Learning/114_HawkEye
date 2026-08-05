import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
  Search, Filter, Download, Plus, Calendar, Eye, MoreVertical,
  RotateCcw, Globe, Smartphone, Landmark, CreditCard, Zap,
  CheckCircle2, AlertCircle, Clock, TrendingUp, TrendingDown, X
} from 'lucide-react';
import { getTransactions, createTransaction } from '@/lib/api/transactions';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { TransactionResponse, TransactionType, TransactionStatus } from '@/lib/types';

// Merchant Icon helper
function MerchantIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  if (n.includes('amazon')) return <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-xs font-bold text-orange-600">a</span>;
  if (n.includes('starbucks')) return <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-700">★</span>;
  if (n.includes('shell')) return <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 text-xs font-bold text-yellow-700">🐚</span>;
  if (n.includes('netflix')) return <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-xs font-bold text-red-600">N</span>;
  if (n.includes('flipkart')) return <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-600">fk</span>;
  if (n.includes('salary') || n.includes('credit')) return <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-xs font-bold text-green-700">💼</span>;
  if (n.includes('electricity') || n.includes('utility')) return <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-xs font-bold text-amber-700">⚡</span>;
  return <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">🏢</span>;
}

// Channel Icon helper
function ChannelBadge({ channel }: { channel: string }) {
  let icon = <Globe className="h-3.5 w-3.5 text-blue-500" />;
  if (channel === 'Mobile App') icon = <Smartphone className="h-3.5 w-3.5 text-emerald-500" />;
  if (channel === 'Internal Transfer') icon = <Landmark className="h-3.5 w-3.5 text-purple-500" />;
  if (channel === 'Card Payment') icon = <CreditCard className="h-3.5 w-3.5 text-amber-500" />;
  if (channel === 'UPI Transfer') icon = <Zap className="h-3.5 w-3.5 text-indigo-500" />;

  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
      {icon}
      <span>{channel}</span>
    </div>
  );
}

// Sparkline Mini Component
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const pts = data.map((v, i) => ({ x: i, y: v }));
  return (
    <ResponsiveContainer width="100%" height={32}>
      <LineChart data={pts} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <Line type="monotone" dataKey="y" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Ring Indicator for Debit / Credit
function RingProgress({ value, total, color }: { value: number; total: number; color: string }) {
  const data = [{ value }, { value: total - value }];
  return (
    <div className="relative h-8 w-8">
      <PieChart width={32} height={32}>
        <Pie data={data} cx={14} cy={14} innerRadius={10} outerRadius={14} dataKey="value" startAngle={90} endAngle={-270}>
          <Cell fill={color} />
          <Cell fill="#e5e7eb" />
        </Pie>
      </PieChart>
    </div>
  );
}

export default function AdminMetrics() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Filters & State
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [accountType, setAccountType] = useState('');
  const [transactionType, setTransactionType] = useState<TransactionType | ''>('');
  const [status, setStatus] = useState<TransactionStatus | ''>('');
  const [currency, setCurrency] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  // New Transaction Form State
  const [newAccountId, setNewAccountId] = useState('ACC-100234');
  const [newPayeeName, setNewPayeeName] = useState('');
  const [newPayeeAccNo, setNewPayeeAccNo] = useState('ACC-908123');
  const [newAmount, setNewAmount] = useState('');
  const [newTxType, setNewTxType] = useState<TransactionType>('DEBIT');
  const [newDesc, setNewDesc] = useState('');

  // API Query
  const { data: pagedData, isLoading } = useQuery({
    queryKey: ['transactions', page, status, transactionType],
    queryFn: () => getTransactions({
      page,
      size: 8,
      status: status || undefined,
      transactionType: transactionType || undefined,
    }),
  });

  // Mutation to create new transaction
  const createMutation = useMutation({
    mutationFn: () => createTransaction({
      accountId: newAccountId,
      payeeId: `PAY-${Date.now().toString().slice(-4)}`,
      payeeName: newPayeeName || 'Vendor Merchant',
      amount: parseFloat(newAmount) || 100,
      currency: 'USD',
      transactionType: newTxType,
      description: newDesc || 'Online Purchase',
    }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setIsNewModalOpen(false);
      setNewPayeeName('');
      setNewAmount('');
      setNewDesc('');
    },
  });

  // Mock Fallback Transactions list matching the exact sample reference UI
  const fallbackTransactions = [
    { transactionId: 10032, timestamp: '2024-05-21T10:30:00Z', accountId: '1234567890', accountName: 'John Smith', payeeName: 'Amazon Marketplace', payeeCategory: 'Online Shopping', amount: 1540.00, currency: 'USD', transactionType: 'DEBIT' as TransactionType, status: 'COMPLETED' as TransactionStatus, channel: 'Online Banking' },
    { transactionId: 10031, timestamp: '2024-05-21T09:45:00Z', accountId: '9876543210', accountName: 'Maria Garcia', payeeName: 'Starbucks Coffee', payeeCategory: 'Food & Beverages', amount: 15.60, currency: 'USD', transactionType: 'DEBIT' as TransactionType, status: 'COMPLETED' as TransactionStatus, channel: 'Mobile App' },
    { transactionId: 10030, timestamp: '2024-05-21T08:20:00Z', accountId: '1234567890', accountName: 'John Smith', payeeName: 'Salary Credit', payeeCategory: 'Acme Corp', amount: 5200.00, currency: 'USD', transactionType: 'CREDIT' as TransactionType, status: 'COMPLETED' as TransactionStatus, channel: 'Internal Transfer' },
    { transactionId: 10029, timestamp: '2024-05-21T07:15:00Z', accountId: '5566778899', accountName: 'Robert Brown', payeeName: 'Shell Oil Station', payeeCategory: 'Fuel', amount: 65.40, currency: 'USD', transactionType: 'DEBIT' as TransactionType, status: 'COMPLETED' as TransactionStatus, channel: 'Card Payment' },
    { transactionId: 10028, timestamp: '2024-05-20T22:45:00Z', accountId: '1234567890', accountName: 'John Smith', payeeName: 'Netflix Subscription', payeeCategory: 'Entertainment', amount: 15.99, currency: 'USD', transactionType: 'DEBIT' as TransactionType, status: 'COMPLETED' as TransactionStatus, channel: 'Online Banking' },
    { transactionId: 10027, timestamp: '2024-05-20T20:30:00Z', accountId: '9876543210', accountName: 'Maria Garcia', payeeName: 'Electricity Board', payeeCategory: 'Utility Payment', amount: 86.00, currency: 'USD', transactionType: 'DEBIT' as TransactionType, status: 'PENDING' as TransactionStatus, channel: 'Mobile App' },
    { transactionId: 10026, timestamp: '2024-05-20T18:00:00Z', accountId: '1122334455', accountName: 'James Wilson', payeeName: 'John Doe', payeeCategory: 'Personal Transfer', amount: 750.00, currency: 'USD', transactionType: 'CREDIT' as TransactionType, status: 'COMPLETED' as TransactionStatus, channel: 'UPI Transfer' },
    { transactionId: 10025, timestamp: '2024-05-20T16:30:00Z', accountId: '6677889900', accountName: 'Sarah Lee', payeeName: 'Flipkart Online', payeeCategory: 'Shopping', amount: 120.00, currency: 'USD', transactionType: 'DEBIT' as TransactionType, status: 'FAILED' as TransactionStatus, channel: 'Card Payment' },
  ];

  const transactionsList = (pagedData?.content || []).map(t => ({
    ...t,
    payeeName: t.payeeName || t.payeeId || 'Merchant Payee',
    accountName: t.accountName || t.accountId || 'Account Holder',
    payeeCategory: 'General Payment',
    channel: t.transactionType === 'CREDIT' ? 'Internal Transfer' : 'Online Banking',
  }));

  // Filter client side for search
  const filteredRows = transactionsList.filter(t =>
    t.payeeName.toLowerCase().includes(search.toLowerCase()) ||
    t.accountId.includes(search) ||
    t.transactionId.toString().includes(search)
  );

  // Chart data
  const volumeTrendData = [
    { date: 'May 15', amount: 850000 },
    { date: 'May 16', amount: 980000 },
    { date: 'May 17', amount: 910000 },
    { date: 'May 18', amount: 1050000 },
    { date: 'May 19', amount: 1254750 },
    { date: 'May 20', amount: 1120000 },
    { date: 'May 21', amount: 1180000 },
  ];

  const typeDonutData = [
    { name: 'Debit', value: 7126, color: '#ef4444' },
    { name: 'Credit', value: 5327, color: '#22c55e' },
  ];

  const topMerchants = [
    { name: 'Amazon Marketplace', count: 1245, pct: 100 },
    { name: 'Flipkart', count: 945, pct: 75 },
    { name: 'Starbucks Coffee', count: 743, pct: 60 },
    { name: 'Netflix', count: 542, pct: 43 },
    { name: 'Shell Oil Station', count: 412, pct: 33 },
  ];

  const clearFilters = () => {
    setSearch('');
    setAccountType('');
    setTransactionType('');
    setStatus('');
    setCurrency('');
    setPage(0);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Breadcrumb & Top Bar ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Dashboard</span>
            <span>›</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">Transactions</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-gray-900 dark:text-white">Transactions</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>May 15, 2024 - May 21, 2024</span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="w-56 rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-blue-500 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters</span>
          </button>

          <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </button>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* ── Row 1 — 6 KPI Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {/* Card 1 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Total Transactions</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">12,453</p>
              <span className="mt-1 flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
                <TrendingUp className="h-3 w-3" /> +15.8% from last week
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30">
              <Landmark className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <Sparkline data={[10000, 11200, 10800, 11800, 12453]} color="#2563eb" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Total Amount</p>
              <p className="mt-1 text-xl font-black text-gray-900 dark:text-white">$1,254,750.00</p>
              <span className="mt-1 flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
                <TrendingUp className="h-3 w-3" /> +18.4% from last week
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <Sparkline data={[850000, 980000, 910000, 1050000, 1254750]} color="#22c55e" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Average Amount</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">$100.78</p>
              <span className="mt-1 flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
                <TrendingUp className="h-3 w-3" /> +6.3% from last week
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <Sparkline data={[92, 95, 94, 98, 100.78]} color="#8b5cf6" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Debit Transactions</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">7,126</p>
              <span className="mt-1 text-[10px] text-gray-400">57.2% of total</span>
            </div>
            <RingProgress value={7126} total={12453} color="#ef4444" />
          </div>
        </div>

        {/* Card 5 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Credit Transactions</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">5,327</p>
              <span className="mt-1 text-[10px] text-gray-400">42.8% of total</span>
            </div>
            <RingProgress value={5327} total={12453} color="#22c55e" />
          </div>
        </div>

        {/* Card 6 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Success Rate</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">98.7%</p>
              <span className="mt-1 flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
                <TrendingUp className="h-3 w-3" /> +1.2% from last week
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <Sparkline data={[97.2, 97.8, 98.1, 98.4, 98.7]} color="#f59e0b" />
          </div>
        </div>
      </div>

      {/* ── Row 2 — Filter Toolbar ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
          <span>Account Type</span>
          <select
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">All</option>
            <option value="PERSONAL">Personal</option>
            <option value="BUSINESS">Business</option>
            <option value="CORPORATE">Corporate</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
          <span>Transaction Type</span>
          <select
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value as TransactionType)}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">All</option>
            <option value="DEBIT">Debit</option>
            <option value="CREDIT">Credit</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
          <span>Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TransactionStatus)}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">All</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
          <span>Currency</span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">All</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="INR">INR</option>
          </select>
        </div>

        <button
          onClick={clearFilters}
          className="ml-auto flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Clear Filters</span>
        </button>
      </div>

      {/* ── Row 3 — Enterprise Data Table ───────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50/80 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:bg-gray-800/80 dark:text-gray-400">
            <tr>
              <th className="px-5 py-3.5">Transaction ID</th>
              <th className="px-5 py-3.5">Date & Time</th>
              <th className="px-5 py-3.5">Account</th>
              <th className="px-5 py-3.5">Payee / Merchant</th>
              <th className="px-5 py-3.5">Amount</th>
              <th className="px-5 py-3.5">Currency</th>
              <th className="px-5 py-3.5">Type</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Channel</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredRows.map((row) => (
              <tr key={row.transactionId} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition">
                <td className="px-5 py-3.5 font-semibold text-gray-800 dark:text-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      👤
                    </div>
                    <span>TXN-{row.transactionId}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">
                  {formatDate(row.timestamp)}
                </td>
                <td className="px-5 py-3.5">
                  <p className="font-mono font-medium text-gray-800 dark:text-gray-200">{row.accountId}</p>
                  <p className="text-[10px] text-gray-400">{row.accountName}</p>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <MerchantIcon name={row.payeeName} />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{row.payeeName}</p>
                      <p className="text-[10px] text-gray-400">{row.payeeCategory}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 font-bold">
                  <span className={row.transactionType === 'DEBIT' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}>
                    {row.transactionType === 'DEBIT' ? '-' : '+'}{formatCurrency(row.amount, row.currency)}
                  </span>
                </td>
                <td className="px-5 py-3.5 font-semibold text-gray-500">
                  {row.currency}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold ${
                    row.transactionType === 'DEBIT'
                      ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                      : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                  }`}>
                    {row.transactionType === 'DEBIT' ? 'Debit' : 'Credit'}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    row.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                    row.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {row.status.charAt(0) + row.status.slice(1).toLowerCase()}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <ChannelBadge channel={row.channel} />
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setSelectedTx(row)}
                      className="rounded p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setSelectedTx(row)}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer Pagination */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-white px-5 py-3 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900">
          <span>Showing 1 to {filteredRows.length} of 12,453 transactions</span>
          <div className="flex items-center gap-1">
            <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">‹</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-sm">1</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">2</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">3</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">4</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">5</button>
            <span>…</span>
            <button className="flex h-7 px-2 items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">1,557</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">›</button>
          </div>
        </div>
      </div>

      {/* ── Row 4 — Analytics Charts ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Transaction Amount Over Time */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Transaction Amount Over Time</h2>
            <select className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={volumeTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="amtGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2.5} fill="url(#amtGrad)" dot={{ r: 3, fill: '#2563eb' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Transactions by Type */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Transactions by Type</h2>
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <PieChart width={150} height={150}>
                <Pie data={typeDonutData} cx={70} cy={70} innerRadius={48} outerRadius={68} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                  {typeDonutData.map(e => <Cell key={e.name} fill={e.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-gray-900 dark:text-white">12,453</span>
                <span className="text-[10px] text-gray-400">Total</span>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-red-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">Debit</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">7,126 <span className="font-normal text-gray-400">(57.2%)</span></span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">Credit</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">5,327 <span className="font-normal text-gray-400">(42.8%)</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Merchants */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Top Merchants</h2>
            <a href="#" className="text-xs font-semibold text-blue-600 hover:underline">View All</a>
          </div>
          <div className="space-y-3">
            {topMerchants.map((m) => (
              <div key={m.name} className="flex items-center gap-3">
                <MerchantIcon name={m.name} />
                <div className="flex-1">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{m.name}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{m.count.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${m.pct}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Modal — Create New Transaction ──────────────────────────────── */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create New Transaction</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-gray-700 dark:text-gray-300">Account ID</label>
                <input
                  type="text"
                  value={newAccountId}
                  onChange={(e) => setNewAccountId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-gray-700 dark:text-gray-300">Payee / Merchant Name</label>
                <input
                  type="text"
                  value={newPayeeName}
                  onChange={(e) => setNewPayeeName(e.target.value)}
                  placeholder="e.g. Amazon Marketplace"
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-gray-700 dark:text-gray-300">Payee Account Number</label>
                <input
                  type="text"
                  value={newPayeeAccNo}
                  onChange={(e) => setNewPayeeAccNo(e.target.value)}
                  placeholder="e.g. ACC-908123"
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-mono outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-gray-700 dark:text-gray-300">Amount ($)</label>
                <input
                  type="number"
                  step="any"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="150.00"
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-gray-700 dark:text-gray-300">Transaction Type</label>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-bold text-red-600 dark:border-gray-700 dark:bg-gray-800">
                  DEBIT (Outward Transfer)
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-gray-700 dark:text-gray-300">Description</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Payment description..."
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                disabled={createMutation.isPending || !newPayeeName || !newAmount}
                onClick={() => createMutation.mutate()}
                className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating...' : 'Submit Transaction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal — View Transaction Details ──────────────────────────────── */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MerchantIcon name={selectedTx.payeeName} />
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Transaction #{selectedTx.transactionId}</h3>
                  <p className="text-xs text-gray-400">{selectedTx.payeeName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedTx(null)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-3.5 dark:bg-gray-800">
                <div><span className="text-gray-400">Account ID:</span> <strong className="block text-gray-900 dark:text-white font-mono">{selectedTx.accountId}</strong></div>
                <div><span className="text-gray-400">Account Holder:</span> <strong className="block text-gray-900 dark:text-white">{selectedTx.accountName || 'John Smith'}</strong></div>
                <div><span className="text-gray-400">Amount:</span> <strong className="block text-base font-black text-gray-900 dark:text-white">{formatCurrency(selectedTx.amount)}</strong></div>
                <div><span className="text-gray-400">Type & Channel:</span> <span className="block font-semibold text-blue-600">{selectedTx.transactionType} ({selectedTx.channel || 'Online Banking'})</span></div>
                <div><span className="text-gray-400">Status:</span> <span className="block font-bold text-emerald-600">{selectedTx.status}</span></div>
                <div><span className="text-gray-400">Timestamp:</span> <span className="block text-gray-600 dark:text-gray-300 font-mono">{formatDate(selectedTx.timestamp)}</span></div>
              </div>

              <div>
                <p className="mb-1 font-bold text-gray-700 dark:text-gray-300">Transaction Raw Event Data</p>
                <pre className="overflow-x-auto rounded-xl border border-gray-200 bg-gray-950 p-3 font-mono text-[11px] text-emerald-400">
                  {JSON.stringify({
                    transactionId: selectedTx.transactionId,
                    accountId: selectedTx.accountId,
                    payeeName: selectedTx.payeeName,
                    amount: selectedTx.amount,
                    currency: selectedTx.currency || 'USD',
                    type: selectedTx.transactionType,
                    status: selectedTx.status,
                    channel: selectedTx.channel || 'Online Banking',
                    timestamp: selectedTx.timestamp
                  }, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
