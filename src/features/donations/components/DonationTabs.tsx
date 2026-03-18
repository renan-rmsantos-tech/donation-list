'use client';

import { useState } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
  const [activeTab, setActiveTab] = useState('monetary');

  return (
    <div className="w-full">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="monetary" type="button">
            Dinheiro
          </TabsTrigger>
          <TabsTrigger value="physical" type="button">
            Material
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monetary" forceMount className="mt-4">
          <MonetaryDonationForm
            productId={productId}
            targetAmount={targetAmount ?? 0}
            currentAmount={currentAmount}
            qrCodeImageUrl={qrCodeImageUrl}
            copiaEColaCode={copiaEColaCode}
            idPrefix="monetary-"
          />
        </TabsContent>

        <TabsContent value="physical" forceMount className="mt-4">
          <PhysicalPledgeForm productId={productId} idPrefix="physical-" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
