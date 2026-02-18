import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardStatsCards } from '../DashboardStatsCards';

describe('DashboardStatsCards', () => {
  it('should render all three metric cards', () => {
    render(
      <DashboardStatsCards
        stats={{
          totalMonetaryDonations: 10000,
          totalPhysicalFulfilled: 1,
          totalPhysicalPending: 2,
        }}
      />
    );
    expect(screen.getByText('Total de Doações Monetárias Arrecadadas')).toBeInTheDocument();
    expect(screen.getByText('Doações Físicas Atendidas')).toBeInTheDocument();
    expect(screen.getByText('Doações Físicas Pendentes')).toBeInTheDocument();
  });

  it('should format monetary amount in pt-BR locale', () => {
    render(
      <DashboardStatsCards
        stats={{
          totalMonetaryDonations: 12345,
          totalPhysicalFulfilled: 0,
          totalPhysicalPending: 0,
        }}
      />
    );
    expect(screen.getByText(/R\$\s*123,45/)).toBeInTheDocument();
  });

  it('should display physical counts', () => {
    render(
      <DashboardStatsCards
        stats={{
          totalMonetaryDonations: 0,
          totalPhysicalFulfilled: 5,
          totalPhysicalPending: 3,
        }}
      />
    );
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should show empty state when all metrics are zero', () => {
    render(
      <DashboardStatsCards
        stats={{
          totalMonetaryDonations: 0,
          totalPhysicalFulfilled: 0,
          totalPhysicalPending: 0,
        }}
      />
    );
    expect(screen.getByTestId('dashboard-empty-state')).toBeInTheDocument();
    expect(
      screen.getByText(/Ainda não há dados de doações. As métricas aparecerão quando doações ou compromissos forem registrados./)
    ).toBeInTheDocument();
  });

  it('should not show empty state when any metric has value', () => {
    render(
      <DashboardStatsCards
        stats={{
          totalMonetaryDonations: 1,
          totalPhysicalFulfilled: 0,
          totalPhysicalPending: 0,
        }}
      />
    );
    expect(screen.queryByTestId('dashboard-empty-state')).not.toBeInTheDocument();
  });
});
