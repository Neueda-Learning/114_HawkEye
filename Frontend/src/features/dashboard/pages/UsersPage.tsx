import { useState } from 'react';
import {
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer,
  CartesianGrid, XAxis, YAxis, Tooltip
} from 'recharts';
import {
  Search, Filter, Download, Plus, Calendar, Pencil, MoreVertical,
  RotateCcw, Users, UserCheck, Shield, CheckCircle2, XCircle,
  Clock, TrendingUp, TrendingDown, Sliders, X
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from '@/components/common/Toast';

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

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [mfaFilter, setMfaFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Analyst');
  const [newDept, setNewDept] = useState('Fraud Management');

  // Fallback realistic users list matching exact reference sample
  const [usersList, setUsersList] = useState([
    { id: 1, name: 'fourgrads', titleRole: 'Administrator', email: 'fourgrads@tmas.com', role: 'Administrator', dept: 'IT Operations', status: 'Active', lastLogin: '2024-05-21T10:30:00Z', mfa: true },
    { id: 2, name: 'Sarah Lee', titleRole: 'Analyst', email: 'sarah.lee@tmas.com', role: 'Fraud Analyst', dept: 'Fraud Management', status: 'Active', lastLogin: '2024-05-21T09:45:00Z', mfa: true },
    { id: 3, name: 'Mike Johnson', titleRole: '', email: 'mike.johnson@tmas.com', role: 'Investigator', dept: 'Investigations', status: 'Active', lastLogin: '2024-05-21T08:20:00Z', mfa: true },
    { id: 4, name: 'Emily Davis', titleRole: 'Analyst', email: 'emily.davis@tmas.com', role: 'Fraud Analyst', dept: 'Fraud Management', status: 'Active', lastLogin: '2024-05-21T07:15:00Z', mfa: true },
    { id: 5, name: 'Robert Brown', titleRole: 'Analyst', email: 'robert.brown@tmas.com', role: 'Risk Analyst', dept: 'Risk & Compliance', status: 'Active', lastLogin: '2024-05-20T22:45:00Z', mfa: true },
    { id: 6, name: 'Jessica Wilson', titleRole: '', email: 'jessica.wilson@tmas.com', role: 'Investigator', dept: 'Investigations', status: 'Inactive', lastLogin: '2024-05-19T16:30:00Z', mfa: false },
    { id: 7, name: 'Daniel Martinez', titleRole: 'Admin', email: 'daniel.martinez@tmas.com', role: 'Administrator', dept: 'IT Operations', status: 'Active', lastLogin: '2024-05-21T11:20:00Z', mfa: true },
    { id: 8, name: 'Olivia Taylor', titleRole: 'Analyst', email: 'olivia.taylor@tmas.com', role: 'Fraud Analyst', dept: 'Fraud Management', status: 'Active', lastLogin: '2024-05-20T18:10:00Z', mfa: true },
  ]);

  const handleAddUser = () => {
    if (!newName || !newEmail) {
      toast.error('Please enter name and email');
      return;
    }
    const userObj = {
      id: Date.now(),
      name: newName,
      titleRole: newRole,
      email: newEmail,
      role: newRole,
      dept: newDept,
      status: 'Active',
      lastLogin: new Date().toISOString(),
      mfa: true,
    };
    setUsersList([userObj, ...usersList]);
    setIsAddModalOpen(false);
    toast.success(`User "${newName}" created successfully!`);
    setNewName('');
    setNewEmail('');
  };

  const handleToggleStatus = (id: number) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'Active' ? 'Inactive' : 'Active';
        toast.success(`User ${u.name} status updated to ${nextStatus}`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleToggleMfa = (id: number) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === id) {
        const nextMfa = !u.mfa;
        toast.success(`MFA ${nextMfa ? 'enabled' : 'disabled'} for ${u.name}`);
        return { ...u, mfa: nextMfa };
      }
      return u;
    }));
  };

  // Filter list
  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role.toLowerCase().includes(roleFilter.toLowerCase());
    const matchesDept = !deptFilter || u.dept.toLowerCase().includes(deptFilter.toLowerCase());
    const matchesStatus = !statusFilter || u.status.toUpperCase() === statusFilter.toUpperCase();
    const matchesMfa = !mfaFilter || (mfaFilter === 'ENABLED' ? u.mfa : !u.mfa);

    return matchesSearch && matchesRole && matchesDept && matchesStatus && matchesMfa;
  });

  // Chart data
  const roleDonutData = [
    { name: 'Administrators', value: 18, color: '#8b5cf6' },
    { name: 'Analysts', value: 62, color: '#f59e0b' },
    { name: 'Investigators', value: 22, color: '#22c55e' },
    { name: 'Risk Analysts', value: 14, color: '#3b82f6' },
    { name: 'Auditors', value: 12, color: '#9ca3af' },
  ];

  const deptProgressBars = [
    { name: 'Fraud Management', count: 46, pct: 100, share: '35.9%' },
    { name: 'Investigations', count: 28, pct: 60, share: '21.9%' },
    { name: 'IT Operations', count: 20, pct: 43, share: '15.6%' },
    { name: 'Risk & Compliance', count: 18, pct: 39, share: '14.1%' },
    { name: 'Audit', count: 16, pct: 34, share: '12.5%' },
  ];

  const mfaDonutData = [
    { name: 'Enabled', value: 111, color: '#22c55e' },
    { name: 'Disabled', value: 17, color: '#ef4444' },
  ];

  const activityLineData = [
    { date: 'May 15', count: 75 },
    { date: 'May 16', count: 60 },
    { date: 'May 17', count: 82 },
    { date: 'May 18', count: 55 },
    { date: 'May 19', count: 68 },
    { date: 'May 20', count: 90 },
    { date: 'May 21', count: 112 },
  ];

  const clearFilters = () => {
    setSearch('');
    setRoleFilter('');
    setDeptFilter('');
    setStatusFilter('');
    setMfaFilter('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Breadcrumb & Top Bar ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Dashboard</span>
            <span>›</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">Users</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-gray-900 dark:text-white">Users</h1>
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
              placeholder="Search users..."
              className="w-56 rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-blue-500 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* ── Row 1 — 6 KPI Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {/* Card 1 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Total Users</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">128</p>
              <span className="mt-1 flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
                <TrendingUp className="h-3 w-3" /> +12.5% from last week
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <Sparkline data={[110, 115, 118, 122, 128]} color="#2563eb" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Active Users</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">112</p>
              <span className="mt-1 flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
                <TrendingUp className="h-3 w-3" /> +8.6% from last week
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <Sparkline data={[98, 102, 105, 108, 112]} color="#22c55e" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Inactive Users</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">16</p>
              <span className="mt-1 flex items-center gap-0.5 text-[10px] font-semibold text-red-500">
                <TrendingDown className="h-3 w-3" /> -20% from last week
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <Sparkline data={[20, 19, 18, 17, 16]} color="#8b5cf6" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Administrators</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">18</p>
              <span className="mt-1 text-[10px] text-gray-400">14.1% of total users</span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
            <div className="h-full rounded-full bg-purple-600" style={{ width: '14.1%' }} />
          </div>
        </div>

        {/* Card 5 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Analysts</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">62</p>
              <span className="mt-1 text-[10px] text-gray-400">48.4% of total users</span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
            <div className="h-full rounded-full bg-amber-500" style={{ width: '48.4%' }} />
          </div>
        </div>

        {/* Card 6 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Last Login (Avg.)</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">2h 45m</p>
              <span className="mt-1 flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
                <TrendingUp className="h-3 w-3" /> +15% from last week
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <Sparkline data={[3.2, 3.0, 2.9, 2.8, 2.75]} color="#06b6d4" />
          </div>
        </div>
      </div>

      {/* ── Row 2 — Dropdown Filters Toolbar ──────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <span>Role</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All</option>
              <option value="Administrator">Administrator</option>
              <option value="Fraud Analyst">Fraud Analyst</option>
              <option value="Investigator">Investigator</option>
              <option value="Risk Analyst">Risk Analyst</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <span>Department</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All</option>
              <option value="IT Operations">IT Operations</option>
              <option value="Fraud Management">Fraud Management</option>
              <option value="Investigations">Investigations</option>
              <option value="Risk & Compliance">Risk & Compliance</option>
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
            <span>MFA Enabled</span>
            <select
              value={mfaFilter}
              onChange={(e) => setMfaFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All</option>
              <option value="ENABLED">Enabled</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>

          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Clear Filters</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
            <Sliders className="h-3.5 w-3.5" /> Columns
          </button>
        </div>
      </div>

      {/* ── Row 3 — Enterprise Users Data Table ────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50/80 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:bg-gray-800/80 dark:text-gray-400">
            <tr>
              <th className="px-5 py-3.5">User</th>
              <th className="px-5 py-3.5">Email</th>
              <th className="px-5 py-3.5">Role</th>
              <th className="px-5 py-3.5">Department</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Last Login</th>
              <th className="px-5 py-3.5">MFA</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition">
                <td className="px-5 py-3.5 font-bold text-gray-900 dark:text-white">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      {u.name.charAt(0)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">{u.name}</span>
                      {u.titleRole && (
                        <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                          u.titleRole === 'Administrator' || u.titleRole === 'Admin'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}>
                          {u.titleRole}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 font-mono text-gray-600 dark:text-gray-300">
                  {u.email}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    u.role === 'Administrator' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                    u.role === 'Fraud Analyst' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                    u.role === 'Investigator' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300 font-medium">
                  {u.dept}
                </td>
                <td className="px-5 py-3.5">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(u.id)}
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition ${
                      u.status === 'Active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    {u.status}
                  </button>
                </td>
                <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">
                  {formatDate(u.lastLogin)}
                </td>
                <td className="px-5 py-3.5">
                  <button
                    type="button"
                    onClick={() => handleToggleMfa(u.id)}
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition ${
                      u.mfa ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'
                    }`}
                  >
                    {u.mfa ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 text-gray-400" />}
                    {u.mfa ? 'Enabled' : 'Disabled'}
                  </button>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => toast.info(`Editing settings for ${u.name}`)}
                      className="rounded p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toast.info(`User options opened for ${u.name}`)}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer Pagination */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-white px-5 py-3 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900">
          <span>Showing 1 to {filteredUsers.length} of 128 users</span>
          <div className="flex items-center gap-1">
            <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">‹</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-sm">1</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">2</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">3</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">4</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">5</button>
            <span>…</span>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">16</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">›</button>
          </div>
        </div>
      </div>

      {/* ── Row 4 — Analytics Charts (4 Columns) ────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        {/* Users by Role Donut */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Users by Role</h2>
            <a href="#" className="text-xs font-semibold text-blue-600 hover:underline">View All</a>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <PieChart width={130} height={130}>
                <Pie data={roleDonutData} cx={60} cy={60} innerRadius={42} outerRadius={60} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                  {roleDonutData.map(e => <Cell key={e.name} fill={e.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-lg font-black text-gray-900 dark:text-white">128</span>
                <span className="text-[9px] text-gray-400">Total</span>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-1 text-[10px]">
              {roleDonutData.map(d => (
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

        {/* Users by Department Progress Bars */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Users by Department</h2>
            <a href="#" className="text-xs font-semibold text-blue-600 hover:underline">View All</a>
          </div>
          <div className="space-y-2.5">
            {deptProgressBars.map(dept => (
              <div key={dept.name}>
                <div className="mb-1 flex justify-between text-[11px]">
                  <span className="truncate font-medium text-gray-700 dark:text-gray-300">{dept.name}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{dept.count} <span className="font-normal text-gray-400">({dept.share})</span></span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${dept.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MFA Adoption Donut */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">MFA Adoption</h2>
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative">
              <PieChart width={140} height={140}>
                <Pie data={mfaDonutData} cx={65} cy={65} innerRadius={44} outerRadius={64} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                  {mfaDonutData.map(e => <Cell key={e.name} fill={e.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-gray-900 dark:text-white">87%</span>
                <span className="text-[10px] text-gray-400">Enabled</span>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-gray-500">111 of 128 users have MFA enabled</p>
            <div className="mt-3 flex items-center justify-center gap-6 text-xs">
              <span className="flex items-center gap-1 font-semibold text-emerald-600">● 111 Enabled</span>
              <span className="flex items-center gap-1 font-semibold text-red-500">● 17 Disabled</span>
            </div>
          </div>
        </div>

        {/* User Activity (Last 7 Days) Line Chart */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">User Activity (Last 7 Days)</h2>
            <a href="#" className="text-xs font-semibold text-blue-600 hover:underline">View All</a>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={activityLineData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} />
              <Tooltip formatter={(v: number) => [`${v} Active Users`, 'Count']} />
              <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, fill: '#2563eb' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Modal — Add New User ────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New User</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-gray-700 dark:text-gray-300">Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="alex.morgan@tmas.com"
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-gray-700 dark:text-gray-300">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Fraud Analyst">Fraud Analyst</option>
                  <option value="Investigator">Investigator</option>
                  <option value="Risk Analyst">Risk Analyst</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-gray-700 dark:text-gray-300">Department</label>
                <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="Fraud Management">Fraud Management</option>
                  <option value="Investigations">Investigations</option>
                  <option value="IT Operations">IT Operations</option>
                  <option value="Risk & Compliance">Risk & Compliance</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                disabled={!newName || !newEmail}
                onClick={handleAddUser}
                className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
