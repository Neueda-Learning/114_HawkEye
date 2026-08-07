import { Search, Bell } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';

interface TopbarProps {
  title?: string;
}

export function Topbar({ title }: TopbarProps) {
  const { user } = useAuthStore();

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-700 dark:bg-gray-900">
      {/* Left — page title */}
      <div>
        {title && (
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
        )}
      </div>

      {/* Right — search + bell + avatar */}
      <div className="flex items-center gap-3">
        {/* Global search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search transactions, alerts…"
            className="w-56 rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 outline-none transition focus:border-hawk-400 focus:ring-1 focus:ring-hawk-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white lg:w-72"
          />
        </div>

        {/* Notification bell */}
        <button
          className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User avatar */}
        {user && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-hawk-100 text-xs font-bold text-hawk-700 dark:bg-hawk-900/40 dark:text-hawk-300">
              {user.name.charAt(0)}
            </div>
            <span className="hidden text-sm font-medium text-gray-700 dark:text-gray-300 lg:block">
              {user.name}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}

