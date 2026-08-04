import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser, UserRole } from '@/lib/types';

// ─── Mock users for demo (MSW will handle real login) ─────────────────────────
export const MOCK_USERS: Record<string, { password: string; user: AuthUser }> = {
  'customer@hawkeye.com': {
    password: 'password123',
    user: { id: 'U001', email: 'customer@hawkeye.com', name: 'John Smith', role: 'CUSTOMER', accountId: 'ACC-001' },
  },
  'analyst@hawkeye.com': {
    password: 'password123',
    user: { id: 'U002', email: 'analyst@hawkeye.com', name: 'Sarah Chen', role: 'ANALYST' },
  },
  'admin@hawkeye.com': {
    password: 'password123',
    user: { id: 'U003', email: 'admin@hawkeye.com', name: 'Admin User', role: 'ADMIN' },
  },
};

interface AuthStore {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        // In mock mode, validate against MOCK_USERS
        const useMock = import.meta.env.VITE_USE_MOCK_API === 'true';

        if (useMock) {
          const entry = MOCK_USERS[email.toLowerCase()];
          if (!entry || entry.password !== password) {
            throw new Error('Invalid email or password');
          }
          const fakeToken = btoa(`${email}:${Date.now()}`);
          sessionStorage.setItem('hawkeye_token', fakeToken);
          set({ user: entry.user, accessToken: fakeToken, isAuthenticated: true });
          return;
        }

        // Real API call (when backend auth is ready)
        const { default: apiClient } = await import('@/lib/api/axios');
        const { data } = await apiClient.post('/api/v1/auth/login', { email, password });
        const { user, accessToken } = data.data;
        sessionStorage.setItem('hawkeye_token', accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },

      logout: () => {
        sessionStorage.removeItem('hawkeye_token');
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      hasRole: (role: UserRole | UserRole[]) => {
        const { user } = get();
        if (!user) return false;
        if (Array.isArray(role)) return role.includes(user.role);
        return user.role === role;
      },
    }),
    {
      name: 'hawkeye-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

