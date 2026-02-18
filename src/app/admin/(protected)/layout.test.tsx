import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import ProtectedAdminLayout from './layout';

vi.mock('@/lib/auth/session', () => ({
  getSession: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

describe('ProtectedAdminLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSession).mockResolvedValue({
      isAdmin: true,
      username: 'admin',
      save: vi.fn(),
      destroy: vi.fn(),
      updateConfig: vi.fn(),
    } as never);
  });

  describe('Access protection', () => {
    it('should redirect to login when session is not admin', async () => {
      vi.mocked(getSession).mockResolvedValue({
        isAdmin: false,
      } as never);

      try {
        await ProtectedAdminLayout({ children: <div>Child</div> });
      } catch {
        // redirect() throws NEXT_REDIRECT
      }

      expect(redirect).toHaveBeenCalledWith('/admin/login');
    });

    it('should redirect when isAdmin is undefined', async () => {
      vi.mocked(getSession).mockResolvedValue({
        isAdmin: undefined,
      } as never);

      try {
        await ProtectedAdminLayout({ children: <div>Child</div> });
      } catch {
        // redirect() throws
      }

      expect(redirect).toHaveBeenCalledWith('/admin/login');
    });

    it('should render children when authenticated', async () => {
      const Layout = await ProtectedAdminLayout({ children: <div data-testid="admin-child">Content</div> });
      const { container } = render(Layout);
      expect(container.querySelector('[data-testid="admin-child"]')).toBeInTheDocument();
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should include dashboard link in nav', async () => {
      const Layout = await ProtectedAdminLayout({ children: <div>Child</div> });
      const { container } = render(Layout);
      const dashboardLink = container.querySelector('a[href="/admin/dashboard"]');
      expect(dashboardLink).toBeInTheDocument();
      expect(dashboardLink?.textContent).toContain('Painel');
    });
  });
});
