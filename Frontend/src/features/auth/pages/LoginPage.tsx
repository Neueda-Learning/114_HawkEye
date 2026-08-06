import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import CyberEye from '@/components/common/CyberEye';
import { Footer } from '@/components/layout/Footer';
import type { UserRole } from '@/lib/types';

const ROLE_HOME: Record<UserRole, string> = {
  CUSTOMER: '/customer/dashboard',
  ANALYST:  '/alerts',
  ADMIN:    '/admin/dashboard',
};

// Features implemented in HawkEye codebase
const HAWKEYE_LIVE_ALERTS = [
  { id: 'ALT-1082', user: 'John Doe', amount: '$45,000.00', rule: 'High Velocity Transfer (>5/60s)', severity: 'CRITICAL', status: 'OPEN' },
  { id: 'ALT-1083', user: 'Alice Smith', amount: '$12,500.00', rule: 'High Amount Threshold (>$10k)', severity: 'HIGH', status: 'INVESTIGATING' },
  { id: 'ALT-1084', user: 'Robert Chen', amount: '$85,000.00', rule: 'Cross-Border Anomaly', severity: 'CRITICAL', status: 'OPEN' },
  { id: 'ALT-1085', user: 'Maria Garcia', amount: '$3,200.00', rule: 'New Device Login', severity: 'MEDIUM', status: 'RESOLVED' },
];

const SHOWCASE_TABS: Array<'alerts' | 'rules' | 'analytics' | 'customer'> = [
  'alerts',
  'rules',
  'analytics',
  'customer',
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const [cardsReady, setCardsReady] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'USER' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  // Left Panel Auto-Cycling Showcase State
  const [activeTab, setActiveTab] = useState<'alerts' | 'rules' | 'analytics' | 'customer'>('alerts');
  const [alertIdx, setAlertIdx] = useState(0);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  // 1. Live Alert Feed Ticker
  useEffect(() => {
    if (!cardsReady) return;
    const interval = setInterval(() => {
      setAlertIdx((prev) => (prev + 1) % HAWKEYE_LIVE_ALERTS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [cardsReady]);

  // 2. Automated Rotation of Implemented Features Showcase (every 3.2s hands-free)
  useEffect(() => {
    if (!cardsReady) return;
    const tabTimer = setInterval(() => {
      setActiveTab((prevTab) => {
        const nextIdx = (SHOWCASE_TABS.indexOf(prevTab) + 1) % SHOWCASE_TABS.length;
        return SHOWCASE_TABS[nextIdx];
      });
    }, 3200);
    return () => clearInterval(tabTimer);
  }, [cardsReady]);

  // Select Role and Autofill Credentials
  const handleRoleSelect = (role: 'ADMIN' | 'USER') => {
    setSelectedRole(role);
    setAuthError('');
    if (role === 'ADMIN') {
      setEmail('admin@hawkeye.com');
      setPassword('password123');
    } else {
      setEmail('customer@hawkeye.com');
      setPassword('password123');
    }
  };

  const handleBackToRoleSelection = () => {
    setSelectedRole(null);
    setAuthError('');
  };

  // Submit Login
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
      setAuthError(err?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const [introStage, setIntroStage] = useState<'scanning' | 'verified'>('scanning');

  /* ── 100% DEAD-CENTERED CYBER EYE INTRO OVERLAY (RED SCANNING → NEON GREEN VERIFICATION & LIGHT THROW) ── */
  if (!cardsReady) {
    const isGreen = introStage === 'verified';
    return (
      <div className={`fixed inset-0 w-screen h-screen ${isGreen ? 'bg-[#030a06]' : 'bg-[#0a0305]'} text-[#e2f1ff] flex flex-col items-center justify-center overflow-hidden z-50 transition-colors duration-700`}>
        <div className={isGreen ? 'bgGridGreen' : 'bgGridRed'}></div>
        <div className={isGreen ? 'bgVignetteGreen' : 'bgVignetteRed'}></div>
        <div className="scanlineOverlay"></div>

        <div className="flex flex-col items-center justify-center gap-4 z-10 transform scale-110">
          <CyberEye
            onAnimationComplete={() => setCardsReady(true)}
            onStageChange={(st) => {
              if (st === 'verified') setIntroStage('verified');
            }}
          />
          <h1 className={`logoTitle text-3xl font-extrabold tracking-[8px] text-white uppercase transition-all duration-700 ${
            isGreen
              ? 'text-shadow-[0_0_20px_rgba(0,255,136,0.8)]'
              : 'text-shadow-[0_0_20px_rgba(255,59,59,0.8)]'
          }`}>
            HAWKEYE
          </h1>
          <p className={`text-xs font-bold uppercase tracking-[0.25em] transition-colors duration-700 ${
            isGreen ? 'text-[#00ff88]' : 'text-[#ff3b3b]'
          }`}>
            {isGreen ? 'System Verified • Access Granted' : 'Threat Inspection & Surveillance Engine'}
          </p>
        </div>
      </div>
    );
  }

  const currentAlert = HAWKEYE_LIVE_ALERTS[alertIdx];

  /* ── SPLIT-LAYOUT LOGIN PAGE WITH FOOTER ── */
  return (
    <div className="flex flex-col min-h-screen bg-[#0b1329]">
      <div className="hw-login-page flex-1">

        {/* ── LEFT SIDE: Implemented Features Showcase (55% Width) ── */}
        <div className="hw-login-left">
        
        {/* Header Logo — Perfectly proportioned CyberEye beside HAWKEYE title */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-3.5">
            <CyberEye initialStage="zoomed-out" variant="header" />
            <div>
              <div className="text-2xl font-black tracking-[6px] text-white uppercase">
                HAWKEYE
              </div>
              <div className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-[0.2em] -mt-0.5">
                Transaction Monitoring Platform
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00d2ff]/15 border border-[#00d2ff]/40 text-xs font-extrabold text-[#00d2ff] uppercase tracking-wider shadow-lg shadow-[#00d2ff]/10">
            <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-ping"></span>
            <span>Platform Active</span>
          </div>
        </div>

        {/* Hero Tagline & Interactive Auto-Cycling Showcase (Centered in Middle) */}
        <div className="my-auto py-4 z-10 space-y-6 flex flex-col items-center justify-center text-center w-full">
          
          <div className="text-center mx-auto space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black tracking-tight text-white leading-[1.12] text-center mx-auto">
              Monitor. Detect.<br />
              <span className="hw-tagline-accent">Protect.</span>
            </h1>
            <p className="text-sm sm:text-base font-semibold text-slate-200 leading-relaxed max-w-2xl text-center mx-auto">
              Comprehensive transaction surveillance engine featuring automated rules evaluation,
              real-time alert triage, and customer self-service banking.
            </p>
          </div>

          {/* Feature Showcase Tabs (Auto-Cycling hands-free) */}
          <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md w-full max-w-2xl shadow-xl mx-auto">
            {[
              { id: 'alerts', label: 'Alert Triage', icon: 'fa-triangle-exclamation' },
              { id: 'rules', label: 'Rules Engine', icon: 'fa-sliders' },
              { id: 'analytics', label: 'Analytics', icon: 'fa-chart-area' },
              { id: 'customer', label: 'Send Money', icon: 'fa-paper-plane' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 relative flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 ring-1 ring-blue-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <i className={`fa-solid ${tab.icon} ${isActive ? 'text-cyan-300 text-base' : 'text-slate-400'}`}></i>
                  <span>{tab.label}</span>

                  {/* Active tab progress bar */}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-cyan-300 rounded-full animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Showcase Display Card */}
          <div className="p-6 rounded-2xl bg-slate-900/95 border border-slate-700/90 backdrop-blur-xl shadow-2xl space-y-4 w-full max-w-2xl min-h-[230px] text-left mx-auto">
            
            {activeTab === 'alerts' && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-extrabold text-red-400 uppercase tracking-wider flex items-center gap-2">
                    <i className="fa-solid fa-bell text-red-400 text-xs animate-bounce"></i>
                    Real-time Alert Triage Stream
                  </span>
                  <span className="text-[11px] text-cyan-300 font-mono font-bold">Live Feed</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-300 border border-red-500/40 flex items-center justify-center text-sm font-bold">
                      <i className="fa-solid fa-triangle-exclamation"></i>
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-sm font-extrabold text-white">{currentAlert.id}</span>
                        <span className="font-mono text-xs font-bold text-cyan-300">{currentAlert.amount}</span>
                      </div>
                      <p className="text-xs text-slate-200 mt-0.5 font-semibold">{currentAlert.rule}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      currentAlert.severity === 'CRITICAL' ? 'bg-red-500/30 text-red-300 border border-red-500/40' : 'bg-amber-500/30 text-amber-300'
                    }`}>
                      {currentAlert.severity}
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">{currentAlert.user}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-0.5 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Open Alerts</span>
                    <span className="font-mono font-extrabold text-red-400 text-sm">18 Critical</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Investigating</span>
                    <span className="font-mono font-extrabold text-amber-300 text-sm">7 Active</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Resolved Today</span>
                    <span className="font-mono font-extrabold text-emerald-400 text-sm">142 Closed</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-extrabold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                    <i className="fa-solid fa-sliders text-purple-400 text-xs"></i>
                    HawkEye Rules Engine Studio
                  </span>
                  <span className="text-xs text-purple-300 font-bold">Active Engine</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <i className="fa-solid fa-circle-check text-emerald-400 text-sm"></i>
                      <span className="text-white text-xs font-bold">Velocity Rule (&gt;5 Transactions / 60s)</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-red-500/25 text-red-300 font-mono text-[10px] font-bold border border-red-500/40">CRITICAL</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <i className="fa-solid fa-circle-check text-emerald-400 text-sm"></i>
                      <span className="text-white text-xs font-bold">High Amount Threshold (&gt;$10,000)</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-amber-500/25 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40">HIGH</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <i className="fa-solid fa-chart-area text-blue-400 text-xs"></i>
                    Analytics & Export Reports
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">CSV Export Enabled</span>
                </div>

                <div className="h-16 w-full relative flex items-end pt-1">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 300 60">
                    <path
                      d="M0,45 Q30,10 60,35 T120,20 T180,40 T240,15 T300,30"
                      fill="none"
                      stroke="#00d2ff"
                      strokeWidth="3.5"
                    />
                    <circle cx="240" cy="15" r="5" fill="#00ff88" className="animate-ping" />
                    <circle cx="240" cy="15" r="5" fill="#00ff88" />
                  </svg>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-200 font-semibold">
                  <span>Transaction Volume: <strong className="text-cyan-300 font-mono">148k / day</strong></span>
                  <span>System Latency: <strong className="text-emerald-400 font-mono">8.4 ms</strong></span>
                </div>
              </div>
            )}

            {activeTab === 'customer' && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <i className="fa-solid fa-paper-plane text-emerald-400 text-xs"></i>
                    Customer Send Money & Payee Portal
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">Instant ACH</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-xs font-semibold">Available Balance:</span>
                    <strong className="text-emerald-400 font-mono text-sm">$24,850.00</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Saved Payees: 8 Active</span>
                    <span className="text-cyan-300 font-bold">Real-Time Risk Verification</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* 4 Feature Badges Row (Centered in Middle) */}
          <div className="hw-features pt-1 max-w-2xl w-full mx-auto justify-center justify-items-center items-center text-center">
            <div className="hw-feature-item flex flex-col items-center justify-center text-center mx-auto">
              <div className="hw-feature-icon mx-auto"><i className="fa-solid fa-shield-halved"></i></div>
              <span className="text-center font-bold">Real-time<br/>Monitoring</span>
            </div>
            <div className="hw-feature-item flex flex-col items-center justify-center text-center mx-auto">
              <div className="hw-feature-icon mx-auto"><i className="fa-solid fa-bell"></i></div>
              <span className="text-center font-bold">Smart<br/>Alerts</span>
            </div>
            <div className="hw-feature-item flex flex-col items-center justify-center text-center mx-auto">
              <div className="hw-feature-icon mx-auto"><i className="fa-solid fa-chart-line"></i></div>
              <span className="text-center font-bold">Advanced<br/>Analytics</span>
            </div>
            <div className="hw-feature-item flex flex-col items-center justify-center text-center mx-auto">
              <div className="hw-feature-icon mx-auto"><i className="fa-solid fa-lock"></i></div>
              <span className="text-center font-bold">Secure<br/>& Reliable</span>
            </div>
          </div>

        </div>

        {/* Left Footer */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 z-10">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-white font-bold text-xs">
              <i className="fa-solid fa-eye text-[#00d2ff]"></i> HAWKEYE PLATFORM
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              All Systems Operational
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">© 2026 HawkEye Platform Inc.</span>
        </div>

      </div>

      {/* ── RIGHT SIDE: Crisp Light Slate Login Panel (45% Width) ── */}
      <div className="hw-login-right">
        <div className="hw-login-card">
          
          {/* STEP 1: ROLE SELECTION CARDS (User: customer@hawkeye.com | Admin: admin@hawkeye.com) */}
          {/* STEP 1: ROLE SELECTION CARDS (User: customer@hawkeye.com | Admin: admin@hawkeye.com) */}
          {selectedRole === null && (
            <div className="animate-fade-in space-y-5">
              <div className="hw-card-header text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 text-cyan-400 flex items-center justify-center mx-auto mb-2.5 text-xl shadow-md">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">Welcome to HawkEye</h2>
                <p className="text-xs text-slate-300 font-medium mt-1">Transaction Monitoring & Alert System</p>
              </div>

              <div className="flex items-center justify-center gap-3 my-2">
                <div className="h-[1px] bg-slate-700/80 flex-1"></div>
                <span className="text-[11px] font-extrabold text-cyan-400 uppercase tracking-widest">Select Portal</span>
                <div className="h-[1px] bg-slate-700/80 flex-1"></div>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                
                {/* User Portal Option Card (customer@hawkeye.com) */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('USER')}
                  className="group relative p-4 rounded-xl border-2 border-slate-700/80 bg-[#0b1329] hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all duration-300 text-left cursor-pointer"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-blue-500/30">
                      <i className="fa-solid fa-user"></i>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-white text-base group-hover:text-cyan-400 transition-colors">
                          User Portal
                        </span>
                        <i className="fa-solid fa-arrow-right text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all text-xs"></i>
                      </div>
                      <p className="text-xs text-slate-300 font-medium mt-0.5 leading-snug">
                        Customer dashboard, instant money transfer, payee management & history.
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-950/80 border border-blue-800/80 text-[11px] font-mono text-cyan-300 font-bold">
                        <i className="fa-solid fa-envelope text-[10px]"></i>
                        <span>customer@hawkeye.com</span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Admin Portal Option Card (admin@hawkeye.com) */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('ADMIN')}
                  className="group relative p-4 rounded-xl border-2 border-slate-700/80 bg-[#0b1329] hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-0.5 transition-all duration-300 text-left cursor-pointer"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-purple-500/30">
                      <i className="fa-solid fa-shield-halved"></i>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-white text-base group-hover:text-purple-300 transition-colors">
                          Admin Portal
                        </span>
                        <i className="fa-solid fa-arrow-right text-slate-400 group-hover:text-purple-300 group-hover:translate-x-1 transition-all text-xs"></i>
                      </div>
                      <p className="text-xs text-slate-300 font-medium mt-0.5 leading-snug">
                        Rules engine configuration, real-time alert triage, metrics & system setup.
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-950/80 border border-purple-800/80 text-[11px] font-mono text-purple-300 font-bold">
                        <i className="fa-solid fa-envelope text-[10px]"></i>
                        <span>admin@hawkeye.com</span>
                      </div>
                    </div>
                  </div>
                </button>

              </div>
            </div>
          )}

          {/* STEP 2: AUTO-FILLED CREDENTIALS LOGIN FORM */}
          {selectedRole !== null && (
            <div className="animate-fade-in space-y-6">
              
              {/* Back to selection header */}
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-3.5">
                <button
                  type="button"
                  onClick={handleBackToRoleSelection}
                  className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <i className="fa-solid fa-arrow-left text-cyan-400"></i>
                  <span>Back to Role Selection</span>
                </button>

                <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                  selectedRole === 'ADMIN'
                    ? 'bg-purple-950/80 text-purple-300 border border-purple-800'
                    : 'bg-blue-950/80 text-cyan-300 border border-blue-800'
                }`}>
                  {selectedRole === 'ADMIN' ? 'ADMIN PORTAL' : 'USER PORTAL'}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-white">
                  {selectedRole === 'ADMIN' ? 'Administrator Authentication' : 'User Account Sign In'}
                </h3>
                <p className="text-xs text-slate-300 mt-1 font-medium">
                  Credentials pre-loaded for 1-click authentication. Click login below to proceed.
                </p>
              </div>

              {authError && (
                <div className="hw-auth-error">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Auto-filled Email Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Email Address"
                      className="w-full rounded-xl bg-[#0b1329] border border-slate-700/80 pl-10 pr-4 py-3 text-sm text-white font-semibold outline-none focus:border-cyan-400 focus:bg-[#0f172a] focus:ring-4 focus:ring-cyan-500/10 transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Auto-filled Password Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Password"
                      className="w-full rounded-xl bg-[#0b1329] border border-slate-700/80 pl-10 pr-10 py-3 text-sm text-white font-semibold outline-none focus:border-cyan-400 focus:bg-[#0f172a] focus:ring-4 focus:ring-cyan-500/10 transition-all shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 text-sm transition-colors cursor-pointer"
                    >
                      <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider text-white flex items-center justify-center gap-2.5 transition-all shadow-xl cursor-pointer ${
                    selectedRole === 'ADMIN'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 shadow-purple-600/30'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/30'
                  }`}
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin text-base"></i>
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Login to {selectedRole === 'ADMIN' ? 'Admin Console' : 'User Dashboard'}</span>
                      <i className="fa-solid fa-arrow-right text-base"></i>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Compliance & Security Footer */}
          <div className="hw-compliance mt-7 pt-5 border-t border-slate-200">
            <p className="hw-compliance-title text-[11px] font-bold text-slate-400 text-center mb-3 uppercase tracking-wider">
              Secure & Compliant Banking
            </p>
            <div className="hw-compliance-badges flex justify-center gap-2.5">
              <div className="hw-badge flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 font-medium">
                <i className="fa-solid fa-circle-check text-emerald-600 text-xs"></i>
                <span><strong className="text-slate-900">SOC 2</strong> Compliant</span>
              </div>
              <div className="hw-badge flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 font-medium">
                <i className="fa-solid fa-globe text-blue-600 text-xs"></i>
                <span><strong className="text-slate-900">ISO 27001</strong> Certified</span>
              </div>
              <div className="hw-badge flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 font-medium">
                <i className="fa-solid fa-lock text-purple-600 text-xs"></i>
                <span><strong className="text-slate-900">GDPR</strong> Ready</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── RIGHT PANEL FOOTER ── */}
        <div className="hw-right-footer mt-6 flex flex-col items-center gap-1 text-xs text-slate-300">
          <div className="flex items-center gap-2 font-bold text-slate-200">
            <i className="fa-solid fa-shield-halved text-cyan-400"></i>
            <span>256-Bit TLS Encryption • Security Top Priority</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            Protected by HawkEye Zero-Trust Architecture
          </div>
        </div>

      </div>

      </div>

      {/* Website Footer */}
      <Footer />
    </div>
  );
}
