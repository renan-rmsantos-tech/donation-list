'use server';

import { db } from '@/lib/db';
import { donations, products } from '@/lib/db/schema';
import { eq, sum, countDistinct } from 'drizzle-orm';

const MIN_TRANSFER_CENTS = 100; // R$ 1,00

export interface DashboardStats {
  totalMonetaryDonations: number;
  totalPhysicalFulfilled: number;
  totalPhysicalPending: number;
  hasTransfersAvailable: boolean;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get total monetary donations
    const monetaryResult = await db
      .select({ total: sum(donations.amount) })
      .from(donations)
      .where(eq(donations.donationType, 'monetary'));

    const totalMonetaryDonations = (monetaryResult[0]?.total as unknown as number) || 0;

    // Get products fulfilled/pending counts (all products)
    const physicalResult = await db
      .select({ isFulfilled: products.isFulfilled, count: countDistinct(products.id) })
      .from(products)
      .groupBy(products.isFulfilled);

    const totalPhysicalFulfilled =
      physicalResult.find((r) => r.isFulfilled === true)?.count || 0;
    const totalPhysicalPending =
      physicalResult.find((r) => r.isFulfilled === false)?.count || 0;

    // Check if transfers are available: 2+ products and at least 1 with balance >= R$ 1,00
    const productsForTransfer = await db.query.products.findMany({
      columns: { id: true, currentAmount: true },
    });
    const hasTransfersAvailable =
      productsForTransfer.length >= 2 &&
      productsForTransfer.some((p) => p.currentAmount >= MIN_TRANSFER_CENTS);

    return {
      totalMonetaryDonations,
      totalPhysicalFulfilled: Number(totalPhysicalFulfilled),
      totalPhysicalPending: Number(totalPhysicalPending),
      hasTransfersAvailable,
    };
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return {
      totalMonetaryDonations: 0,
      totalPhysicalFulfilled: 0,
      totalPhysicalPending: 0,
      hasTransfersAvailable: false,
    };
  }
}
