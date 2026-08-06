import { NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard, ArrowRightLeft, Bell, FileText, BarChart2,
  Users, Activity, LogOut, ChevronLeft, ChevronRight,
  ShieldCheck, Sun, Moon, Settings, User, HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAlerts } from '@/lib/api/alerts';
import { useAuthStore } from '@/features/auth/store/authStore';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/admin/dashboard',     label: 'Dashboard',     icon: <LayoutDashboard className="h-5 w-5" /> },
  { to: '/admin/metrics',       label: 'Transactions',  icon: <ArrowRightLeft className="h-5 w-5" /> },
  { to: '/alerts',              label: 'Alerts',        icon: <Bell className="h-5 w-5" /> },
  { to: '/admin/rules',         label: 'Rules',         icon: <FileText className="h-5 w-5" /> },
  { to: '/admin/reports',       label: 'Reports',       icon: <BarChart2 className="h-5 w-5" /> },
  { to: '/admin/system-health', label: 'System Health', icon: <Activity className="h-5 w-5" /> },
  { to: '/admin/settings',      label: 'Settings',      icon: <Settings className="h-5 w-5" /> },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
}

export function AdminSidebar({ collapsed, onToggle, isDark, onThemeToggle }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { data: alertsCountData } = useQuery({
    queryKey: ['alerts', 'sidebar-count'],
    queryFn: () => getAlerts({ size: 1 }),
    refetchInterval: 10000,
  });

  const alertsCount = alertsCountData?.totalElements ?? 0;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-gray-800 bg-[#070d1a] text-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-950',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-gray-800/60 px-4">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-wide text-white">HAWKEYE</span>
              <p className="text-[9px] text-gray-400 font-medium leading-none">Transaction Monitoring</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
        )}
        <button
          onClick={onToggle}
          className={cn(
            'rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white',
            collapsed && 'hidden',
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto p-3">
        {NAV_ITEMS.filter(
          (item) => !item.roles || item.roles.includes(user?.role ?? ''),
        ).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                  : 'text-gray-300 hover:bg-gray-800/60 hover:text-white',
                collapsed && 'justify-center px-2',
              )
            }
          >
            {item.icon}
            {!collapsed && <span className="flex-1">{item.label}</span>}
            {!collapsed && item.to === '/alerts' && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                {alertsCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-800/60 p-3 space-y-1">
        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-gray-400 transition hover:bg-gray-800/60 hover:text-white',
            collapsed && 'justify-center px-2',
          )}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {!collapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-red-600/20 hover:text-red-400',
            collapsed && 'justify-center px-2',
          )}
        >
          <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-400" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export function CustomerSidebarNav() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const items = [
    { to: '/customer/dashboard',    label: 'Dashboard',       icon: <LayoutDashboard className="h-5 w-5" /> },
    { to: '/customer/transactions', label: 'My Transactions', icon: <ArrowRightLeft className="h-5 w-5" /> },
    { to: '/alerts',                label: 'My Alerts',       icon: <Bell className="h-5 w-5" />, badge: 3 },
    { to: '/admin/reports',         label: 'Reports',         icon: <BarChart2 className="h-5 w-5" /> },
    { to: '/customer/send-money',   label: 'Send Money',      icon: <User className="h-5 w-5" /> },
    { to: '/admin/settings',        label: 'Settings',        icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-800 bg-[#070d1a] text-white">
      <div className="flex h-16 items-center gap-3 border-b border-gray-800/60 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <span className="text-base font-extrabold tracking-wide text-white uppercase">HAWKEYE</span>
          <p className="text-[9px] text-gray-400 font-medium">Transaction Monitoring & Alert System</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 p-3.5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-bold'
                  : 'text-gray-300 hover:bg-gray-800/60 hover:text-white',
              )
            }
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Promo Card */}
      <div className="mx-3.5 mb-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
        <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto mb-2 text-lg">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h4 className="text-xs font-bold text-white">We're watching</h4>
        <p className="text-[10px] text-slate-400 mt-0.5">so you don't have to.</p>
        <p className="text-[9px] text-slate-500 mt-1">Hawkeye keeps your transactions secure.</p>
      </div>

      {/* User Footer Profile */}
      <div className="border-t border-gray-800/60 p-3.5">
        {user && (
          <div className="flex items-center gap-3 rounded-xl bg-slate-900/60 px-3 py-2 border border-slate-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white">
              {user.name?.charAt(0) || 'J'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-white">{user.name || 'John Doe'}</p>
              <p className="truncate text-[10px] text-gray-400">{user.email || 'john.doe@email.com'}</p>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="text-gray-400 hover:text-red-400 transition"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
