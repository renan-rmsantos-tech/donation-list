'use server';

import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';

export async function getCategories() {
  try {
    const result = await db.query.categories.findMany({
      orderBy: (categories, { asc }) => [asc(categories.createdAt)],
    });
    return result;
  } catch (error) {
    console.error('getCategories error:', error);
    return [];
  }
}

export async function getCategoryById(id: string) {
  try {
    const result = await db.query.categories.findFirst({
      where: (categories, { eq }) => eq(categories.id, id),
    });
    return result;
  } catch (error) {
    console.error('getCategoryById error:', error);
    return null;
  }
}
