'use client';

import { useState } from 'react';
import { MonetaryDonationForm } from './MonetaryDonationForm';
import { PhysicalPledgeForm } from './PhysicalPledgeForm';

type DonationTabsProps = {
  productId: string;
  targetAmount: number | null;
  currentAmount: number;
  qrCodeImageUrl: string | null;
  copiaEColaCode: string | null;
};

export function DonationTabs({
  productId,
  targetAmount,
  currentAmount,
  qrCodeImageUrl,
  copiaEColaCode,
}: DonationTabsProps) {
  const [activeTab, setActiveTab] = useState<'monetary' | 'physical'>('monetary');

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('monetary')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'monetary'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Dinheiro
        </button>
        <button
          onClick={() => setActiveTab('physical')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'physical'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Material
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'monetary' && (
          <MonetaryDonationForm
            productId={productId}
            targetAmount={targetAmount ?? 0}
            currentAmount={currentAmount}
            qrCodeImageUrl={qrCodeImageUrl}
            copiaEColaCode={copiaEColaCode}
          />
        )}
        {activeTab === 'physical' && (
          <PhysicalPledgeForm productId={productId} />
        )}
      </div>
    </div>
  );
}
