import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MonetaryDonationForm } from '../MonetaryDonationForm';

vi.mock('../../actions', () => ({
  createMonetaryDonation: vi.fn(),
  uploadFile: vi.fn(),
}));

describe('MonetaryDonationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render PIX payment details when settings available', () => {
    render(
      <MonetaryDonationForm
        productId="123e4567-e89b-12d3-a456-426614174000"
        targetAmount={10000}
        currentAmount={0}
        qrCodeImageUrl="https://example.com/qr.png"
        copiaEColaCode="00020126..."
      />
    );
    expect(screen.getByText('Faça uma Doação Monetária')).toBeInTheDocument();
    expect(screen.getByText('Dados de Pagamento PIX')).toBeInTheDocument();
    expect(screen.getByText('Enviar Doação')).toBeInTheDocument();
  });

  it('should show warning when PIX settings not configured', () => {
    render(
      <MonetaryDonationForm
        productId="123e4567-e89b-12d3-a456-426614174000"
        targetAmount={10000}
        currentAmount={0}
        qrCodeImageUrl={null}
        copiaEColaCode={null}
      />
    );
    expect(
      screen.getByText(/Os dados de pagamento PIX ainda não foram configurados/)
    ).toBeInTheDocument();
  });

  it('should display remaining amount', () => {
    render(
      <MonetaryDonationForm
        productId="123e4567-e89b-12d3-a456-426614174000"
        targetAmount={10000}
        currentAmount={5000}
        qrCodeImageUrl="https://example.com/qr.png"
        copiaEColaCode="00020126..."
      />
    );
    expect(screen.getByText(/Restante para atingir a meta/)).toBeInTheDocument();
  });

});
