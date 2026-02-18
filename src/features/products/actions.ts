'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { products, productCategories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ZodError } from 'zod';
import { createProductSchema, updateProductSchema } from './schemas';
import { validateSession } from '@/lib/auth/session';

interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

export async function createProduct(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const isAdmin = await validateSession();
    if (!isAdmin) {
      return {
        success: false,
        error: 'UNAUTHORIZED',
      };
    }

    const validated = createProductSchema.parse(input);

    const result = await db
      .insert(products)
      .values({
        name: validated.name,
        description: validated.description,
        donationType: validated.donationType,
        targetAmount:
          validated.donationType === 'monetary'
            ? validated.targetAmount
            : undefined,
        currentAmount: 0,
        isPublished: validated.isPublished ?? true,
      })
      .returning({ id: products.id });

    // Add categories
    if (validated.categoryIds && validated.categoryIds.length > 0) {
      await db.insert(productCategories).values(
        validated.categoryIds.map((categoryId) => ({
          productId: result[0].id,
          categoryId,
        }))
      );
    }

    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/admin/products');
    revalidatePath('/admin/dashboard');

    return {
      success: true,
      data: { id: result[0].id },
    };
  } catch (error) {
    console.error('createProduct error:', error);

    if (error instanceof ZodError) {
      return {
        success: false,
        error: 'VALIDATION_ERROR',
        details: error.flatten(),
      };
    }

    return {
      success: false,
      error: 'INTERNAL_ERROR',
    };
  }
}

export async function updateProduct(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const isAdmin = await validateSession();
    if (!isAdmin) {
      return {
        success: false,
        error: 'UNAUTHORIZED',
      };
    }

    const validated = updateProductSchema.parse(input);

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (validated.name !== undefined) updates.name = validated.name;
    if (validated.description !== undefined) updates.description = validated.description;
    if (validated.donationType !== undefined)
      updates.donationType = validated.donationType;
    if (validated.donationType === 'physical') {
      updates.targetAmount = null;
    } else if (
      validated.donationType === 'monetary' &&
      validated.targetAmount !== undefined &&
      validated.targetAmount !== null
    ) {
      updates.targetAmount = validated.targetAmount;
    } else if (validated.targetAmount !== undefined) {
      updates.targetAmount = validated.targetAmount;
    }
    if (validated.isPublished !== undefined) updates.isPublished = validated.isPublished;

    await db.update(products).set(updates).where(eq(products.id, id));

    // Update categories if provided
    if (validated.categoryIds) {
      await db
        .delete(productCategories)
        .where(eq(productCategories.productId, id));

      if (validated.categoryIds.length > 0) {
        await db.insert(productCategories).values(
          validated.categoryIds.map((categoryId) => ({
            productId: id,
            categoryId,
          }))
        );
      }
    }

    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/admin/products');
    revalidatePath('/admin/dashboard');

    return {
      success: true,
      data: { id },
    };
  } catch (error) {
    console.error('updateProduct error:', error);

    if (error instanceof ZodError) {
      return {
        success: false,
        error: 'VALIDATION_ERROR',
        details: error.flatten(),
      };
    }

    return {
      success: false,
      error: 'INTERNAL_ERROR',
    };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult<null>> {
  try {
    const isAdmin = await validateSession();
    if (!isAdmin) {
      return {
        success: false,
        error: 'UNAUTHORIZED',
      };
    }

    await db.delete(products).where(eq(products.id, id));

    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/admin/products');
    revalidatePath('/admin/dashboard');

    return {
      success: true,
    };
  } catch (error) {
    console.error('deleteProduct error:', error);
    return {
      success: false,
      error: 'INTERNAL_ERROR',
    };
  }
}
