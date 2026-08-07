import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Footer } from './Footer';

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard':     'Dashboard',
  '/admin/metrics':       'Transactions',
  '/admin/rules':         'Rules',
  '/alerts':              'Alerts',
  '/alerts/history':      'Alert History',
  '/alerts/stats':        'Alert Statistics',
  '/admin/reports':       'Reports',
  '/admin/users':         'Users',
  '/admin/system-health': 'System Health',
  '/admin/settings':      'Settings',
};

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isDark, setIsDark]       = useState(false);
  const location                  = useLocation();

  // Persist dark mode in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('hawkeye_dark');
    if (saved === 'true') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark((d) => {
      const next = !d;
      localStorage.setItem('hawkeye_dark', String(next));
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  const title = PAGE_TITLES[location.pathname] ?? '';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        isDark={isDark}
        onThemeToggle={toggleTheme}
      />
      <div className="flex flex-1 flex-col overflow-y-auto">
        <Topbar title={title} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
