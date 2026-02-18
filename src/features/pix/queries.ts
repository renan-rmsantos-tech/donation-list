'use server';

import { db } from '@/lib/db';

export async function getPixSettings() {
  try {
    const result = await db.query.pixSettings.findFirst();
    return result || null;
  } catch (error) {
    console.error('getPixSettings error:', error);
    return null;
  }
}
