'use client';

import type { products } from '@/lib/db/schema';

type DonationMode = typeof products.$inferSelect.donationMode;

interface DonationModeBadgeProps {
  donationMode: DonationMode;
}

const modeConfig: Record<DonationMode, { label: string; bgClass: string; textClass: string }> = {
  monetary: {
    label: 'Dinheiro',
    bgClass: 'bg-green-100',
    textClass: 'text-green-700',
  },
  physical: {
    label: 'Material',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
  },
  both: {
    label: 'Dinheiro + Material',
    bgClass: 'bg-purple-100',
    textClass: 'text-purple-700',
  },
};

export function DonationModeBadge({ donationMode }: DonationModeBadgeProps) {
  const config = modeConfig[donationMode];

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${config.bgClass} ${config.textClass}`}
    >
      {config.label}
    </span>
  );
}
