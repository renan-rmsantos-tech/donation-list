'use server';

import { db } from '@/lib/db';
import { donations, products, fundTransfers } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function getDonationsByProductId(productId: string) {
  try {
    const result = await db.query.donations.findMany({
      where: eq(donations.productId, productId),
    });
    return result;
  } catch (error) {
    console.error('getDonationsByProductId error:', error);
    return [];
  }
}

export async function getTotalMonetaryDonations() {
  try {
    const result = await db
      .select({ sum: donations.amount })
      .from(donations)
      .where(eq(donations.donationType, 'monetary'));

    return (result[0]?.sum as number) || 0;
  } catch (error) {
    console.error('getTotalMonetaryDonations error:', error);
    return 0;
  }
}

export async function getPhysicalDonationStats() {
  try {
    const fulfilled = await db.query.products.findMany({
      where: eq(products.isFulfilled, true),
    });

    const pending = await db.query.products.findMany({
      where: eq(products.isFulfilled, false),
    });

    return {
      fulfilled: fulfilled.length,
      pending: pending.length,
    };
  } catch (error) {
    console.error('getPhysicalDonationStats error:', error);
    return {
      fulfilled: 0,
      pending: 0,
    };
  }
}

export async function getFundTransfers(filters?: { productId?: string }) {
  try {
    let query = db.query.fundTransfers.findMany({
      with: {
        sourceProduct: true,
        targetProduct: true,
      },
      orderBy: desc(fundTransfers.createdAt),
    });

    if (filters?.productId) {
      // If productId is provided, fetch transfers where it's either source or target
      // We'll do this in memory since Drizzle doesn't easily support OR conditions with relations
      const allTransfers = await query;
      return allTransfers.filter(
        (t) =>
          t.sourceProductId === filters.productId ||
          t.targetProductId === filters.productId
      );
    }

    const result = await query;
    return result;
  } catch (error) {
    console.error('getFundTransfers error:', error);
    return [];
  }
}

export async function getProductsForTransfer() {
  try {
    const result = await db.query.products.findMany({
      columns: {
        id: true,
        name: true,
        currentAmount: true,
      },
    });
    return result;
  } catch (error) {
    console.error('getProductsForTransfer error:', error);
    return [];
  }
}
