import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, UserCheck, Shield, AlertCircle, ArrowRight, Lock, Activity } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '@/lib/types';

const ROLE_HOME: Record<UserRole, string> = {
  CUSTOMER: '/customer/dashboard',
  ANALYST:  '/alerts',
  ADMIN:    '/admin/dashboard',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'ADMIN' | 'ANALYST' | 'USER'>('ADMIN');
  const [email, setEmail] = useState('admin@hawkeye.com');
  const [password, setPassword] = useState('password123');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const handleTabChange = (roleTab: 'ADMIN' | 'ANALYST' | 'USER') => {
    setActiveTab(roleTab);
    setAuthError('');
    if (roleTab === 'ADMIN') {
      setEmail('admin@hawkeye.com');
      setPassword('password123');
    } else if (roleTab === 'ANALYST') {
      setEmail('analyst@hawkeye.com');
      setPassword('password123');
    } else {
      setEmail('customer@hawkeye.com');
      setPassword('password123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      await login(email, password);
      const userRole = useAuthStore.getState().user!.role;
      const dest = from ?? ROLE_HOME[userRole];
      navigate(dest, { replace: true });
    } catch (err: any) {
      setAuthError(err?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B132B] p-4 text-white">
      <div className="w-full max-w-2xl animate-fade-in">
        {/* Logo & Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 shadow-xl shadow-blue-500/10">
            <ShieldCheck className="h-9 w-9 text-blue-400" />
          </div>
          <h1 className="text-3xl font-black tracking-wider text-white">HAWKEYE</h1>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-blue-400">
            Transaction Monitoring & Alert System
          </p>
          <p className="mt-2 text-xs text-gray-400 max-w-md mx-auto">
            Enterprise Banking Operations, Fraud Detection & Real-Time Alert Lifecycle Platform
          </p>
        </div>

        {/* ── 3 Distinct Login Options Selector ──────────────────────────── */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* 1. Admin */}
          <button
            type="button"
            onClick={() => handleTabChange('ADMIN')}
            className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all ${
              activeTab === 'ADMIN'
                ? 'border-blue-500 bg-blue-600/20 text-white shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/50'
                : 'border-gray-800 bg-gray-900/60 text-gray-400 hover:border-gray-700 hover:text-gray-200'
            }`}
          >
            <Shield className={`h-6 w-6 mb-1.5 ${activeTab === 'ADMIN' ? 'text-blue-400' : 'text-gray-500'}`} />
            <span className="font-bold text-xs">1. Administrator Login</span>
            <span className="text-[10px] text-gray-400 mt-1">Full System Rules, Analytics & Config</span>
          </button>

          {/* 2. Analyst */}
          <button
            type="button"
            onClick={() => handleTabChange('ANALYST')}
            className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all ${
              activeTab === 'ANALYST'
                ? 'border-purple-500 bg-purple-600/20 text-white shadow-lg shadow-purple-500/10 ring-2 ring-purple-500/50'
                : 'border-gray-800 bg-gray-900/60 text-gray-400 hover:border-gray-700 hover:text-gray-200'
            }`}
          >
            <Activity className={`h-6 w-6 mb-1.5 ${activeTab === 'ANALYST' ? 'text-purple-400' : 'text-gray-500'}`} />
            <span className="font-bold text-xs">2. Analyst Login</span>
            <span className="text-[10px] text-gray-400 mt-1">Alert Investigation & Status Updates</span>
          </button>

          {/* 3. User */}
          <button
            type="button"
            onClick={() => handleTabChange('USER')}
            className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all ${
              activeTab === 'USER'
                ? 'border-emerald-500 bg-emerald-600/20 text-white shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/50'
                : 'border-gray-800 bg-gray-900/60 text-gray-400 hover:border-gray-700 hover:text-gray-200'
            }`}
          >
            <UserCheck className={`h-6 w-6 mb-1.5 ${activeTab === 'USER' ? 'text-emerald-400' : 'text-gray-500'}`} />
            <span className="font-bold text-xs">3. User Login</span>
            <span className="text-[10px] text-gray-400 mt-1">Banking Operator & Transactions</span>
          </button>
        </div>

        {/* ── Login Form Card ────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/90 p-8 shadow-2xl backdrop-blur-md">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                {activeTab === 'ADMIN' ? 'Administrator Portal' : activeTab === 'ANALYST' ? 'Fraud Analyst Portal' : 'Banking Operator Portal'}
              </h2>
              <p className="text-xs text-gray-400">
                {activeTab === 'ADMIN'
                  ? 'Access full rules engine, system health, audit logs & analytics.'
                  : activeTab === 'ANALYST'
                  ? 'Access alert triage, investigation lifecycle & status transitions.'
                  : 'Create banking transactions & view transaction alerts status.'}
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
              activeTab === 'ADMIN' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
              activeTab === 'ANALYST' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {activeTab === 'ADMIN' ? 'ADMIN ROLE' : activeTab === 'ANALYST' ? 'ANALYST ROLE' : 'USER ROLE'}
            </span>
          </div>

          {authError && (
            <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-800 bg-gray-950 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-300">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-800 bg-gray-950 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <Lock className="absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-white shadow-lg transition disabled:opacity-50 ${
                activeTab === 'ADMIN' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' :
                activeTab === 'ANALYST' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20' :
                'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
              }`}
            >
              <span>{loading ? 'Authenticating...' : `Sign in as ${activeTab === 'ADMIN' ? 'Administrator' : activeTab === 'ANALYST' ? 'Analyst' : 'User'}`}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Pre-fill notice */}
          <div className="mt-6 border-t border-gray-800/80 pt-4 text-center">
            <p className="text-[11px] text-gray-400">
              Selected Credentials: <code className="font-mono text-blue-400">{email}</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
