import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

function renderWithRouter(ui: React.ReactElement, path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      {ui}
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false });
  });

  it('redirects to /login when not authenticated', () => {
    renderWithRouter(
      <ProtectedRoute>
        <div data-testid="protected">Protected Content</div>
      </ProtectedRoute>
    );
    expect(screen.queryByTestId('protected')).toBeNull();
  });

  it('renders children when authenticated', () => {
    useAuthStore.setState({
      user: { id: 'U1', email: 'admin@test.com', name: 'Admin', role: 'ADMIN' },
      accessToken: 'token',
      isAuthenticated: true,
    });

    renderWithRouter(
      <ProtectedRoute>
        <div data-testid="protected">Protected Content</div>
      </ProtectedRoute>
    );
    expect(screen.getByTestId('protected')).toBeTruthy();
  });

  it('redirects to /unauthorized when role not allowed', () => {
    useAuthStore.setState({
      user: { id: 'U1', email: 'customer@test.com', name: 'Customer', role: 'CUSTOMER' },
      accessToken: 'token',
      isAuthenticated: true,
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <div data-testid="admin-content">Admin Only</div>
      </ProtectedRoute>
    );
    expect(screen.queryByTestId('admin-content')).toBeNull();
  });
});

