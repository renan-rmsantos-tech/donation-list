import { render, screen } from '@testing-library/react';
import { DonationSection } from '../DonationSection';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the donation form components
vi.mock('../MonetaryDonationForm', () => ({
  MonetaryDonationForm: ({ productId }: { productId: string }) => (
    <div data-testid="monetary-form">Monetary Form for {productId}</div>
  ),
}));

vi.mock('../PhysicalPledgeForm', () => ({
  PhysicalPledgeForm: ({ productId }: { productId: string }) => (
    <div data-testid="physical-form">Physical Form for {productId}</div>
  ),
}));

vi.mock('../DonationTabs', () => ({
  DonationTabs: ({ productId }: { productId: string }) => (
    <div data-testid="donation-tabs">Donation Tabs for {productId}</div>
  ),
}));

describe('DonationSection', () => {
  const mockProps = {
    productId: 'test-product-id',
    targetAmount: 10000,
    currentAmount: 5000,
    qrCodeImageUrl: 'https://example.com/qr.png',
    copiaEColaCode: '00020126580014br.gov.bcb.pix',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders MonetaryDonationForm directly (no tabs) when donationMode is monetary', () => {
    render(
      <DonationSection
        {...mockProps}
        donationMode="monetary"
      />
    );

    const form = screen.getByTestId('monetary-form');
    expect(form).toBeInTheDocument();
    expect(form).toHaveTextContent('Monetary Form for test-product-id');

    expect(screen.queryByTestId('donation-tabs')).not.toBeInTheDocument();
    expect(screen.queryByTestId('physical-form')).not.toBeInTheDocument();
  });

  it('renders PhysicalPledgeForm directly (no tabs) when donationMode is physical', () => {
    render(
      <DonationSection
        {...mockProps}
        donationMode="physical"
      />
    );

    const form = screen.getByTestId('physical-form');
    expect(form).toBeInTheDocument();
    expect(form).toHaveTextContent('Physical Form for test-product-id');

    expect(screen.queryByTestId('donation-tabs')).not.toBeInTheDocument();
    expect(screen.queryByTestId('monetary-form')).not.toBeInTheDocument();
  });

  it('renders DonationTabs when donationMode is both', () => {
    render(
      <DonationSection
        {...mockProps}
        donationMode="both"
      />
    );

    const tabs = screen.getByTestId('donation-tabs');
    expect(tabs).toBeInTheDocument();
    expect(tabs).toHaveTextContent('Donation Tabs for test-product-id');

    expect(screen.queryByTestId('monetary-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('physical-form')).not.toBeInTheDocument();
  });

  it('passes correct props to MonetaryDonationForm', () => {
    render(
      <DonationSection
        {...mockProps}
        donationMode="monetary"
      />
    );

    const form = screen.getByTestId('monetary-form');
    expect(form).toHaveTextContent('Monetary Form for test-product-id');
  });

  it('passes correct props to DonationTabs', () => {
    render(
      <DonationSection
        {...mockProps}
        donationMode="both"
      />
    );

    const tabs = screen.getByTestId('donation-tabs');
    expect(tabs).toHaveTextContent('Donation Tabs for test-product-id');
  });

  it('handles null targetAmount correctly', () => {
    render(
      <DonationSection
        {...mockProps}
        targetAmount={null}
        donationMode="monetary"
      />
    );

    expect(screen.getByTestId('monetary-form')).toBeInTheDocument();
  });
});
