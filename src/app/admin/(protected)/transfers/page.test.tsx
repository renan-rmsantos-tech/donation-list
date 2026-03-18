import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TransfersPage from './page';
import { getFundTransfers, getProductsForTransfer } from '@/features/donations/queries';

vi.mock('@/features/donations/queries', () => ({
  getFundTransfers: vi.fn(),
  getProductsForTransfer: vi.fn(),
}));

vi.mock('@/features/donations/components/FundTransferForm', () => ({
  FundTransferForm: ({ products }: { products: Array<{ id: string }> }) => (
    <div data-testid="fund-transfer-form">form-products:{products.length}</div>
  ),
}));

vi.mock('@/features/donations/components/FundTransferHistory', () => ({
  FundTransferHistory: ({ transfers }: { transfers: Array<{ id: string }> }) => (
    <div data-testid="fund-transfer-history">history-transfers:{transfers.length}</div>
  ),
}));

describe('TransfersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getProductsForTransfer).mockResolvedValue([
      { id: 'p-1', name: 'Produto A', currentAmount: 1000 },
    ]);
    vi.mocked(getFundTransfers).mockResolvedValue([
      {
        id: 't-1',
        sourceProductId: 'p-1',
        targetProductId: 'p-2',
        amount: 500,
        adminUsername: 'admin',
        createdAt: new Date(),
      },
    ] as any);
  });

  it('loads required data and renders transfer form + history sections', async () => {
    const Page = await TransfersPage();
    render(Page);

    expect(screen.getByRole('heading', { level: 1, name: 'Transferências de Fundos' })).toBeInTheDocument();
    expect(screen.getByTestId('fund-transfer-form')).toHaveTextContent('form-products:1');
    expect(screen.getByTestId('fund-transfer-history')).toHaveTextContent('history-transfers:1');
    expect(getProductsForTransfer).toHaveBeenCalledTimes(1);
    expect(getFundTransfers).toHaveBeenCalledTimes(1);
  });
});
