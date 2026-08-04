import { Outlet } from 'react-router-dom';
import { CustomerSidebarNav } from './Sidebar';
import { Topbar } from './Topbar';

export default function CustomerLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <CustomerSidebarNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

