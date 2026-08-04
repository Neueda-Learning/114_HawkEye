import { useState } from 'react';
import {
  Settings, Shield, Bell, Share2, Database, Sliders, Mail,
  HardDrive, Code, Palette, Info, Calendar, Save, CheckCircle2,
  XCircle, ChevronRight, RefreshCw, Layout, Clock, Sparkles, AlertTriangle
} from 'lucide-react';
import { toast } from '@/components/common/Toast';

export default function SettingsPage() {
  // Active sub-navigation tab
  const [activeSubTab, setActiveSubTab] = useState('general');

  // Form State
  const [systemName, setSystemName] = useState('TMAS - Transaction Monitoring & Alert System');
  const [timeZone, setTimeZone] = useState('(UTC+05:30) Asia/Kolkata');
  const [dateFormat, setDateFormat] = useState('May 21, 2024 (MMM DD, YYYY)');
  const [timeFormat, setTimeFormat] = useState<'12' | '24'>('24');
  const [language, setLanguage] = useState('English');
  const [itemsPerPage, setItemsPerPage] = useState('25');
  const [currency, setCurrency] = useState('USD - US Dollar ($)');
  const [advancedAnalytics, setAdvancedAnalytics] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  const navItems = [
    { id: 'general', label: 'General', icon: <Settings className="h-4 w-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { id: 'integrations', label: 'Integrations', icon: <Share2 className="h-4 w-4" /> },
    { id: 'retention', label: 'Data Retention', icon: <Database className="h-4 w-4" /> },
    { id: 'preferences', label: 'System Preferences', icon: <Sliders className="h-4 w-4" /> },
    { id: 'email', label: 'Email Settings', icon: <Mail className="h-4 w-4" /> },
    { id: 'backup', label: 'Backup & Restore', icon: <HardDrive className="h-4 w-4" /> },
    { id: 'api', label: 'API Management', icon: <Code className="h-4 w-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="h-4 w-4" /> },
    { id: 'about', label: 'About', icon: <Info className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Breadcrumb & Top Bar ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Dashboard</span>
            <span>›</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">Settings</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-gray-900 dark:text-white">Settings</h1>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>May 15, 2024 - May 21, 2024</span>
        </div>
      </div>

      {/* ── Top Main Layout Grid (3 Columns) ────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Column 1 — Vertical Sub-Navigation Tabs */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-900 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                  activeSubTab === item.id
                    ? 'bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Column 2 — General Settings Form Panel */}
        <div className="lg:col-span-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">General Settings</h2>
              <p className="text-xs text-gray-400">Manage general configuration and system preferences.</p>
            </div>

            <div className="mt-6 space-y-4 text-xs">
              {/* System Name */}
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="font-semibold text-gray-700 dark:text-gray-300">System Name</label>
                <input
                  type="text"
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                  className="col-span-2 rounded-xl border border-gray-200 p-2.5 text-xs outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Time Zone */}
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="font-semibold text-gray-700 dark:text-gray-300">Default Time Zone</label>
                <select
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  className="col-span-2 rounded-xl border border-gray-200 p-2.5 text-xs outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option>(UTC+05:30) Asia/Kolkata</option>
                  <option>(UTC+00:00) UTC / London</option>
                  <option>(UTC-05:00) Eastern Time (US & Canada)</option>
                </select>
              </div>

              {/* Date Format */}
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="font-semibold text-gray-700 dark:text-gray-300">Date Format</label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="col-span-2 rounded-xl border border-gray-200 p-2.5 text-xs outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option>May 21, 2024 (MMM DD, YYYY)</option>
                  <option>2024-05-21 (YYYY-MM-DD)</option>
                  <option>21/05/2024 (DD/MM/YYYY)</option>
                </select>
              </div>

              {/* Time Format */}
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="font-semibold text-gray-700 dark:text-gray-300">Time Format</label>
                <div className="col-span-2 flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="tf"
                      checked={timeFormat === '12'}
                      onChange={() => setTimeFormat('12')}
                    />
                    <span>12 Hour (AM/PM)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="tf"
                      checked={timeFormat === '24'}
                      onChange={() => setTimeFormat('24')}
                    />
                    <span>24 Hour</span>
                  </label>
                </div>
              </div>

              {/* Default Language */}
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="font-semibold text-gray-700 dark:text-gray-300">Default Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="col-span-2 rounded-xl border border-gray-200 p-2.5 text-xs outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>

              {/* Items Per Page */}
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="font-semibold text-gray-700 dark:text-gray-300">Items Per Page</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(e.target.value)}
                  className="col-span-2 rounded-xl border border-gray-200 p-2.5 text-xs outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </select>
              </div>

              {/* Currency */}
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="font-semibold text-gray-700 dark:text-gray-300">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="col-span-2 rounded-xl border border-gray-200 p-2.5 text-xs outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option>USD - US Dollar ($)</option>
                  <option>EUR - Euro (€)</option>
                  <option>GBP - British Pound (£)</option>
                </select>
              </div>

              {/* Enable Advanced Analytics */}
              <div className="grid grid-cols-3 items-center gap-4 pt-2">
                <label className="font-semibold text-gray-700 dark:text-gray-300">Enable Advanced Analytics</label>
                <div className="col-span-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={advancedAnalytics}
                    onChange={(e) => setAdvancedAnalytics(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-500 text-[11px]">Enable advanced analytics and machine learning features</span>
                </div>
              </div>

              {/* Maintenance Mode */}
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="font-semibold text-gray-700 dark:text-gray-300">Maintenance Mode</label>
                <div className="col-span-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-500 text-[11px]">Put system in maintenance mode ℹ</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>

        {/* Column 3 — 3 Executive Summary Cards */}
        <div className="lg:col-span-3 space-y-5">
          {/* Security Settings */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30">
                <Shield className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-xs">Security Settings</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center"><span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />Two-Factor Authentication</span><strong className="text-gray-900 dark:text-white">Enabled</strong></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />Password Policy</span><strong className="text-gray-900 dark:text-white">Strong</strong></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />Session Timeout</span><strong className="text-gray-900 dark:text-white">30 min</strong></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />Account Lockout</span><strong className="text-gray-900 dark:text-white">5 attempts</strong></div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-800 text-center">
              <a href="#" className="flex items-center justify-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
                <span>Manage Security</span> <ChevronRight className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30">
                <Bell className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-xs">Notification Settings</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center"><span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />Email Notifications</span><strong className="text-gray-900 dark:text-white">Enabled</strong></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400"><XCircle className="h-3.5 w-3.5 text-gray-400" />SMS Notifications</span><span className="text-gray-400">Disabled</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />In-App Notifications</span><strong className="text-gray-900 dark:text-white">Enabled</strong></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400"><XCircle className="h-3.5 w-3.5 text-gray-400" />Alert Digest</span><span className="text-gray-400">Daily</span></div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-800 text-center">
              <a href="#" className="flex items-center justify-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
                <span>Manage Notifications</span> <ChevronRight className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* System Information */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30">
                <Info className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-xs">System Information</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-gray-400">Version</span><strong className="text-gray-900 dark:text-white">v2.4.1</strong></div>
              <div className="flex justify-between"><span className="text-gray-400">Environment</span><strong className="text-gray-900 dark:text-white">Production</strong></div>
              <div className="flex justify-between"><span className="text-gray-400">Database</span><strong className="text-gray-900 dark:text-white">PostgreSQL 14.6</strong></div>
              <div className="flex justify-between"><span className="text-gray-400">Last Updated</span><span className="text-gray-500">May 20, 2024 11:30 AM</span></div>
              <div className="flex justify-between"><span className="text-gray-400">System Uptime</span><span className="text-gray-500">15d 8h 42m</span></div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-800 text-center">
              <a href="#" className="flex items-center justify-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
                <span>View System Details</span> <ChevronRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2 — System Preferences Cards (4 Cards) ──────────────────── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">System Preferences</h2>
          <p className="text-xs text-gray-400">Configure system behavior and default settings.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Card 1 */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-900/30">
              <Bell className="h-4 w-4" />
            </div>
            <h4 className="mt-3 font-bold text-gray-900 dark:text-white text-xs">Alert Preferences</h4>
            <p className="mt-1 text-[11px] text-gray-500 leading-relaxed">Configure default alert thresholds and escalation settings.</p>
            <a href="#" className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
              <span>Configure</span> <ChevronRight className="h-3 w-3" />
            </a>
          </div>

          {/* Card 2 */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30">
              <Shield className="h-4 w-4" />
            </div>
            <h4 className="mt-3 font-bold text-gray-900 dark:text-white text-xs">Rule Preferences</h4>
            <p className="mt-1 text-[11px] text-gray-500 leading-relaxed">Set default rule parameters and exception handling options.</p>
            <a href="#" className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
              <span>Configure</span> <ChevronRight className="h-3 w-3" />
            </a>
          </div>

          {/* Card 3 */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30">
              <Database className="h-4 w-4" />
            </div>
            <h4 className="mt-3 font-bold text-gray-900 dark:text-white text-xs">Data Preferences</h4>
            <p className="mt-1 text-[11px] text-gray-500 leading-relaxed">Manage data processing settings and file import preferences.</p>
            <a href="#" className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
              <span>Configure</span> <ChevronRight className="h-3 w-3" />
            </a>
          </div>

          {/* Card 4 */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30">
              <Layout className="h-4 w-4" />
            </div>
            <h4 className="mt-3 font-bold text-gray-900 dark:text-white text-xs">Dashboard Preferences</h4>
            <p className="mt-1 text-[11px] text-gray-500 leading-relaxed">Customize dashboard widgets and default filters.</p>
            <a href="#" className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
              <span>Configure</span> <ChevronRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* ── Row 3 — Backup & Restore Summary Banner ─────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Backup & Restore</h2>
          <p className="text-xs text-gray-400">Manage system backups and data recovery options.</p>
        </div>

        <div className="flex flex-wrap items-center gap-8 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400">Last Backup</p>
              <p className="font-bold text-gray-900 dark:text-white">May 21, 2024 02:30 AM</p>
              <p className="text-[10px] text-gray-400">Full Backup</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30">
              <RefreshCw className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400">Backup Frequency</p>
              <p className="font-bold text-gray-900 dark:text-white">Daily</p>
              <p className="text-[10px] text-gray-400">Next: May 22, 2024 02:30 AM</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400">Backup Size</p>
              <p className="font-bold text-gray-900 dark:text-white">2.45 GB</p>
              <p className="text-[10px] text-gray-400">Compressed</p>
            </div>
          </div>

          <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
            <span>Manage Backups</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
