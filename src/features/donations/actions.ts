'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import {
  donations,
  products,
  donationTypeEnum,
} from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { ZodError } from 'zod';
import {
  createMonetaryDonationSchema,
  createPhysicalPledgeSchema,
  generateUploadUrlSchema,
} from './schemas';
import {
  generateSignedUploadUrl,
  uploadFileDirect,
} from '@/lib/storage/supabase';
import { generateStoragePath } from '@/lib/utils/format';
import { validateSession } from '@/lib/auth/session';

interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

/**
 * Create a monetary donation and update product progress atomically
 */
export async function createMonetaryDonation(
  input: unknown
): Promise<ActionResult<{ donationId: string }>> {
  try {
    const validated = createMonetaryDonationSchema.parse(input);

    // Check if product exists and is monetary type
    const product = await db.query.products.findFirst({
      where: eq(products.id, validated.productId),
    });

    if (!product) {
      return {
        success: false,
        error: 'PRODUCT_NOT_FOUND',
      };
    }

    if (product.donationType !== 'monetary') {
      return {
        success: false,
        error: 'INVALID_DONATION_TYPE',
      };
    }

    // Reject if already fully funded
    if (
      product.targetAmount != null &&
      product.currentAmount >= product.targetAmount
    ) {
      return {
        success: false,
        error: 'ALREADY_FUNDED',
      };
    }

    // Create donation
    const donationResult = await db
      .insert(donations)
      .values({
        productId: validated.productId,
        donationType: 'monetary',
        amount: validated.amount,
        donorName: validated.donorName || null,
        receiptPath: validated.receiptPath,
      })
      .returning({ id: donations.id });

    // Update product current amount
    await db
      .update(products)
      .set({
        currentAmount: product.currentAmount + validated.amount,
        updatedAt: new Date(),
      })
      .where(eq(products.id, validated.productId));

    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/admin/dashboard');

    return {
      success: true,
      data: { donationId: donationResult[0].id },
    };
  } catch (error) {
    console.error('createMonetaryDonation error:', error);

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

/**
 * Create a physical pledge and mark product as fulfilled
 */
export async function createPhysicalPledge(
  input: unknown
): Promise<ActionResult<{ donationId: string }>> {
  try {
    const validated = createPhysicalPledgeSchema.parse(input);

    // Check if product exists and is physical type
    const product = await db.query.products.findFirst({
      where: eq(products.id, validated.productId),
    });

    if (!product) {
      return {
        success: false,
        error: 'PRODUCT_NOT_FOUND',
      };
    }

    if (product.donationType !== 'physical') {
      return {
        success: false,
        error: 'INVALID_DONATION_TYPE',
      };
    }

    if (product.isFulfilled) {
      return {
        success: false,
        error: 'ALREADY_FULFILLED',
      };
    }

    // Create donation
    const pledgeResult = await db
      .insert(donations)
      .values({
        productId: validated.productId,
        donationType: 'physical',
        donorName: validated.donorName,
        donorPhone: validated.donorPhone,
        donorEmail: validated.donorEmail || null,
      })
      .returning({ id: donations.id });

    // Update product fulfilled status
    await db
      .update(products)
      .set({
        isFulfilled: true,
        updatedAt: new Date(),
      })
      .where(eq(products.id, validated.productId));

    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/admin/dashboard');

    return {
      success: true,
      data: { donationId: pledgeResult[0].id },
    };
  } catch (error) {
    console.error('createPhysicalPledge error:', error);

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

/**
 * Generate a signed URL for file upload to Supabase Storage
 */
export async function generateUploadUrl(
  input: unknown
): Promise<
  ActionResult<{ signedUrl: string; path: string }>
> {
  try {
    const validated = generateUploadUrlSchema.parse(input);
    const path = generateStoragePath(
      validated.bucket,
      validated.fileExtension
    );

    const { signedUrl, path: storagePath } = await generateSignedUploadUrl(
      validated.bucket,
      path
    );

    return {
      success: true,
      data: {
        signedUrl,
        path: storagePath,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('generateUploadUrl error:', message, error);

    if (error instanceof ZodError) {
      return {
        success: false,
        error: 'VALIDATION_ERROR',
        details: error.flatten(),
      };
    }

    return {
      success: false,
      error: 'STORAGE_ERROR',
      details: { message },
    };
  }
}

/**
 * Upload file directly (server-side). Bypasses RLS via service_role.
 * Use for receipts (public) or pix-qr (admin only).
 */
export async function uploadFile(
  formData: FormData
): Promise<ActionResult<{ path: string }>> {
  try {
    const bucket = formData.get('bucket') as string | null;
    const file = formData.get('file') as File | null;

    if (!bucket || !file) {
      return {
        success: false,
        error: 'VALIDATION_ERROR',
        details: { message: 'Bucket and file are required' },
      };
    }

    if (bucket !== 'receipts' && bucket !== 'pix-qr') {
      return {
        success: false,
        error: 'VALIDATION_ERROR',
        details: { message: 'Invalid bucket' },
      };
    }

    if (bucket === 'pix-qr') {
      const isAdmin = await validateSession();
      if (!isAdmin) {
        return { success: false, error: 'UNAUTHORIZED' };
      }
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const allowedExt = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
    if (!allowedExt.includes(ext)) {
      return {
        success: false,
        error: 'VALIDATION_ERROR',
        details: { message: 'Invalid file type' },
      };
    }

    const path = generateStoragePath(bucket, ext);
    const fileBuffer = await file.arrayBuffer();

    await uploadFileDirect(bucket, path, Buffer.from(fileBuffer), {
      contentType: file.type || 'application/octet-stream',
      upsert: true,
    });

    return {
      success: true,
      data: { path },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('uploadFile error:', message, error);

    return {
      success: false,
      error: 'STORAGE_ERROR',
      details: { message },
    };
  }
}
