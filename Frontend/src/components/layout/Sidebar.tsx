import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Bell, ShieldAlert, Settings2, BarChart3,
  ChevronLeft, ChevronRight, LogOut, Sun, Moon, ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/store/authStore';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/admin/dashboard', label: 'Dashboard',   icon: <LayoutDashboard className="h-5 w-5" /> },
  { to: '/admin/metrics',   label: 'Metrics',     icon: <BarChart3 className="h-5 w-5" /> },
  { to: '/alerts',          label: 'Alerts',      icon: <Bell className="h-5 w-5" /> },
  { to: '/admin/rules',     label: 'Rules',       icon: <ShieldAlert className="h-5 w-5" />, roles: ['ADMIN'] },
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
        'flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-700 dark:bg-gray-900',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4 dark:border-gray-700">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-hawk-600" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">HawkEye</span>
          </div>
        )}
        {collapsed && <ShieldCheck className="mx-auto h-7 w-7 text-hawk-600" />}
        <button
          onClick={onToggle}
          className={cn(
            'rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800',
            collapsed && 'mx-auto',
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.filter(
          (item) => !item.roles || item.roles.includes(user?.role ?? ''),
        ).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-hawk-50 text-hawk-700 dark:bg-hawk-900/30 dark:text-hawk-300'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white',
                collapsed && 'justify-center px-2',
              )
            }
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 p-3 dark:border-gray-700 space-y-1">
        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-500 transition hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800',
            collapsed && 'justify-center px-2',
          )}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          {!collapsed && <span>{isDark ? 'Light mode' : 'Dark mode'}</span>}
        </button>

        {/* User + Logout */}
        {!collapsed && user && (
          <div className="flex items-center gap-2 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-hawk-100 text-xs font-bold text-hawk-700 dark:bg-hawk-900/40 dark:text-hawk-300">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">{user.name}</p>
              <p className="truncate text-xs text-gray-400">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
        {collapsed && (
          <button
            onClick={handleLogout}
            className="flex w-full justify-center rounded-lg p-2 text-gray-400 hover:text-red-500"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>
    </aside>
  );
}

export function CustomerSidebarNav() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const items = [
    { to: '/customer/dashboard',    label: 'Dashboard',     icon: <LayoutDashboard className="h-5 w-5" /> },
    { to: '/customer/send-money',   label: 'Send Money',    icon: <Settings2 className="h-5 w-5" /> },
    { to: '/customer/transactions', label: 'Transactions',  icon: <BarChart3 className="h-5 w-5" /> },
  ];

  return (
    <aside className="flex h-full w-60 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="flex h-16 items-center gap-2 border-b border-gray-100 px-5 dark:border-gray-700">
        <ShieldCheck className="h-7 w-7 text-hawk-600" />
        <span className="text-lg font-bold text-gray-900 dark:text-white">HawkEye</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-hawk-50 text-hawk-700 dark:bg-hawk-900/30 dark:text-hawk-300'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800',
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-gray-100 p-3 dark:border-gray-700">
        {user && (
          <div className="flex items-center gap-2 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-hawk-100 text-xs font-bold text-hawk-700 dark:bg-hawk-900/40">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">{user.name}</p>
              <p className="truncate text-xs text-gray-400">Customer</p>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="text-gray-400 hover:text-red-500"
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

