import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FundTransferHistory } from '../FundTransferHistory';

describe('FundTransferHistory', () => {
  it('renders empty state when there are no transfers', () => {
    render(<FundTransferHistory transfers={[]} />);

    expect(screen.getByText('Histórico de Transferências')).toBeInTheDocument();
    expect(screen.getByText('Nenhuma transferência realizada ainda.')).toBeInTheDocument();
  });

  it('renders transfer rows with audit metadata', () => {
    render(
      <FundTransferHistory
        transfers={[
          {
            id: 't-1',
            sourceProductId: 'p-1',
            targetProductId: 'p-2',
            amount: 12345,
            adminUsername: 'admin',
            createdAt: new Date('2026-03-17T10:00:00.000Z'),
            sourceProduct: { id: 'p-1', name: 'Produto Origem' },
            targetProduct: { id: 'p-2', name: 'Produto Destino' },
          },
        ]}
      />
    );

    expect(screen.getByText('Produto Origem')).toBeInTheDocument();
    expect(screen.getByText('Produto Destino')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText(/R\$/)).toBeInTheDocument();
  });
});
