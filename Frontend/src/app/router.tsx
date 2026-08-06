import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ProtectedRoute, GuestRoute } from '@/features/auth/components/ProtectedRoute';

// Layouts
import AdminLayout    from '@/components/layout/AdminLayout';
import CustomerLayout from '@/components/layout/CustomerLayout';

// Auth pages
import LoginPage          from '@/features/auth/pages/LoginPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import UnauthorizedPage   from '@/features/auth/pages/UnauthorizedPage';

// Customer pages
import CustomerDashboard    from '@/features/customer/pages/CustomerDashboard';
import MyAccountsPage       from '@/features/customer/pages/MyAccountsPage';
import CustomerAlertsPage   from '@/features/customer/pages/CustomerAlertsPage';
import CustomerReportsPage  from '@/features/customer/pages/CustomerReportsPage';
import CustomerProfilePage  from '@/features/customer/pages/CustomerProfilePage';
import CustomerSettingsPage from '@/features/customer/pages/CustomerSettingsPage';
import SendMoneyPage        from '@/features/customer/pages/SendMoneyPage';
import TransactionListPage  from '@/features/customer/pages/TransactionListPage';
import TransactionDetailPage from '@/features/customer/pages/TransactionDetailPage';

// Rules pages (Admin)
import RulesListPage      from '@/features/rules/pages/RulesListPage';
import RuleCreatePage     from '@/features/rules/pages/RuleCreatePage';
import RuleDetailPage     from '@/features/rules/pages/RuleDetailPage';
import RuleEditPage       from '@/features/rules/pages/RuleEditPage';
import RuleAuditTrailPage from '@/features/rules/pages/RuleAuditTrailPage';

// Alert pages (Analyst + Admin)
import AlertsListPage  from '@/features/alerts/pages/AlertsListPage';
import AlertDetailPage from '@/features/alerts/pages/AlertDetailPage';
import AlertHistoryPage from '@/features/alerts/pages/AlertHistoryPage';
import AlertStatsPage  from '@/features/alerts/pages/AlertStatsPage';

// Dashboard pages (Admin)
import AdminDashboard from '@/features/dashboard/pages/AdminDashboard';
import AdminMetrics   from '@/features/dashboard/pages/AdminMetrics';
import ReportsPage    from '@/features/dashboard/pages/ReportsPage';
import UsersPage      from '@/features/dashboard/pages/UsersPage';
import SystemHealthPage from '@/features/dashboard/pages/SystemHealthPage';
import SettingsPage from '@/features/dashboard/pages/SettingsPage';


const router = createBrowserRouter([
  // ─── Public ─────────────────────────────────────────────────────────────
  {
    path: '/login',
    element: <GuestRoute><LoginPage /></GuestRoute>,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },

  // ─── Customer ────────────────────────────────────────────────────────────
  {
    path: '/customer',
    element: (
      <ProtectedRoute allowedRoles={['CUSTOMER']}>
        <CustomerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/customer/dashboard" replace /> },
      { path: 'dashboard',          element: <CustomerDashboard /> },
      { path: 'accounts',           element: <MyAccountsPage /> },
      { path: 'alerts',             element: <CustomerAlertsPage /> },
      { path: 'reports',            element: <CustomerReportsPage /> },
      { path: 'profile',            element: <CustomerProfilePage /> },
      { path: 'settings',           element: <CustomerSettingsPage /> },
      { path: 'send-money',         element: <SendMoneyPage /> },
      { path: 'transactions',       element: <TransactionListPage /> },
      { path: 'transactions/:id',   element: <TransactionDetailPage /> },
    ],
  },

  // ─── Admin shell (ADMIN + ANALYST share layout) ───────────────────────
  {
    path: '/',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN', 'ANALYST']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },

      // Admin Dashboard & Management
      { path: 'admin/dashboard',     element: <AdminDashboard /> },
      { path: 'admin/metrics',       element: <AdminMetrics /> },
      { path: 'admin/reports',       element: <ReportsPage /> },
      { path: 'admin/users',         element: <UsersPage /> },
      { path: 'admin/audit-logs',    element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'admin/system-health', element: <SystemHealthPage /> },
      { path: 'admin/settings',      element: <SettingsPage /> },


      // Rules (Admin only)
      {
        path: 'admin/rules',
        element: <ProtectedRoute allowedRoles={['ADMIN']}><RulesListPage /></ProtectedRoute>,
      },
      {
        path: 'admin/rules/new',
        element: <ProtectedRoute allowedRoles={['ADMIN']}><RuleCreatePage /></ProtectedRoute>,
      },
      {
        path: 'admin/rules/:id',
        element: <ProtectedRoute allowedRoles={['ADMIN']}><RuleDetailPage /></ProtectedRoute>,
      },
      {
        path: 'admin/rules/:id/edit',
        element: <ProtectedRoute allowedRoles={['ADMIN']}><RuleEditPage /></ProtectedRoute>,
      },
      {
        path: 'admin/rules/:id/audit-trail',
        element: <ProtectedRoute allowedRoles={['ADMIN']}><RuleAuditTrailPage /></ProtectedRoute>,
      },

      // Alerts (Admin + Analyst)
      { path: 'alerts',          element: <AlertsListPage /> },
      { path: 'alerts/history',  element: <AlertHistoryPage /> },
      { path: 'alerts/stats',    element: <AlertStatsPage /> },
      { path: 'alerts/:id',      element: <AlertDetailPage /> },
    ],
  },

  // ─── Catch-all ───────────────────────────────────────────────────────────
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

