import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ArrowRightLeft, Bell, FileText, BarChart2,
  Users, ClipboardList, Activity, LogOut, ChevronLeft, ChevronRight,
  ShieldCheck, Sun, Moon, Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
  { to: '/alerts',              label: 'Alerts',        icon: <Bell className="h-5 w-5" />, badge: 57 },
  { to: '/admin/rules',         label: 'Rules',         icon: <FileText className="h-5 w-5" /> },
  { to: '/admin/reports',       label: 'Reports',       icon: <BarChart2 className="h-5 w-5" /> },
  { to: '/admin/audit-logs',    label: 'Audit Logs',    icon: <ClipboardList className="h-5 w-5" /> },
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-gray-200 bg-[#0B132B] text-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-950',
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
            {!collapsed && item.badge !== undefined && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                {item.badge}
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
    { to: '/customer/dashboard',    label: 'Dashboard',     icon: <LayoutDashboard className="h-5 w-5" /> },
    { to: '/customer/send-money',   label: 'Send Money',    icon: <ArrowRightLeft className="h-5 w-5" /> },
    { to: '/customer/transactions', label: 'Transactions',  icon: <BarChart2 className="h-5 w-5" /> },
  ];

  return (
    <aside className="flex h-full w-60 flex-col border-r border-gray-800 bg-[#0B132B] text-white">
      <div className="flex h-16 items-center gap-2.5 border-b border-gray-800/60 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <span className="text-base font-bold text-white">TMAS</span>
          <p className="text-[9px] text-gray-400">Customer Portal</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1.5 p-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800/60 hover:text-white',
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-gray-800/60 p-3">
        {user && (
          <div className="flex items-center gap-2 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-900 text-xs font-bold text-blue-200">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{user.name}</p>
              <p className="truncate text-xs text-gray-400">Customer</p>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="text-gray-400 hover:text-red-400"
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
