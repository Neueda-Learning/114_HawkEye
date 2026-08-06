import { Outlet } from 'react-router-dom';
import { CustomerSidebarNav } from './Sidebar';
import { Topbar } from './Topbar';
import { Footer } from './Footer';

export default function CustomerLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <CustomerSidebarNav />
      <div className="flex flex-1 flex-col overflow-y-auto">
        <Topbar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
