'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { pixSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ZodError } from 'zod';
import { updatePixSettingsSchema } from './schemas';
import { validateSession } from '@/lib/auth/session';

interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

export async function updatePixSettings(
  input: unknown
): Promise<ActionResult<null>> {
  try {
    const isAdmin = await validateSession();
    if (!isAdmin) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    const validated = updatePixSettingsSchema.parse(input);

    const existing = await db.query.pixSettings.findFirst();

    if (existing) {
      await db
        .update(pixSettings)
        .set({
          ...validated,
          updatedAt: new Date(),
        })
        .where(eq(pixSettings.id, existing.id));
    } else {
      await db.insert(pixSettings).values({
        ...validated,
      });
    }

    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/admin/pix');

    return { success: true };
  } catch (error) {
    console.error('updatePixSettings error:', error);

    if (error instanceof ZodError) {
      return {
        success: false,
        error: 'VALIDATION_ERROR',
        details: error.flatten(),
      };
    }

    return { success: false, error: 'INTERNAL_ERROR' };
  }
}
