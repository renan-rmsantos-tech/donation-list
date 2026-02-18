'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ZodError } from 'zod';
import { createCategorySchema, updateCategorySchema } from './schemas';
import { validateSession } from '@/lib/auth/session';

interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

export async function createCategory(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const isAdmin = await validateSession();
    if (!isAdmin) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    const validated = createCategorySchema.parse(input);

    const result = await db
      .insert(categories)
      .values(validated)
      .returning({ id: categories.id });

    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/admin/categories');

    return {
      success: true,
      data: { id: result[0].id },
    };
  } catch (error) {
    console.error('createCategory error:', error);

    if (error instanceof ZodError) {
      return {
        success: false,
        error: 'VALIDATION_ERROR',
        details: error.flatten(),
      };
    }

    if (error instanceof Error && error.message.includes('unique')) {
      return { success: false, error: 'DUPLICATE_NAME' };
    }

    return { success: false, error: 'INTERNAL_ERROR' };
  }
}

export async function updateCategory(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const isAdmin = await validateSession();
    if (!isAdmin) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    const validated = updateCategorySchema.parse(input);

    await db
      .update(categories)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id));

    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/admin/categories');

    return { success: true, data: { id } };
  } catch (error) {
    console.error('updateCategory error:', error);

    if (error instanceof ZodError) {
      return {
        success: false,
        error: 'VALIDATION_ERROR',
        details: error.flatten(),
      };
    }

    if (error instanceof Error && error.message.includes('unique')) {
      return { success: false, error: 'DUPLICATE_NAME' };
    }

    return { success: false, error: 'INTERNAL_ERROR' };
  }
}

export async function deleteCategory(
  id: string
): Promise<ActionResult<null>> {
  try {
    const isAdmin = await validateSession();
    if (!isAdmin) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    await db.delete(categories).where(eq(categories.id, id));

    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/admin/categories');

    return { success: true };
  } catch (error) {
    console.error('deleteCategory error:', error);
    return { success: false, error: 'INTERNAL_ERROR' };
  }
}
