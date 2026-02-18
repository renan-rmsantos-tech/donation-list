import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getDashboardStats } from '@/features/dashboard/queries';
import DashboardPage from './page';

vi.mock('@/features/dashboard/queries', () => ({
  getDashboardStats: vi.fn(),
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDashboardStats).mockResolvedValue({
      totalMonetaryDonations: 0,
      totalPhysicalFulfilled: 0,
      totalPhysicalPending: 0,
    });
  });

  describe('Rendering', () => {
    it('should render dashboard heading', async () => {
      const Page = await DashboardPage();
      render(Page);
      expect(screen.getByRole('heading', { level: 1, name: 'Painel' })).toBeInTheDocument();
    });

    it('should display total monetary donations metric', async () => {
      vi.mocked(getDashboardStats).mockResolvedValue({
        totalMonetaryDonations: 50000,
        totalPhysicalFulfilled: 0,
        totalPhysicalPending: 0,
      });
      const Page = await DashboardPage();
      render(Page);
      expect(screen.getByText('Total de Doações Monetárias Arrecadadas')).toBeInTheDocument();
      expect(screen.getByText(/R\$\s*500,00/)).toBeInTheDocument();
    });

    it('should display physical fulfilled metric', async () => {
      vi.mocked(getDashboardStats).mockResolvedValue({
        totalMonetaryDonations: 0,
        totalPhysicalFulfilled: 3,
        totalPhysicalPending: 0,
      });
      const Page = await DashboardPage();
      render(Page);
      expect(screen.getByText('Doações Físicas Atendidas')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should display physical pending metric', async () => {
      vi.mocked(getDashboardStats).mockResolvedValue({
        totalMonetaryDonations: 0,
        totalPhysicalFulfilled: 0,
        totalPhysicalPending: 5,
      });
      const Page = await DashboardPage();
      render(Page);
      expect(screen.getByText('Doações Físicas Pendentes')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('should display empty state message when no data', async () => {
      vi.mocked(getDashboardStats).mockResolvedValue({
        totalMonetaryDonations: 0,
        totalPhysicalFulfilled: 0,
        totalPhysicalPending: 0,
      });
      const Page = await DashboardPage();
      render(Page);
      expect(
        screen.getByText(/Ainda não há dados de doações. As métricas aparecerão quando doações ou compromissos forem registrados./)
      ).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-empty-state')).toBeInTheDocument();
    });

    it('should not display empty state when any metric has data', async () => {
      vi.mocked(getDashboardStats).mockResolvedValue({
        totalMonetaryDonations: 100,
        totalPhysicalFulfilled: 0,
        totalPhysicalPending: 0,
      });
      const Page = await DashboardPage();
      render(Page);
      expect(screen.queryByTestId('dashboard-empty-state')).not.toBeInTheDocument();
    });
  });

  describe('Mixed data', () => {
    it('should display all metrics with mixed monetary and physical data', async () => {
      vi.mocked(getDashboardStats).mockResolvedValue({
        totalMonetaryDonations: 25000,
        totalPhysicalFulfilled: 2,
        totalPhysicalPending: 3,
      });
      const Page = await DashboardPage();
      render(Page);
      expect(screen.getByText('Total de Doações Monetárias Arrecadadas')).toBeInTheDocument();
      expect(screen.getByText('Doações Físicas Atendidas')).toBeInTheDocument();
      expect(screen.getByText('Doações Físicas Pendentes')).toBeInTheDocument();
      expect(screen.getByText(/R\$\s*250,00/)).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('Data fetching', () => {
    it('should call getDashboardStats', async () => {
      await DashboardPage();
      expect(getDashboardStats).toHaveBeenCalledTimes(1);
    });
  });
});
