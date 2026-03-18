import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DonationTabs } from '../DonationTabs';

vi.mock('../../actions', () => ({
  createMonetaryDonation: vi.fn(),
  createPhysicalPledge: vi.fn(),
  uploadFile: vi.fn(),
}));

describe('DonationTabs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders both tab triggers and defaults to Dinheiro content', () => {
    render(
      <DonationTabs
        productId="123e4567-e89b-12d3-a456-426614174000"
        targetAmount={10000}
        currentAmount={0}
        qrCodeImageUrl="https://example.com/qr.png"
        copiaEColaCode="00020126..."
      />
    );

    expect(screen.getByRole('tab', { name: 'Dinheiro' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Material' })).toBeInTheDocument();
    expect(screen.getByText('Faça uma Doação em Dinheiro')).toBeInTheDocument();
  });

  it('switches between Dinheiro and Material tabs', () => {
    render(
      <DonationTabs
        productId="123e4567-e89b-12d3-a456-426614174000"
        targetAmount={10000}
        currentAmount={0}
        qrCodeImageUrl="https://example.com/qr.png"
        copiaEColaCode="00020126..."
      />
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Material' }));
    expect(screen.getByText('Oferecer Este Item')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Dinheiro' }));
    expect(screen.getByText('Faça uma Doação em Dinheiro')).toBeInTheDocument();
  });

  it('preserves form data when switching tabs', () => {
    render(
      <DonationTabs
        productId="123e4567-e89b-12d3-a456-426614174000"
        targetAmount={10000}
        currentAmount={0}
        qrCodeImageUrl="https://example.com/qr.png"
        copiaEColaCode="00020126..."
      />
    );

    const monetaryEmail = document.getElementById(
      'monetary-donorEmail'
    ) as HTMLInputElement;
    fireEvent.change(monetaryEmail, { target: { value: 'money@example.com' } });

    fireEvent.click(screen.getByRole('tab', { name: 'Material' }));

    const physicalName = document.getElementById(
      'physical-donorName'
    ) as HTMLInputElement;
    const physicalEmail = document.getElementById(
      'physical-donorEmail'
    ) as HTMLInputElement;
    fireEvent.change(physicalName, { target: { value: 'Material Donor' } });
    fireEvent.change(physicalEmail, { target: { value: 'material@example.com' } });

    fireEvent.click(screen.getByRole('tab', { name: 'Dinheiro' }));
    expect(
      (document.getElementById('monetary-donorEmail') as HTMLInputElement).value
    ).toBe('money@example.com');

    fireEvent.click(screen.getByRole('tab', { name: 'Material' }));
    expect(
      (document.getElementById('physical-donorName') as HTMLInputElement).value
    ).toBe('Material Donor');
    expect(
      (document.getElementById('physical-donorEmail') as HTMLInputElement).value
    ).toBe('material@example.com');
  });
});
