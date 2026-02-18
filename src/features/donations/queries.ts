'use server';

import { db } from '@/lib/db';
import { donations, products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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

    const allPhysical = await db.query.products.findMany({
      where: eq(products.donationType, 'physical'),
    });

    return {
      fulfilled: fulfilled.length,
      pending: allPhysical.length - fulfilled.length,
    };
  } catch (error) {
    console.error('getPhysicalDonationStats error:', error);
    return {
      fulfilled: 0,
      pending: 0,
    };
  }
}
