import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, UserCheck, Shield, AlertCircle, ArrowRight, Lock } from 'lucide-react';
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

  const [activeTab, setActiveTab] = useState<'ADMIN' | 'USER'>('ADMIN');
  const [email, setEmail] = useState('admin@hawkeye.com');
  const [password, setPassword] = useState('password123');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const handleTabChange = (roleTab: 'ADMIN' | 'USER') => {
    setActiveTab(roleTab);
    setAuthError('');
    if (roleTab === 'ADMIN') {
      setEmail('admin@hawkeye.com');
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
      <div className="w-full max-w-xl animate-fade-in">
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
            Enterprise Banking Operations, Fraud Rules & Alert Status Lifecycle Platform
          </p>
        </div>

        {/* ── 2 Distinct Login Options Selector ──────────────────────────── */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          {/* 1. Admin */}
          <button
            type="button"
            onClick={() => handleTabChange('ADMIN')}
            className={`flex flex-col items-center justify-center rounded-2xl border p-5 text-center transition-all ${
              activeTab === 'ADMIN'
                ? 'border-blue-500 bg-blue-600/20 text-white shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/50'
                : 'border-gray-800 bg-gray-900/60 text-gray-400 hover:border-gray-700 hover:text-gray-200'
            }`}
          >
            <Shield className={`h-7 w-7 mb-2 ${activeTab === 'ADMIN' ? 'text-blue-400' : 'text-gray-500'}`} />
            <span className="font-bold text-sm">1. Administrator Login</span>
            <span className="text-[11px] text-gray-400 mt-1">Rules, Alert Status Changes & Analytics</span>
          </button>

          {/* 2. User */}
          <button
            type="button"
            onClick={() => handleTabChange('USER')}
            className={`flex flex-col items-center justify-center rounded-2xl border p-5 text-center transition-all ${
              activeTab === 'USER'
                ? 'border-emerald-500 bg-emerald-600/20 text-white shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/50'
                : 'border-gray-800 bg-gray-900/60 text-gray-400 hover:border-gray-700 hover:text-gray-200'
            }`}
          >
            <UserCheck className={`h-7 w-7 mb-2 ${activeTab === 'USER' ? 'text-emerald-400' : 'text-gray-500'}`} />
            <span className="font-bold text-sm">2. User Login</span>
            <span className="text-[11px] text-gray-400 mt-1">Banking Operations & Money Transfers</span>
          </button>
        </div>

        {/* ── Login Form Card ────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/90 p-8 shadow-2xl backdrop-blur-md">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                {activeTab === 'ADMIN' ? 'Administrator Portal' : 'User Operations Portal'}
              </h2>
              <p className="text-xs text-gray-400">
                {activeTab === 'ADMIN'
                  ? 'Manage fraud rules, alert investigation statuses & system metrics.'
                  : 'Create DEBIT banking transactions & manage source accounts.'}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${
              activeTab === 'ADMIN' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {activeTab === 'ADMIN' ? 'ADMIN ROLE' : 'USER ROLE'}
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
                  className="w-full rounded-xl border border-gray-800 bg-gray-950 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-9"
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-white transition shadow-lg ${
                activeTab === 'ADMIN'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
              }`}
            >
              <span>{loading ? 'Authenticating…' : `Sign In as ${activeTab === 'ADMIN' ? 'Administrator' : 'User'}`}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
