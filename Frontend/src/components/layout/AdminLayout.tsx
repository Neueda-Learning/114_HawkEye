import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from './Sidebar';
import { Topbar } from './Topbar';

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/metrics':   'Metrics & Analytics',
  '/admin/rules':     'Rule Management',
  '/alerts':          'Alert Management',
  '/alerts/history':  'Alert History',
  '/alerts/stats':    'Alert Statistics',
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
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

