import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Settings, Globe, Clock, Calendar, DollarSign, Home, Shield, Lock, Bell,
  Eye, Download, Key, ShieldCheck, ExternalLink,
  ChevronDown, Laptop, Database, FolderDown,
  AlertTriangle, Mail, Smartphone
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { getAlerts } from '@/lib/api/alerts';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { toast } from '@/components/common/Toast';
import { DateRangePicker } from '@/components/common/DateRangePicker';

export default function CustomerSettingsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const settingsStore = useSettingsStore();

  // Active Menu Item State
  const [activeMenu, setActiveMenu] = useState('general');

  // General Settings State
  const [generalForm, setGeneralForm] = useState(settingsStore.general);

  // Security Settings State
  const [loginAlerts, setLoginAlerts] = useState(settingsStore.security.loginAlerts);
  const [autoLogout, setAutoLogout] = useState(settingsStore.security.autoLogout);

  // Notification Settings State
  const [notifPrefs, setNotifPrefs] = useState(settingsStore.notifications);

  // Privacy Settings State
  const [privacyForm, setPrivacyForm] = useState(settingsStore.privacy);

  // Data & Download Settings State
  const [downloadForm, setDownloadForm] = useState(settingsStore.download);

  // Alerts badge count from API
  const { data: alertsData } = useQuery({
    queryKey: ['settings-alerts-count'],
    queryFn: () => getAlerts({ accountId: user?.accountId, size: 1 }),
  });
  const alertsCount = alertsData?.totalElements ?? 0;

  const handleSaveGeneral = () => {
    settingsStore.setGeneralSettings(generalForm);
    toast.success('General settings saved and applied across all pages!');
  };

  const handleSaveSecurity = () => {
    settingsStore.setSecuritySettings({ loginAlerts, autoLogout });
    toast.success('Security settings saved successfully!');
  };

  const handleSaveNotifications = () => {
    settingsStore.setNotificationSettings(notifPrefs);
    toast.success('Notification preferences saved successfully!');
  };

  const handleSavePrivacy = () => {
    settingsStore.setPrivacySettings(privacyForm);
    toast.success('Privacy settings saved successfully!');
  };

  const handleSaveDownload = () => {
    settingsStore.setDownloadSettings(downloadForm);
    toast.success('Data & download settings saved successfully!');
  };

  const menuItems = [
    { key: 'general', label: 'General Settings', desc: 'Manage general preferences', icon: <Globe className="w-4 h-4" /> },
    { key: 'security', label: 'Security', desc: 'Password, 2FA & session settings', icon: <Shield className="w-4 h-4" /> },
    { key: 'notification', label: 'Notification Settings', desc: 'Manage alert and notification preferences', icon: <Bell className="w-4 h-4" /> },
    { key: 'privacy', label: 'Privacy Settings', desc: 'Manage your privacy preferences', icon: <Lock className="w-4 h-4" /> },
    { key: 'display', label: 'Display Settings', desc: 'Customize appearance & theme', icon: <Laptop className="w-4 h-4" /> },
    { key: 'download', label: 'Download Settings', desc: 'Manage downloads & exports', icon: <FolderDown className="w-4 h-4" /> },
    { key: 'session', label: 'Session Management', desc: 'Manage your active sessions', icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in font-sans text-slate-800 bg-[#f8fafc] p-6 -m-6 min-h-screen">
      
      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-sm">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
              Manage your account preferences, security and application settings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/customer/alerts')}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            <Bell className="h-4.5 w-4.5" />
            {alertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-purple-600 text-[10px] font-extrabold text-white shadow-sm">
                {alertsCount > 9 ? '9+' : alertsCount}
              </span>
            )}
          </button>

          <DateRangePicker />
        </div>
      </div>

      {/* ── ROW 1: SETTINGS MENU & GENERAL SETTINGS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Settings Menu (Left List) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-900 mb-4">Settings Menu</h2>

          <div className="space-y-1.5">
            {menuItems.map((item) => {
              const active = activeMenu === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setActiveMenu(item.key);
                    toast.info(`Switched to ${item.label}`);
                  }}
                  className={`w-full flex items-center gap-3.5 p-3 rounded-xl transition text-left ${
                    active
                      ? 'bg-purple-50/80 border border-purple-200/80 text-purple-900 shadow-sm'
                      : 'hover:bg-slate-50 border border-transparent text-slate-700'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    active ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-extrabold ${active ? 'text-purple-900' : 'text-slate-900'}`}>{item.label}</p>
                    <p className="text-[10px] font-semibold text-slate-400 truncate mt-0.5">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* General Settings Card (Right Form) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-slate-900">General Settings</h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Manage your general account and application preferences.</p>
            </div>

            <div className="space-y-4.5 mt-5">
              {/* Language */}
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Globe className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Language</p>
                    <p className="text-[10px] text-slate-400 font-medium">Choose your preferred language</p>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={generalForm.language}
                    onChange={(e) => {
                      setGeneralForm({ ...generalForm, language: e.target.value });
                      toast.success(`Language set to ${e.target.value}`);
                    }}
                    className="appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-9 py-2 text-xs font-bold text-slate-800 outline-none focus:border-purple-500 transition cursor-pointer w-48"
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                    <option>Hindi</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {/* Timezone */}
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Clock className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Timezone</p>
                    <p className="text-[10px] text-slate-400 font-medium">Select your current timezone</p>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={generalForm.timezone}
                    onChange={(e) => {
                      setGeneralForm({ ...generalForm, timezone: e.target.value });
                      toast.success(`Timezone updated to ${e.target.value}`);
                    }}
                    className="appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-9 py-2 text-xs font-bold text-slate-800 outline-none focus:border-purple-500 transition cursor-pointer w-56 truncate"
                  >
                    <option>(GMT+05:30) Asia/Kolkata</option>
                    <option>(GMT-05:00) Eastern Time (US)</option>
                    <option>(GMT+00:00) UTC / London</option>
                    <option>(GMT+08:00) Singapore</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {/* Date Format */}
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Calendar className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Date Format</p>
                    <p className="text-[10px] text-slate-400 font-medium">Choose how dates are displayed</p>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={generalForm.dateFormat}
                    onChange={(e) => {
                      setGeneralForm({ ...generalForm, dateFormat: e.target.value });
                      toast.success(`Date format set to ${e.target.value}`);
                    }}
                    className="appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-9 py-2 text-xs font-bold text-slate-800 outline-none focus:border-purple-500 transition cursor-pointer w-48"
                  >
                    <option>DD MMM, YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {/* Currency */}
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <DollarSign className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Currency</p>
                    <p className="text-[10px] text-slate-400 font-medium">Select your preferred currency</p>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={generalForm.currency}
                    onChange={(e) => {
                      const updated = { ...generalForm, currency: e.target.value };
                      setGeneralForm(updated);
                      settingsStore.setGeneralSettings(updated);
                      toast.success(`Currency updated to ${e.target.value} and applied across all pages!`);
                    }}
                    className="appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-9 py-2 text-xs font-bold text-slate-800 outline-none focus:border-purple-500 transition cursor-pointer w-48"
                  >
                    <option>INR (₹)</option>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {/* Default Landing Page */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Home className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Default Landing Page</p>
                    <p className="text-[10px] text-slate-400 font-medium">Choose your default page on login</p>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={generalForm.landingPage}
                    onChange={(e) => {
                      const updated = { ...generalForm, landingPage: e.target.value };
                      setGeneralForm(updated);
                      settingsStore.setGeneralSettings(updated);
                      toast.success(`Default landing page set to ${e.target.value}`);
                    }}
                    className="appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-9 py-2 text-xs font-bold text-slate-800 outline-none focus:border-purple-500 transition cursor-pointer w-48"
                  >
                    <option>Overview</option>
                    <option>My Accounts</option>
                    <option>My Transactions</option>
                    <option>Alerts</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-5 mt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSaveGeneral}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold transition shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* ── ROW 2: SECURITY SETTINGS & NOTIFICATION SETTINGS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Security Settings */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-slate-900">Security Settings</h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Manage your password and security preferences.</p>
            </div>

            <div className="space-y-4 mt-5">
              {/* Change Password */}
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Key className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Change Password</p>
                    <p className="text-[10px] text-slate-400 font-medium">Update your account password regularly</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toast.info('Password update dialog opened')}
                  className="px-4 py-1.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 text-xs font-extrabold hover:bg-purple-100 transition"
                >
                  Change
                </button>
              </div>

              {/* Two Factor Authentication */}
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ShieldCheck className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Two Factor Authentication</p>
                    <p className="text-[10px] text-slate-400 font-medium">Add an extra layer of security</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md">
                  Enabled
                </span>
              </div>

              {/* Login Alerts */}
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Bell className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Login Alerts</p>
                    <p className="text-[10px] text-slate-400 font-medium">Get notified for new login attempts</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !loginAlerts;
                    setLoginAlerts(next);
                    toast.success(`Login Alerts ${next ? 'enabled' : 'disabled'}`);
                  }}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                    loginAlerts ? 'bg-emerald-500 justify-end' : 'bg-slate-200 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
                </button>
              </div>

              {/* Auto Logout */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Clock className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Auto Logout</p>
                    <p className="text-[10px] text-slate-400 font-medium">Automatically logout after inactivity</p>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={autoLogout}
                    onChange={(e) => {
                      setAutoLogout(e.target.value);
                      toast.info(`Auto Logout set to ${e.target.value}`);
                    }}
                    className="appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-9 py-2 text-xs font-bold text-slate-800 outline-none focus:border-purple-500 transition cursor-pointer w-36"
                  >
                    <option>5 Minutes</option>
                    <option>15 Minutes</option>
                    <option>30 Minutes</option>
                    <option>1 Hour</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 mt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSaveSecurity}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold transition shadow-sm"
            >
              Save Security Settings
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-slate-900">Notification Settings</h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Choose how you want to receive notifications and alerts.</p>
            </div>

            <div className="space-y-3 mt-4">
              {[
                { key: 'txAlerts', label: 'Transaction Alerts', desc: 'Get notified for all transactions', icon: <Bell className="w-4 h-4 text-purple-600" />, color: 'bg-purple-50' },
                { key: 'highRiskAlerts', label: 'High Risk Alerts', desc: 'Get notified for high risk activities', icon: <AlertTriangle className="w-4 h-4 text-rose-600" />, color: 'bg-rose-50' },
                { key: 'emailNotifs', label: 'Email Notifications', desc: 'Receive alerts via email', icon: <Mail className="w-4 h-4 text-blue-600" />, color: 'bg-blue-50' },
                { key: 'smsNotifs', label: 'SMS Notifications', desc: 'Receive alerts via SMS', icon: <Smartphone className="w-4 h-4 text-emerald-600" />, color: 'bg-emerald-50' },
                { key: 'pushNotifs', label: 'Push Notifications', desc: 'Receive alerts on the app', icon: <Bell className="w-4 h-4 text-amber-600" />, color: 'bg-amber-50' },
              ].map((item) => {
                const active = notifPrefs[item.key as keyof typeof notifPrefs];
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
                    <button
                      type="button"
                      onClick={() => {
                        const next = !active;
                        setNotifPrefs((prev) => ({ ...prev, [item.key]: next }));
                        toast.success(`${item.label} ${next ? 'enabled' : 'disabled'}`);
                      }}
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

          <div className="flex justify-end pt-4 mt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSaveNotifications}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold transition shadow-sm"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>

      {/* ── ROW 3: PRIVACY SETTINGS & DATA/DOWNLOAD SETTINGS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Privacy Settings */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-slate-900">Privacy Settings</h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Manage your privacy and data preferences.</p>
            </div>

            <div className="space-y-4 mt-5">
              {/* Profile Visibility */}
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Eye className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Profile Visibility</p>
                    <p className="text-[10px] text-slate-400 font-medium">Control who can see your profile information</p>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={privacyForm.profileVisibility}
                    onChange={(e) => {
                      setPrivacyForm({ ...privacyForm, profileVisibility: e.target.value });
                      toast.info(`Profile visibility set to ${e.target.value}`);
                    }}
                    className="appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-9 py-2 text-xs font-bold text-slate-800 outline-none focus:border-purple-500 transition cursor-pointer w-36"
                  >
                    <option>Only Me</option>
                    <option>Public</option>
                    <option>Contacts</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {/* Activity Visibility */}
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Eye className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Activity Visibility</p>
                    <p className="text-[10px] text-slate-400 font-medium">Control who can see your account activity</p>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={privacyForm.activityVisibility}
                    onChange={(e) => {
                      setPrivacyForm({ ...privacyForm, activityVisibility: e.target.value });
                      toast.info(`Activity visibility set to ${e.target.value}`);
                    }}
                    className="appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-9 py-2 text-xs font-bold text-slate-800 outline-none focus:border-purple-500 transition cursor-pointer w-36"
                  >
                    <option>Only Me</option>
                    <option>Public</option>
                    <option>Contacts</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {/* Share Analytics */}
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Globe className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Share Analytics</p>
                    <p className="text-[10px] text-slate-400 font-medium">Help us improve by sharing anonymous data</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !privacyForm.shareAnalytics;
                    setPrivacyForm({ ...privacyForm, shareAnalytics: next });
                    toast.success(`Share Analytics ${next ? 'enabled' : 'disabled'}`);
                  }}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                    privacyForm.shareAnalytics ? 'bg-purple-600 justify-end' : 'bg-slate-200 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
                </button>
              </div>

              {/* Data Retention */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Database className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Data Retention</p>
                    <p className="text-[10px] text-slate-400 font-medium">Choose how long to keep your data</p>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={privacyForm.dataRetention}
                    onChange={(e) => {
                      setPrivacyForm({ ...privacyForm, dataRetention: e.target.value });
                      toast.info(`Data retention set to ${e.target.value}`);
                    }}
                    className="appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-9 py-2 text-xs font-bold text-slate-800 outline-none focus:border-purple-500 transition cursor-pointer w-36"
                  >
                    <option>1 Year</option>
                    <option>2 Years</option>
                    <option>5 Years</option>
                    <option>Forever</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-5 mt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSavePrivacy}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold transition shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Data & Download Settings */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-slate-900">Data & Download Settings</h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Manage your downloads and data export preferences.</p>
            </div>

            <div className="space-y-4 mt-5">
              {/* Statement Format */}
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Download className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Statement Format</p>
                    <p className="text-[10px] text-slate-400 font-medium">Choose default statement format</p>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={downloadForm.statementFormat}
                    onChange={(e) => {
                      const updated = { ...downloadForm, statementFormat: e.target.value };
                      setDownloadForm(updated);
                      settingsStore.setDownloadSettings(updated);
                      toast.info(`Statement format set to ${e.target.value}`);
                    }}
                    className="appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-9 py-2 text-xs font-bold text-slate-800 outline-none focus:border-purple-500 transition cursor-pointer w-36"
                  >
                    <option>PDF</option>
                    <option>CSV</option>
                    <option>Excel</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {/* Report Format */}
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Download className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Report Format</p>
                    <p className="text-[10px] text-slate-400 font-medium">Choose default report format</p>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={downloadForm.reportFormat}
                    onChange={(e) => {
                      const updated = { ...downloadForm, reportFormat: e.target.value };
                      setDownloadForm(updated);
                      settingsStore.setDownloadSettings(updated);
                      toast.info(`Report format set to ${e.target.value}`);
                    }}
                    className="appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-9 py-2 text-xs font-bold text-slate-800 outline-none focus:border-purple-500 transition cursor-pointer w-36"
                  >
                    <option>PDF</option>
                    <option>CSV</option>
                    <option>Excel</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {/* Auto Download */}
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <FolderDown className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Auto Download</p>
                    <p className="text-[10px] text-slate-400 font-medium">Automatically download reports</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !downloadForm.autoDownload;
                    const updated = { ...downloadForm, autoDownload: next };
                    setDownloadForm(updated);
                    settingsStore.setDownloadSettings(updated);
                    toast.success(`Auto Download ${next ? 'enabled' : 'disabled'}`);
                  }}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                    downloadForm.autoDownload ? 'bg-purple-600 justify-end' : 'bg-slate-200 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
                </button>
              </div>

              {/* Download Location */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FolderDown className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Download Location</p>
                    <p className="text-[10px] text-slate-400 font-medium">Choose where to save downloads</p>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={downloadForm.downloadLocation}
                    onChange={(e) => {
                      const updated = { ...downloadForm, downloadLocation: e.target.value };
                      setDownloadForm(updated);
                      settingsStore.setDownloadSettings(updated);
                      toast.info(`Download location set to ${e.target.value}`);
                    }}
                    className="appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-9 py-2 text-xs font-bold text-slate-800 outline-none focus:border-purple-500 transition cursor-pointer w-44 truncate"
                  >
                    <option>Downloads Folder</option>
                    <option>Documents</option>
                    <option>Desktop</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-5 mt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSaveDownload}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold transition shadow-sm"
            >
              Save Settings
            </button>
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
            <h4 className="text-sm font-extrabold text-slate-900">Your settings are secure</h4>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              We use industry standard encryption to keep your preferences and data safe.
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
