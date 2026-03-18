import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardTransferAlert } from '../DashboardTransferAlert';

describe('DashboardTransferAlert', () => {
  it('should render alert when hasTransfersAvailable is true', () => {
    render(<DashboardTransferAlert hasTransfersAvailable={true} />);

    expect(screen.getByTestId('dashboard-transfer-alert')).toBeInTheDocument();
    expect(
      screen.getByText('Há transferências de fundos disponíveis para realizar.')
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir para Transferências' })).toHaveAttribute(
      'href',
      '/admin/transfers'
    );
  });

  it('should not render when hasTransfersAvailable is false', () => {
    render(<DashboardTransferAlert hasTransfersAvailable={false} />);

    expect(screen.queryByTestId('dashboard-transfer-alert')).not.toBeInTheDocument();
  });
});
