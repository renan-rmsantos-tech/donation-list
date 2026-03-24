'use client';

import { MonetaryDonationForm } from './MonetaryDonationForm';
import { PhysicalPledgeForm } from './PhysicalPledgeForm';
import { DonationTabs } from './DonationTabs';
import type { products } from '@/lib/db/schema';

type DonationMode = typeof products.$inferSelect.donationMode;

interface DonationSectionProps {
  donationMode: DonationMode;
  productId: string;
  targetAmount: number | null;
  currentAmount: number;
  qrCodeImageUrl: string | null;
  copiaEColaCode: string | null;
}

export function DonationSection({
  donationMode,
  productId,
  targetAmount,
  currentAmount,
  qrCodeImageUrl,
  copiaEColaCode,
}: DonationSectionProps) {
  if (donationMode === 'monetary') {
    return (
      <MonetaryDonationForm
        productId={productId}
        targetAmount={targetAmount ?? 0}
        currentAmount={currentAmount}
        qrCodeImageUrl={qrCodeImageUrl}
        copiaEColaCode={copiaEColaCode}
      />
    );
  }

  if (donationMode === 'physical') {
    return <PhysicalPledgeForm productId={productId} />;
  }

  // donationMode === 'both'
  return (
    <DonationTabs
      productId={productId}
      targetAmount={targetAmount}
      currentAmount={currentAmount}
      qrCodeImageUrl={qrCodeImageUrl}
      copiaEColaCode={copiaEColaCode}
    />
  );
}
