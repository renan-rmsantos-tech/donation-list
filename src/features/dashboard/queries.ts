'use server';

import { db } from '@/lib/db';
import { donations, products } from '@/lib/db/schema';
import { eq, sum, countDistinct } from 'drizzle-orm';

export interface DashboardStats {
  totalMonetaryDonations: number;
  totalPhysicalFulfilled: number;
  totalPhysicalPending: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get total monetary donations
    const monetaryResult = await db
      .select({ total: sum(donations.amount) })
      .from(donations)
      .where(eq(donations.donationType, 'monetary'));

    const totalMonetaryDonations = (monetaryResult[0]?.total as unknown as number) || 0;

    // Get physical products fulfilled/pending counts
    const physicalResult = await db
      .select({ isFulfilled: products.isFulfilled, count: countDistinct(products.id) })
      .from(products)
      .where(eq(products.donationType, 'physical'))
      .groupBy(products.isFulfilled);

    const totalPhysicalFulfilled =
      physicalResult.find((r) => r.isFulfilled === true)?.count || 0;
    const totalPhysicalPending =
      physicalResult.find((r) => r.isFulfilled === false)?.count || 0;

    return {
      totalMonetaryDonations,
      totalPhysicalFulfilled: Number(totalPhysicalFulfilled),
      totalPhysicalPending: Number(totalPhysicalPending),
    };
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return {
      totalMonetaryDonations: 0,
      totalPhysicalFulfilled: 0,
      totalPhysicalPending: 0,
    };
  }
}
