'use client';

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
  return (
    <div className="w-full">
      <Tabs defaultValue="monetary" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="monetary">Dinheiro</TabsTrigger>
          <TabsTrigger value="physical">Material</TabsTrigger>
        </TabsList>

        <TabsContent value="monetary" forceMount>
          <MonetaryDonationForm
            productId={productId}
            targetAmount={targetAmount ?? 0}
            currentAmount={currentAmount}
            qrCodeImageUrl={qrCodeImageUrl}
            copiaEColaCode={copiaEColaCode}
            idPrefix="monetary-"
          />
        </TabsContent>

        <TabsContent value="physical" forceMount>
          <PhysicalPledgeForm productId={productId} idPrefix="physical-" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
