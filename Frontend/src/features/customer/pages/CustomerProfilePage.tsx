import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Calendar, MapPin, Edit3, Shield, Lock, Smartphone,
  CheckCircle2, Bell, Download, HelpCircle, ExternalLink, Camera,
  ChevronRight, Key, ShieldCheck, Clock, CreditCard, AlertTriangle
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { getTransactions } from '@/lib/api/transactions';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/components/common/Toast';

export default function CustomerProfilePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Notification Preferences Toggles State
  const [prefs, setPrefs] = useState({
    txAlerts: true,
    highRiskAlerts: true,
    emailNotifs: true,
    smsNotifs: false,
    pushNotifs: true,
  });

  const togglePref = (key: keyof typeof prefs, label: string) => {
    const next = !prefs[key];
    setPrefs((prev) => ({ ...prev, [key]: next }));
    toast.success(`${label} ${next ? 'enabled' : 'disabled'}`);
  };

  // Fetch recent transactions for Recent Activity section
  useQuery({
    queryKey: ['profile-recent-activity', user?.accountId],
    queryFn: () => getTransactions({ accountId: user?.accountId, size: 5, sort: 'timestamp,desc' }),
  });

  const userName = user?.name || 'fourgrads';
  const userEmail = user?.email || 'fourgrads@email.com';

  return (
    <div className="space-y-6 pb-12 animate-fade-in font-sans text-slate-800 bg-[#f8fafc] p-6 -m-6 min-h-screen">
      
      {/* ── TOP HEADER CARD (USER INFO) ── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar with Camera Overlay */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-purple-100/80 border-4 border-white shadow-md flex items-center justify-center text-purple-600 text-3xl font-extrabold">
              <User className="w-12 h-12 text-purple-600" />
            </div>
            <button
              type="button"
              onClick={() => toast.info('Photo upload dialog opened')}
              className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-md hover:bg-slate-700 transition"
              title="Change Photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Name & Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{userName}</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-extrabold">
                Customer ID: HWK102938
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{userEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>+91 98765 43210</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status & Login Info Pills */}
        <div className="flex flex-wrap md:flex-col lg:flex-row items-center gap-4 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div className="flex-1 md:flex-initial bg-slate-50 border border-slate-100 rounded-2xl p-3 px-4 text-center sm:text-left">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Account Status</p>
            <span className="inline-flex items-center gap-1.5 mt-1 text-xs font-extrabold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Active
            </span>
          </div>

          <div className="flex-1 md:flex-initial bg-slate-50 border border-slate-100 rounded-2xl p-3 px-4 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-purple-500 shrink-0" />
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Member Since</p>
              <p className="text-xs font-extrabold text-slate-800 mt-0.5">May 15, 2023</p>
            </div>
          </div>

          <div className="flex-1 md:flex-initial bg-slate-50 border border-slate-100 rounded-2xl p-3 px-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-500 shrink-0" />
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Last Login</p>
              <p className="text-xs font-extrabold text-slate-800 mt-0.5">May 21, 2024 10:30 AM</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 1: PERSONAL INFO & LINKED ACCOUNTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Personal Information */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-slate-900">Personal Information</h2>
              <button
                type="button"
                onClick={() => toast.info('Edit Profile form opened')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 text-xs font-extrabold hover:bg-purple-100 transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            </div>

            <div className="space-y-4 mt-5">
              <div className="flex items-center gap-4 py-2 border-b border-slate-50">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <User className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Full Name</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{userName}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 py-2 border-b border-slate-50">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Email Address</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{userEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 py-2 border-b border-slate-50">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Phone Number</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-center gap-4 py-2 border-b border-slate-50">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Date of Birth</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">15 March 1990</p>
                </div>
              </div>

              <div className="flex items-center gap-4 py-2">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Address</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">Pune, Maharashtra, India 411001</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Linked Accounts */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-slate-900">Linked Accounts</h2>
              <button
                type="button"
                onClick={() => navigate('/customer/accounts')}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 transition"
              >
                View All
              </button>
            </div>

            <div className="space-y-3.5 mt-5">
              {[
                { name: 'Primary Checking', number: '•••• 1234', balance: 45250.75, color: 'bg-purple-100 text-purple-600' },
                { name: 'Savings Account', number: '•••• 5678', balance: 28560.00, color: 'bg-blue-100 text-blue-600' },
                { name: 'Business Account', number: '•••• 9012', balance: 32120.30, color: 'bg-amber-100 text-amber-600' },
                { name: 'Credit Card', number: '•••• 3456', balance: -3210.45, color: 'bg-emerald-100 text-emerald-600', isCredit: true },
              ].map((acc, i) => (
                <div
                  key={i}
                  onClick={() => navigate('/customer/accounts')}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${acc.color} flex items-center justify-center font-bold`}>
                      <CreditCard className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">{acc.name}</p>
                      <p className="text-[10px] font-mono text-slate-400 font-bold">{acc.number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-black font-mono ${acc.balance < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                      {formatCurrency(acc.balance)}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400">
                      {acc.isCredit ? 'Outstanding Balance' : 'Available Balance'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 p-3.5 rounded-xl">
            <span className="text-xs font-extrabold text-slate-600">Total Balance (All Accounts)</span>
            <span className="text-sm font-black text-slate-900 font-mono">₹1,25,560.60</span>
          </div>
        </div>
      </div>

      {/* ── ROW 2: SECURITY & NOTIFICATION PREFERENCES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Security Section */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900">Security</h2>
            <button
              type="button"
              onClick={() => toast.info('Security settings opened')}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 transition"
            >
              Update
            </button>
          </div>

          <div className="space-y-4 mt-5">
            {/* Password */}
            <div className="flex items-center justify-between py-3 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900">Password</p>
                  <p className="text-[10px] text-slate-400 font-medium">•••••••• • Last changed: May 12, 2024</p>
                </div>
              </div>
              <ChevronRight
                className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600"
                onClick={() => toast.info('Password update dialog opened')}
              />
            </div>

            {/* Two Factor Authentication */}
            <div className="flex items-center justify-between py-3 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900">Two Factor Authentication</p>
                </div>
              </div>
              <span
                onClick={() => toast.info('2FA settings opened')}
                className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md cursor-pointer hover:bg-emerald-100 transition"
              >
                Enabled
              </span>
            </div>

            {/* Recent Login */}
            <div className="flex items-center justify-between py-3 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Smartphone className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900">Recent Login</p>
                  <p className="text-[10px] text-slate-400 font-medium">Chrome on Windows • Pune, India • May 21, 2024 10:30 AM</p>
                </div>
              </div>
            </div>

            {/* Login Activity */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900">Login Activity</p>
                  <p className="text-[10px] text-slate-400 font-medium">View recent logins</p>
                </div>
              </div>
              <ChevronRight
                className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600"
                onClick={() => toast.info('Viewing login activity history...')}
              />
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900">Notification Preferences</h2>
            <button
              type="button"
              onClick={() => toast.info('Notification settings page opened')}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 transition"
            >
              Manage
            </button>
          </div>

          <div className="space-y-3.5 mt-5">
            {[
              { key: 'txAlerts', label: 'Transaction Alerts', desc: 'Get notified for all transactions', icon: <Bell className="w-4 h-4 text-purple-600" />, color: 'bg-purple-50' },
              { key: 'highRiskAlerts', label: 'High Risk Alerts', desc: 'Get notified for high risk activities', icon: <AlertTriangle className="w-4 h-4 text-rose-600" />, color: 'bg-rose-50' },
              { key: 'emailNotifs', label: 'Email Notifications', desc: 'Receive alerts via email', icon: <Mail className="w-4 h-4 text-blue-600" />, color: 'bg-blue-50' },
              { key: 'smsNotifs', label: 'SMS Notifications', desc: 'Receive alerts via SMS', icon: <Smartphone className="w-4 h-4 text-emerald-600" />, color: 'bg-emerald-50' },
              { key: 'pushNotifs', label: 'Push Notifications', desc: 'Receive alerts on the app', icon: <Bell className="w-4 h-4 text-amber-600" />, color: 'bg-amber-50' },
            ].map((item) => {
              const active = prefs[item.key as keyof typeof prefs];
              return (
                <div key={item.key} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">{item.label}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{item.desc}</p>
                    </div>
                  </div>
                  {/* Switch Toggle */}
                  <button
                    type="button"
                    onClick={() => togglePref(item.key as keyof typeof prefs, item.label)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                      active ? 'bg-purple-600 justify-end' : 'bg-slate-200 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── ROW 3: RECENT ACTIVITY & QUICK ACTIONS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Recent Activity */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900">Recent Activity</h2>
            <button
              type="button"
              onClick={() => navigate('/customer/transactions')}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 transition"
            >
              View All
            </button>
          </div>

          <div className="space-y-4 mt-5">
            <div className="flex items-center gap-3 py-2 border-b border-slate-50">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold text-slate-900">Login Successful</p>
                <p className="text-[10px] text-slate-400 font-medium">Pune, India • May 21, 2024 10:30 AM</p>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Success</span>
            </div>

            <div className="flex items-center gap-3 py-2 border-b border-slate-50">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold text-slate-900">Transaction Completed</p>
                <p className="text-[10px] text-slate-400 font-medium">Amazon Store • -₹1,250.00</p>
              </div>
              <span className="text-[10px] font-bold text-slate-400">May 21, 2024 09:47 AM</span>
            </div>

            <div className="flex items-center gap-3 py-2 border-b border-slate-50">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold text-slate-900">High Amount Transaction Alert</p>
                <p className="text-[10px] text-slate-400 font-medium">Amount: ₹25,000.00</p>
              </div>
              <span className="text-[10px] font-bold text-slate-400">May 20, 2024 04:15 PM</span>
            </div>

            <div className="flex items-center gap-3 py-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold text-slate-900">Profile Updated</p>
                <p className="text-[10px] text-slate-400 font-medium">Email address changed</p>
              </div>
              <span className="text-[10px] font-bold text-slate-400">May 18, 2024 11:20 AM</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-900 pb-4 border-b border-slate-100">Quick Actions</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5">
            <div
              onClick={() => toast.info('Password update dialog opened')}
              className="p-4 rounded-xl border border-slate-100 bg-purple-50/40 hover:bg-purple-50 transition cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Key className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900 group-hover:text-purple-600 transition">Change Password</p>
                  <p className="text-[9px] text-slate-400 font-medium mt-0.5">Update your password</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition" />
            </div>

            <div
              onClick={() => toast.success('Statement download started!')}
              className="p-4 rounded-xl border border-slate-100 bg-emerald-50/40 hover:bg-emerald-50 transition cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Download className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-600 transition">Download Statement</p>
                  <p className="text-[9px] text-slate-400 font-medium mt-0.5">Download account statements</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
            </div>

            <div
              onClick={() => navigate('/customer/settings')}
              className="p-4 rounded-xl border border-slate-100 bg-amber-50/40 hover:bg-amber-50 transition cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Bell className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900 group-hover:text-amber-600 transition">Manage Notifications</p>
                  <p className="text-[9px] text-slate-400 font-medium mt-0.5">Customize alert preferences</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition" />
            </div>

            <div
              onClick={() => toast.info('Support chat initiated')}
              className="p-4 rounded-xl border border-slate-100 bg-blue-50/40 hover:bg-blue-50 transition cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <HelpCircle className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600 transition">Contact Support</p>
                  <p className="text-[9px] text-slate-400 font-medium mt-0.5">Get help from support team</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
            </div>
          </div>
        </div>
      </div>

      {/* ── SECURITY / PRIVACY BANNER ── */}
      <div className="rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50/80 to-indigo-50/60 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-600/15 border border-purple-500/30 text-purple-600 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900">Your privacy and security are important to us.</h4>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              We never share your information with third parties.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => toast.info('Opening Privacy Policy...')}
          className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl border border-purple-200 bg-white text-xs font-extrabold text-purple-700 hover:bg-purple-600 hover:text-white transition shadow-sm"
        >
          Privacy Policy
          <ExternalLink className="h-3.5 w-3.5" />
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
