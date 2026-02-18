import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import AdminLayout from './layout';

describe('AdminLayout', () => {
  it('should render children without auth check', async () => {
    const Layout = await AdminLayout({ children: <div data-testid="admin-child">Content</div> });
    const { container } = render(Layout);
    expect(container.querySelector('[data-testid="admin-child"]')).toBeInTheDocument();
  });
});
