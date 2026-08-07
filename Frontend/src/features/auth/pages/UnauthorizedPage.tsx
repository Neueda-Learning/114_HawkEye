import { ShieldOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '@/lib/types';

const ROLE_HOME: Record<UserRole, string> = {
  CUSTOMER: '/customer/dashboard',
  ANALYST:  '/alerts',
  ADMIN:    '/admin/dashboard',
};

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const goHome = () => {
    if (user) navigate(ROLE_HOME[user.role]);
    else navigate('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-950">
      <div className="max-w-md text-center animate-fade-in">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <ShieldOff className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">403</h1>
        <h2 className="mb-3 text-xl font-semibold text-gray-700 dark:text-gray-300">
          Access Denied
        </h2>
        <p className="mb-8 text-gray-500 dark:text-gray-400">
          You don't have permission to view this page.
          {user && (
            <> Your current role is <strong>{user.role}</strong>.</>
          )}
        </p>
        <button
          onClick={goHome}
          className="inline-flex items-center gap-2 rounded-lg bg-hawk-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-hawk-700 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Go to my dashboard
        </button>
      </div>
    </div>
  );
}

