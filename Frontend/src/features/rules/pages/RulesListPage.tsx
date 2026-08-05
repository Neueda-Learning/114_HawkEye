import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer
} from 'recharts';
import {
  Search, Filter, Download, Plus, Calendar, Pencil, Trash2,
  RotateCcw, Shield, ShieldCheck, CheckCircle2, Clock, Zap,
  TrendingUp, TrendingDown, Eye, Sliders, AlertOctagon,
  ArrowRight, ToggleLeft, ToggleRight
} from 'lucide-react';
import { getRules, deleteRule, toggleRule } from '@/lib/api/rules';
import { getAlertStats } from '@/lib/api/alerts';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { toast } from '@/components/common/Toast';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { Rule, RuleStatus, Severity, RuleType } from '@/lib/types';

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

// Ring Progress Indicator
function RingProgress({ value, total, color }: { value: number; total: number; color: string }) {
  const data = [{ value }, { value: Math.max(0, total - value) }];
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

export default function RulesListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // State
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [ruleType, setRuleType] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severity, setSeverity] = useState('');
  const [category, setCategory] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Rule | null>(null);

  // Queries
  const { data: pagedData, isLoading } = useQuery({
    queryKey: ['rules', page, activeTab, ruleType, statusFilter, severity],
    queryFn: () => getRules({
      page,
      size: 8,
      status: (activeTab !== 'ALL' ? activeTab : statusFilter) as RuleStatus || undefined,
      ruleType: ruleType as RuleType || undefined,
      severity: severity as Severity || undefined,
    }),
  });

  const { data: allRulesData } = useQuery({ queryKey: ['rules', 'all-total'], queryFn: () => getRules({ size: 100 }) });
  const { data: activeRulesData } = useQuery({ queryKey: ['rules', 'active-total'], queryFn: () => getRules({ status: 'ACTIVE', size: 100 }) });
  const { data: alertStatsData } = useQuery({ queryKey: ['alerts', 'stats-rules-page'], queryFn: getAlertStats });

  // Dynamic Metrics (backend-backed only)
  const allRules = allRulesData?.content ?? [];
  const liveTotalRules = allRulesData?.totalElements ?? pagedData?.totalElements ?? 0;
  const liveActiveRules = activeRulesData?.totalElements ?? 0;
  const liveInactiveRules = Math.max(0, liveTotalRules - liveActiveRules);
  const liveTriggeredCount = Number((alertStatsData as { total?: number } | undefined)?.total ?? 0);

  const severityCounts = allRules.reduce<Record<Severity, number>>(
    (acc, rule) => {
      acc[rule.severity] = (acc[rule.severity] ?? 0) + 1;
      return acc;
    },
    { HIGH: 0, MEDIUM: 0, LOW: 0, CRITICAL: 0 },
  );

  const typeLabelMap: Partial<Record<RuleType, string>> = {
    AMOUNT_THRESHOLD: 'Amount Based',
    VELOCITY: 'Velocity Based',
    NEW_PAYEE: 'Payee Based',
    DAILY_LIMIT: 'Daily Limit Based',
  };

  const typeCountMap = allRules.reduce<Record<string, number>>((acc, rule) => {
    const label = typeLabelMap[rule.ruleType] ?? rule.ruleType;
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});

  const typeColors = ['#2563eb', '#f59e0b', '#22c55e', '#8b5cf6', '#ec4899', '#9ca3af'];
  const typeDonutData = Object.entries(typeCountMap).map(([name, value], index) => ({
    name,
    value,
    color: typeColors[index % typeColors.length],
  }));

  const severityDonutData = [
    { name: 'High', value: severityCounts.HIGH, color: '#ef4444' },
    { name: 'Medium', value: severityCounts.MEDIUM, color: '#f59e0b' },
    { name: 'Low', value: severityCounts.LOW, color: '#22c55e' },
    { name: 'Critical', value: severityCounts.CRITICAL, color: '#3b82f6' },
  ].filter((entry) => entry.value > 0);

  const liveHighSeverityRules = severityCounts.HIGH;
  const highSeverityRatio = liveTotalRules > 0 ? Math.round((liveHighSeverityRules / liveTotalRules) * 100) : 0;

  const flatTrend = (value: number) => Array.from({ length: 5 }, () => value);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRule(id, user?.email ?? 'admin', 'Deleted from rules list'),
    onSuccess: () => {
      toast.success('Rule deleted successfully');
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
    onError: () => toast.error('Failed to delete rule'),
  });

  // Toggle mutation
  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      toggleRule(id, { active, performedBy: user?.email ?? 'admin', reason: 'Toggled status' }),
    onSuccess: (_updated, variables) => {
      toast.success(`Rule ${variables.active ? 'activated' : 'deactivated'}`);
      void queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
    onError: () => toast.error('Failed to update rule status'),
  });

  const rulesList = (pagedData?.content || []).map(r => ({
    ...r,
    ruleId: r.ruleId || (r as any).id || 1,
    ruleName: r.ruleName || (r as any).name || 'Rule',
    ruleType: r.ruleType || 'AMOUNT_THRESHOLD',
    category: `${(r.ruleType || 'GENERAL').split('_')[0]} Based`,
    condition: r.ruleType === 'AMOUNT_THRESHOLD' ? `Amount > $${r.parameters?.thresholdAmount || 1000}` : r.ruleType === 'VELOCITY' ? `≥ ${r.parameters?.velocityCount || 3} txns in ${r.parameters?.velocityWindowMinutes || 60} mins` : r.ruleType === 'NEW_PAYEE' ? 'New Unregistered Payee' : `Daily Total > $${r.parameters?.dailyLimitAmount || 2000}`,
    timeWindow: r.ruleType === 'VELOCITY' ? `${r.parameters?.velocityWindowMinutes || 60} Mins` : 'Per Transaction',
    lastTriggered: r.updatedAt || r.createdAt || new Date().toISOString(),
  }));

  // Filter client side with null-safe string guards
  const filteredRows = rulesList.filter(r =>
    (r.ruleName ?? '').toLowerCase().includes((search ?? '').toLowerCase()) ||
    (r.ruleType ?? '').toLowerCase().includes((search ?? '').toLowerCase())
  );

  const clearFilters = () => {
    setSearch('');
    setActiveTab('ALL');
    setRuleType('');
    setStatusFilter('');
    setSeverity('');
    setCategory('');
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
            <span className="font-semibold text-blue-600 dark:text-blue-400">Rules</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-gray-900 dark:text-white">Rules</h1>
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
              placeholder="Search rules..."
              className="w-56 rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-blue-500 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <button
            onClick={() => navigate('/admin/rules/new')}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add Rule</span>
          </button>
        </div>
      </div>

      {/* ── Row 1 — 6 KPI Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {/* Card 1 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Total Rules</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{liveTotalRules}</p>
              <span className="mt-1 text-[10px] text-gray-400">Live backend count</span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <Sparkline data={flatTrend(liveTotalRules)} color="#2563eb" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Active Rules</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{liveActiveRules}</p>
              <span className="mt-1 text-[10px] text-gray-400">Live backend count</span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <Sparkline data={flatTrend(liveActiveRules)} color="#22c55e" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Inactive Rules</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{liveInactiveRules}</p>
              <span className="mt-1 text-[10px] text-gray-400">Derived from active vs total</span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <Sparkline data={flatTrend(liveInactiveRules)} color="#8b5cf6" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Triggered Alerts (Total)</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{liveTriggeredCount}</p>
              <span className="mt-1 text-[10px] text-gray-400">Live backend count</span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <Sparkline data={flatTrend(liveTriggeredCount)} color="#f59e0b" />
          </div>
        </div>

        {/* Card 5 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">High Severity Rules</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{liveHighSeverityRules}</p>
              <span className="mt-1 text-[10px] text-gray-400">{highSeverityRatio}% of total rules</span>
            </div>
            <RingProgress value={liveHighSeverityRules} total={Math.max(1, liveTotalRules)} color="#ef4444" />
          </div>
        </div>

        {/* Card 6 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Avg. Response Time</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">N/A</p>
              <span className="mt-1 text-[10px] text-gray-400">No backend metric exposed</span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <Sparkline data={flatTrend(0)} color="#06b6d4" />
          </div>
        </div>
      </div>

      {/* ── Row 2 — Status Tabs & Filter Toolbar ─────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        {/* Tabs */}
        <div className="flex items-center gap-1 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('ALL'); setPage(0); }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition ${
              activeTab === 'ALL'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            <span>All Rules</span>
          </button>

          <button
            onClick={() => { setActiveTab('ACTIVE'); setPage(0); }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition ${
              activeTab === 'ACTIVE'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            <span>Active Rules</span>
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              {liveActiveRules}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('INACTIVE'); setPage(0); }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition ${
              activeTab === 'INACTIVE'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            <span>Inactive Rules</span>
            <span className="rounded-full bg-gray-100 px-1.5 py-0.2 text-[10px] font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              {liveInactiveRules}
            </span>
          </button>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <span>Rule Type</span>
            <select
              value={ruleType}
              onChange={(e) => setRuleType(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All</option>
              <option value="AMOUNT_THRESHOLD">Amount Threshold</option>
              <option value="VELOCITY">Velocity</option>
              <option value="NEW_PAYEE">New Payee</option>
              <option value="LOCATION">Location</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <span>Severity</span>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Clear Filters</span>
          </button>

          <div className="ml-2 flex items-center gap-2">
            <button className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
              <Sliders className="h-3.5 w-3.5" /> Columns
            </button>
            <button className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
          </div>
        </div>
      </div>

      {/* ── Row 3 — Enterprise Rules Data Table ────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50/80 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:bg-gray-800/80 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3.5 w-8">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="px-4 py-3.5">Rule Name</th>
              <th className="px-4 py-3.5">Rule Type</th>
              <th className="px-4 py-3.5">Category</th>
              <th className="px-4 py-3.5">Threshold / Condition</th>
              <th className="px-4 py-3.5">Severity</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Time Window</th>
              <th className="px-4 py-3.5">Last Triggered</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredRows.map((row) => (
              <tr
                key={row.ruleId}
                onClick={() => navigate(`/admin/rules/${row.ruleId}`)}
                className="cursor-pointer hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition"
              >
                <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="rounded border-gray-300" />
                </td>
                <td className="px-4 py-3.5 font-bold text-gray-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>{row.ruleName}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300">
                  {row.ruleType}
                </td>
                <td className="px-4 py-3.5 text-gray-500 font-medium">
                  {row.category}
                </td>
                <td className="px-4 py-3.5 font-mono text-gray-800 dark:text-gray-200">
                  {row.condition}
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    row.severity === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                    row.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                  }`}>
                    {row.severity.charAt(0) + row.severity.slice(1).toLowerCase()}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                    row.status === 'ACTIVE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${row.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    {row.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-gray-500">
                  {row.timeWindow}
                </td>
                <td className="px-4 py-3.5 text-gray-400">
                  {formatDate(row.lastTriggered)}
                </td>
                <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => navigate(`/admin/rules/${row.ruleId}/edit`)}
                      className="rounded p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                      title="Edit Rule"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => toggleMutation.mutate({ id: row.ruleId, active: row.status !== 'ACTIVE' })}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-amber-600 dark:hover:bg-gray-800"
                      title={row.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    >
                      {row.status === 'ACTIVE' ? <ToggleRight className="h-4 w-4 text-emerald-500" /> : <ToggleLeft className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => setDeleteTarget(row as unknown as Rule)}
                      className="rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                      title="Delete Rule"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer Pagination */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-white px-5 py-3 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900">
          <span>Showing {filteredRows.length} on this page of {liveTotalRules} rules</span>
          <div className="flex items-center gap-1">
            <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">‹</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-sm">1</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">2</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">3</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">4</button>
            <span>…</span>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">8</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">›</button>
          </div>
        </div>
      </div>

      {/* ── Row 4 — Analytics & Visual Rule Logic Builder Diagram ──────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Rules by Type Donut */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Rules by Type</h2>
            <a href="#" className="text-xs font-semibold text-blue-600 hover:underline">View All</a>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <PieChart width={140} height={140}>
                <Pie data={typeDonutData} cx={65} cy={65} innerRadius={44} outerRadius={64} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                  {typeDonutData.map(e => <Cell key={e.name} fill={e.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-gray-900 dark:text-white">{liveTotalRules}</span>
                <span className="text-[10px] text-gray-400">Total</span>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-1 text-[10px]">
              {typeDonutData.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: d.color }} />
                    <span className="text-gray-600 dark:text-gray-300">{d.name}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rules by Severity Donut */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Rules by Severity</h2>
            <a href="#" className="text-xs font-semibold text-blue-600 hover:underline">View All</a>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <PieChart width={140} height={140}>
                <Pie data={severityDonutData} cx={65} cy={65} innerRadius={44} outerRadius={64} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                  {severityDonutData.map(e => <Cell key={e.name} fill={e.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-gray-900 dark:text-white">{liveTotalRules}</span>
                <span className="text-[10px] text-gray-400">Total</span>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-1 text-[10px]">
              {severityDonutData.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: d.color }} />
                    <span className="text-gray-600 dark:text-gray-300">{d.name}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Example Rule Logic Workflow Diagram */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Example Rule Logic</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Visual Diagram Panel */}
            <div className="md:col-span-2 rounded-xl border border-purple-100 bg-purple-50/40 p-4 dark:border-purple-900/30 dark:bg-purple-950/20">
              <span className="inline-block rounded-lg bg-purple-100 px-2.5 py-1 text-xs font-bold text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                High Amount Rule
              </span>

              <div className="mt-4 flex flex-col items-center justify-center gap-2 text-xs">
                {/* IF Node */}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-700 dark:text-purple-300">IF</span>
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-mono text-[11px] font-semibold text-emerald-800 shadow-sm dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Amount &gt; ₹50,000
                  </div>
                </div>

                <div className="h-3 w-0.5 bg-purple-300 dark:bg-purple-700" />

                {/* AND Node */}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-700 dark:text-purple-300">AND</span>
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-mono text-[11px] font-semibold text-emerald-800 shadow-sm dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Transaction Type = Debit
                  </div>
                </div>

                <div className="h-3 w-0.5 bg-purple-300 dark:bg-purple-700" />

                {/* THEN Node */}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-700 dark:text-purple-300">THEN</span>
                </div>

                <div className="mt-1 flex items-center gap-1.5 rounded-xl bg-red-100 px-4 py-2 text-xs font-bold text-red-700 shadow-sm dark:bg-red-900/40 dark:text-red-300">
                  <AlertOctagon className="h-4 w-4" />
                  <span>Generate High Severity Alert</span>
                </div>
              </div>
            </div>

            {/* Inspector Panel */}
            <div className="space-y-2.5 text-[11px] border-l border-gray-100 pl-4 dark:border-gray-800">
              <div className="flex justify-between">
                <span className="text-gray-400">Rule Type</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">Amount Threshold</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Severity</span>
                <span className="font-bold text-red-600">High</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className="font-semibold text-emerald-600">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Time Window</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">Per Transaction</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Created On</span>
                <span className="text-gray-500">May 10, 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Modified</span>
                <span className="text-gray-500">May 18, 2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Rule"
        message={`Are you sure you want to delete "${deleteTarget?.ruleName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.ruleId)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
