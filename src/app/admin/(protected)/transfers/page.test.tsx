import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TransfersPage from './page';
import { getFundTransfers, getProductsForTransfer } from '@/features/donations/queries';

vi.mock('@/features/donations/queries', () => ({
  getFundTransfers: vi.fn(),
  getProductsForTransfer: vi.fn(),
}));

vi.mock('@/features/donations/components/FundTransferForm', () => ({
  FundTransferForm: ({
    sourceProducts,
    targetProducts,
  }: {
    sourceProducts: Array<{ id: string }>;
    targetProducts: Array<{ id: string }>;
  }) => (
    <div data-testid="fund-transfer-form">
      form-sources:{sourceProducts.length} form-targets:{targetProducts.length}
    </div>
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
    vi.mocked(getProductsForTransfer).mockResolvedValue({
      sourceProducts: [
        { id: 'p-1', name: 'Produto A', currentAmount: 1000 },
        { id: 'p-2', name: 'Produto B', currentAmount: 2500 },
      ],
      targetProducts: [
        { id: 'p-1', name: 'Produto A', currentAmount: 1000 },
        { id: 'p-2', name: 'Produto B', currentAmount: 2500 },
      ],
    });
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

  it('loads required data and renders transfer form + history sections when products available', async () => {
    const Page = await TransfersPage();
    render(Page);

    expect(screen.getByRole('heading', { level: 1, name: 'Transferências de Fundos' })).toBeInTheDocument();
    expect(screen.getByTestId('fund-transfer-form')).toHaveTextContent(
      'form-sources:2 form-targets:2'
    );
    expect(screen.getByTestId('fund-transfer-history')).toHaveTextContent('history-transfers:1');
    expect(getProductsForTransfer).toHaveBeenCalledTimes(1);
    expect(getFundTransfers).toHaveBeenCalledTimes(1);
  });

  it('shows empty state when no source products available for transfer', async () => {
    vi.mocked(getProductsForTransfer).mockResolvedValue({
      sourceProducts: [],
      targetProducts: [
        { id: 'p-1', name: 'Produto A', currentAmount: 0 },
        { id: 'p-2', name: 'Produto B', currentAmount: 0 },
      ],
    });

    const Page = await TransfersPage();
    render(Page);

    expect(screen.getByRole('heading', { level: 1, name: 'Transferências de Fundos' })).toBeInTheDocument();
    expect(screen.queryByTestId('fund-transfer-form')).not.toBeInTheDocument();
    expect(
      screen.getByText(/Nenhum produto com saldo disponível/)
    ).toBeInTheDocument();
  });

  it('shows empty state when not enough target products', async () => {
    vi.mocked(getProductsForTransfer).mockResolvedValue({
      sourceProducts: [{ id: 'p-1', name: 'Produto A', currentAmount: 1000 }],
      targetProducts: [{ id: 'p-1', name: 'Produto A', currentAmount: 1000 }],
    });

    const Page = await TransfersPage();
    render(Page);

    expect(screen.getByRole('heading', { level: 1, name: 'Transferências de Fundos' })).toBeInTheDocument();
    expect(screen.queryByTestId('fund-transfer-form')).not.toBeInTheDocument();
    expect(
      screen.getByText(/pelo menos 2 produtos que ainda não atingiram a meta/)
    ).toBeInTheDocument();
  });
});
