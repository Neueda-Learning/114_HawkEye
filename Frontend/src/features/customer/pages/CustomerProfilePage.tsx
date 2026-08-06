import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Calendar, MapPin, Edit3, Lock, Smartphone,
  CheckCircle2, Bell, Download, HelpCircle, Camera,
  ChevronRight, Key, ShieldCheck, Clock, CreditCard, AlertTriangle, X
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { getTransactions } from '@/lib/api/transactions';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/components/common/Toast';

export default function CustomerProfilePage() {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();

  // Dynamic Profile Form State loaded persistently from localStorage & authStore
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem('hawkeye-user-profile-details');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          name: user?.name || parsed.name || 'fourgrads',
          email: user?.email || parsed.email || 'fourgrads@email.com',
          phone: parsed.phone || '+91 98765 43210',
          dob: parsed.dob || '1990-03-15',
          address: parsed.address || 'Pune, Maharashtra, India 411001',
          avatarColor: parsed.avatarColor || 'bg-purple-100 text-purple-600',
        };
      } catch (e) {
        // ignore parse error
      }
    }
    return {
      name: user?.name || 'fourgrads',
      email: user?.email || 'fourgrads@email.com',
      phone: '+91 98765 43210',
      dob: '1990-03-15',
      address: 'Pune, Maharashtra, India 411001',
      avatarColor: 'bg-purple-100 text-purple-600',
    };
  });

  // Security & 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [lastPasswordChanged] = useState('May 12, 2024');

  // Modal Open States
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isUpdatePasswordOpen, setIsUpdatePasswordOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isLoginActivityOpen, setIsLoginActivityOpen] = useState(false);

  // Form Temp Edit State
  const [editForm, setEditForm] = useState({ ...profileData });
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });

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

  // Save Profile Handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileData({ ...editForm });
    localStorage.setItem('hawkeye-user-profile-details', JSON.stringify(editForm));
    updateUser({ name: editForm.name, email: editForm.email });
    setIsEditProfileOpen(false);
    toast.success('Profile information updated successfully!');
    toast.email(
      'Profile Update Confirmation Dispatched',
      `An automated confirmation email has been dispatched to ${editForm.email} confirming your updated profile details.`,
      editForm.email
    );
  };

  // Save Password Handler
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.next !== passwordForm.confirm) {
      toast.error('Passwords do not match', 'New password and confirm password must match.');
      return;
    }
    if (passwordForm.next.length < 6) {
      toast.error('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    setIsUpdatePasswordOpen(false);
    setPasswordForm({ current: '', next: '', confirm: '' });
    toast.success('Password updated successfully!');
    toast.email(
      'Security Alert: Password Changed',
      `Your account password was updated. If you did not make this change, please contact Hawkeye Support immediately.`,
      profileData.email
    );
  };

  // Toggle 2FA Handler
  const handleToggle2FA = () => {
    const next = !twoFactorEnabled;
    setTwoFactorEnabled(next);
    toast.success(`Two-Factor Authentication (2FA) is now ${next ? 'Enabled' : 'Disabled'}`);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in font-sans text-slate-800 bg-[#f8fafc] p-6 -m-6 min-h-screen">
      
      {/* ── TOP HEADER CARD (USER INFO) ── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar with Camera Overlay */}
          <div className="relative">
            <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full ${profileData.avatarColor} border-4 border-white shadow-md flex items-center justify-center text-3xl font-extrabold`}>
              <User className="w-12 h-12" />
            </div>
            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(true)}
              className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-md hover:bg-slate-700 transition cursor-pointer"
              title="Change Photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Name & Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{profileData.name}</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-extrabold">
                User ID: HWK102938
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{profileData.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{profileData.phone}</span>
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
              <p className="text-xs font-extrabold text-slate-800 mt-0.5">Just now</p>
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
                onClick={() => {
                  setEditForm({ ...profileData });
                  setIsEditProfileOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 text-xs font-extrabold hover:bg-purple-100 transition cursor-pointer"
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
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{profileData.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 py-2 border-b border-slate-50">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Email Address</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{profileData.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 py-2 border-b border-slate-50">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Phone Number</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{profileData.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 py-2 border-b border-slate-50">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Date of Birth</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{profileData.dob}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 py-2">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Address</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{profileData.address}</p>
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
                className="text-xs font-bold text-purple-600 hover:text-purple-700 transition cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-3.5 mt-5">
              {[
                { name: 'Primary Checking', number: 'ACC-001 (•••• 0001)', balance: 48500.75, color: 'bg-purple-100 text-purple-600' },
                { name: 'Savings Reserve', number: 'ACC-001-SAV (•••• 5678)', balance: 24850.00, color: 'bg-blue-100 text-blue-600' },
                { name: 'Business Account', number: 'ACC-001-BUS (•••• 9012)', balance: 18420.50, color: 'bg-amber-100 text-amber-600' },
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
                    <p className="text-xs font-black font-mono text-slate-900">
                      {formatCurrency(acc.balance)}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400">Available Balance</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 p-3.5 rounded-xl">
            <span className="text-xs font-extrabold text-slate-600">Total Portfolio Balance</span>
            <span className="text-sm font-black text-slate-900 font-mono">₹91,771.25</span>
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
              onClick={() => setIsUpdatePasswordOpen(true)}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 transition cursor-pointer"
            >
              Update Security
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
                  <p className="text-[10px] text-slate-400 font-medium">•••••••• • Last changed: {lastPasswordChanged}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUpdatePasswordOpen(true)}
                className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 text-xs font-extrabold hover:bg-purple-100 transition cursor-pointer"
              >
                Change
              </button>
            </div>

            {/* Two Factor Authentication */}
            <div className="flex items-center justify-between py-3 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900">Two Factor Authentication (2FA)</p>
                  <p className="text-[10px] text-slate-400 font-medium">Extra security layer for your account</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggle2FA}
                className={`text-xs font-extrabold px-3 py-1 rounded-xl cursor-pointer transition ${
                  twoFactorEnabled ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            {/* Login Activity */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Clock className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900">Recent Login History</p>
                  <p className="text-[10px] text-slate-400 font-medium">View active sessions & locations</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLoginActivityOpen(true)}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 transition cursor-pointer"
              >
                View History
              </button>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900">Notification Preferences</h2>
            <button
              type="button"
              onClick={() => navigate('/customer/settings')}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 transition cursor-pointer"
            >
              Manage All
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
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
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
              className="text-xs font-bold text-purple-600 hover:text-purple-700 transition cursor-pointer"
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
                <p className="text-[10px] text-slate-400 font-medium">Chrome on Windows • Pune, India • Just now</p>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Success</span>
            </div>

            <div className="flex items-center gap-3 py-2 border-b border-slate-50">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold text-slate-900">DEBIT Transaction Executed</p>
                <p className="text-[10px] text-slate-400 font-medium">Vendor Payee • -₹2,500.00</p>
              </div>
              <span className="text-[10px] font-bold text-slate-400">Today</span>
            </div>

            <div className="flex items-center gap-3 py-2 border-b border-slate-50">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold text-slate-900">High Amount Transaction Alert</p>
                <p className="text-[10px] text-slate-400 font-medium">Amount: ₹25,000.00</p>
              </div>
              <span className="text-[10px] font-bold text-slate-400">Yesterday</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-900 pb-4 border-b border-slate-100">Quick Actions</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5">
            <div
              onClick={() => setIsUpdatePasswordOpen(true)}
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
              onClick={() => toast.success('Account statement PDF downloaded successfully!')}
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
              onClick={() => toast.info('Support ticket opened: Priority help desk initiated for fourgrads')}
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

      {/* ── MODAL 1: EDIT PROFILE FORM ── */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-extrabold text-slate-900">Edit Personal Profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={editForm.dob}
                    onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">Residential Address</label>
                <textarea
                  rows={2}
                  required
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:border-purple-600"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-extrabold hover:bg-purple-700 cursor-pointer shadow-sm"
                >
                  Save Profile Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: UPDATE SECURITY & PASSWORD ── */}
      {isUpdatePasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Key className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-extrabold text-slate-900">Update Password & Security</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUpdatePasswordOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password"
                  value={passwordForm.next}
                  onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Confirm new password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUpdatePasswordOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-extrabold hover:bg-purple-700 cursor-pointer shadow-sm"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: AVATAR / PHOTO CHANGE ── */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl space-y-5 text-center">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Choose Profile Theme Avatar</h3>
              <button onClick={() => setIsPhotoModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 py-2">
              {[
                { color: 'bg-purple-100 text-purple-600', label: 'Purple' },
                { color: 'bg-blue-100 text-blue-600', label: 'Blue' },
                { color: 'bg-emerald-100 text-emerald-600', label: 'Emerald' },
                { color: 'bg-amber-100 text-amber-600', label: 'Amber' },
                { color: 'bg-rose-100 text-rose-600', label: 'Rose' },
                { color: 'bg-indigo-100 text-indigo-600', label: 'Indigo' },
              ].map((theme, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    const updated = { ...profileData, avatarColor: theme.color };
                    setProfileData(updated);
                    localStorage.setItem('hawkeye-user-profile-details', JSON.stringify(updated));
                    setIsPhotoModalOpen(false);
                    toast.success(`Profile theme avatar updated to ${theme.label}!`);
                  }}
                  className={`w-16 h-16 mx-auto rounded-full ${theme.color} border-2 border-slate-200 flex items-center justify-center text-xl font-bold hover:scale-105 transition cursor-pointer`}
                >
                  <User className="w-7 h-7" />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setIsPhotoModalOpen(false);
                toast.success('Custom avatar uploaded successfully!');
              }}
              className="w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-extrabold hover:bg-slate-100 cursor-pointer"
            >
              Upload Custom Image File
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL 4: RECENT LOGIN HISTORY ── */}
      {isLoginActivityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-extrabold text-slate-900">Recent Login Sessions</h3>
              </div>
              <button onClick={() => setIsLoginActivityOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {[
                { device: 'Chrome on Windows 11', location: 'Pune, Maharashtra', ip: '103.22.45.12', time: 'Just now', status: 'Active' },
                { device: 'Mobile App (iOS)', location: 'Pune, Maharashtra', ip: '103.22.45.99', time: 'Yesterday 04:20 PM', status: 'Ended' },
                { device: 'Edge on Windows 11', location: 'Mumbai, Maharashtra', ip: '49.36.12.50', time: '18 May 2024 11:05 AM', status: 'Ended' },
              ].map((sess, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">{sess.device}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{sess.location} • {sess.ip}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${sess.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                      {sess.status}
                    </span>
                    <p className="text-[9px] text-slate-400 font-bold mt-1">{sess.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsLoginActivityOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
