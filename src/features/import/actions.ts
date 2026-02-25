'use server';

import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';
import { validateSession } from '@/lib/auth/session';
import { uploadFileDirect } from '@/lib/storage/supabase';
import { generateStoragePath } from '@/lib/utils/format';
import { createProduct } from '@/features/products/actions';
import {
  searchPexelsPhotosSchema,
  downloadAndUploadPhotoSchema,
  bulkCreateProductSchema,
} from './schemas';
import { PexelsPhoto, ImportResult } from './lib/wizard-reducer';

interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

interface SearchPexelsPhotosResult {
  photos: PexelsPhoto[];
}

interface DownloadAndUploadPhotoResult {
  imagePath: string;
}

interface BulkCreateProductResult {
  results: ImportResult[];
}

export async function searchPexelsPhotos(
  input: unknown
): Promise<ActionResult<SearchPexelsPhotosResult>> {
  try {
    const isAdmin = await validateSession();
    if (!isAdmin) {
      return {
        success: false,
        error: 'UNAUTHORIZED',
      };
    }

    const validated = searchPexelsPhotosSchema.parse(input);

    if (!process.env.PEXELS_API_KEY) {
      console.error('searchPexelsPhotos error: PEXELS_API_KEY environment variable is not set');
      return {
        success: false,
        error: 'EXTERNAL_API_ERROR',
        details: { message: 'Configuração de API não disponível' },
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const searchParams = new URLSearchParams({
        query: validated.query,
        per_page: validated.perPage.toString(),
      });

      const response = await fetch(`https://api.pexels.com/v1/search?${searchParams}`, {
        headers: {
          Authorization: process.env.PEXELS_API_KEY,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        console.error('searchPexelsPhotos error: Rate limit exceeded (429)');
        return {
          success: false,
          error: 'EXTERNAL_API_ERROR',
          details: { message: 'Limite de busca excedido. Tente novamente em alguns minutos.', statusCode: 429 },
        };
      }

      if (!response.ok) {
        console.error(`searchPexelsPhotos error: ${response.status} ${response.statusText}`);
        return {
          success: false,
          error: 'EXTERNAL_API_ERROR',
          details: { message: 'Erro ao buscar fotos. Tente novamente.', statusCode: response.status },
        };
      }

      const data = await response.json() as { photos?: Array<{
        id: number;
        src: { medium?: string };
        src_large?: string;
        alt?: string;
        photographer?: string;
      }> };

      const photos = (data.photos ?? []).map((photo) => ({
        id: photo.id,
        src: photo.src?.medium ?? '',
        srcLarge: photo.src_large ?? '',
        alt: photo.alt ?? '',
        photographer: photo.photographer ?? '',
      }));

      console.log(`searchPexelsPhotos: query="${validated.query}", results=${photos.length}`);

      return {
        success: true,
        data: { photos },
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('searchPexelsPhotos error: Request timeout (10 seconds)');
        return {
          success: false,
          error: 'EXTERNAL_API_ERROR',
          details: { message: 'Busca expirou. Tente novamente.' },
        };
      }
      throw error;
    }
  } catch (error) {
    console.error('searchPexelsPhotos error:', error);

    if (error instanceof ZodError) {
      return {
        success: false,
        error: 'VALIDATION_ERROR',
        details: error.flatten(),
      };
    }

    return {
      success: false,
      error: 'EXTERNAL_API_ERROR',
      details: { message: 'Erro ao buscar fotos' },
    };
  }
}

export async function downloadAndUploadPhoto(
  input: unknown
): Promise<ActionResult<DownloadAndUploadPhotoResult>> {
  try {
    const isAdmin = await validateSession();
    if (!isAdmin) {
      return {
        success: false,
        error: 'UNAUTHORIZED',
      };
    }

    const validated = downloadAndUploadPhotoSchema.parse(input);

    console.log(`downloadAndUploadPhoto: downloading from ${validated.photoUrl}`);

    const response = await fetch(validated.photoUrl);

    if (!response.ok) {
      console.error(`downloadAndUploadPhoto error: ${response.status} ${response.statusText}`);
      return {
        success: false,
        error: 'EXTERNAL_API_ERROR',
        details: { message: 'Erro ao baixar foto da Pexels' },
      };
    }

    const contentType = response.headers.get('content-type') ?? 'image/jpeg';
    const buffer = await response.arrayBuffer();

    let extension = 'jpeg';
    if (contentType.includes('png')) {
      extension = 'png';
    } else if (contentType.includes('webp')) {
      extension = 'webp';
    } else if (contentType.includes('gif')) {
      extension = 'gif';
    }

    const imagePath = generateStoragePath('product-photos', extension);

    try {
      await uploadFileDirect('product-photos', imagePath, Buffer.from(buffer), {
        contentType,
      });

      console.log(`downloadAndUploadPhoto: uploaded to ${imagePath}`);

      return {
        success: true,
        data: { imagePath },
      };
    } catch (uploadError) {
      console.error('downloadAndUploadPhoto error: Upload failed', uploadError);
      return {
        success: false,
        error: 'STORAGE_ERROR',
        details: { message: 'Erro ao enviar foto para armazenamento' },
      };
    }
  } catch (error) {
    console.error('downloadAndUploadPhoto error:', error);

    if (error instanceof ZodError) {
      return {
        success: false,
        error: 'VALIDATION_ERROR',
        details: error.flatten(),
      };
    }

    return {
      success: false,
      error: 'EXTERNAL_API_ERROR',
      details: { message: 'Erro ao processar foto' },
    };
  }
}

export async function bulkCreateProducts(
  input: unknown
): Promise<ActionResult<BulkCreateProductResult>> {
  try {
    const isAdmin = await validateSession();
    if (!isAdmin) {
      return {
        success: false,
        error: 'UNAUTHORIZED',
      };
    }

    const validated = bulkCreateProductSchema.parse(input);

    console.log(`bulkCreateProducts: creating ${validated.items.length} products`);

    const results: ImportResult[] = [];

    for (let i = 0; i < validated.items.length; i++) {
      const item = validated.items[i];
      const rowIndex = i;

      try {
        console.log(`bulkCreateProducts: item ${i + 1}/${validated.items.length} - processing ${item.name}`);

        const photoResult = await downloadAndUploadPhoto({
          photoUrl: item.photoUrl,
          productName: item.name,
        });

        let imagePath: string | undefined;
        if (photoResult.success && photoResult.data) {
          imagePath = photoResult.data.imagePath;
        } else {
          const errorMsg = 'Erro ao enviar foto';
          results.push({
            rowIndex,
            name: item.name,
            success: false,
            error: errorMsg,
          });
          console.log(`bulkCreateProducts: item ${i + 1}/${validated.items.length} - failed: ${errorMsg}`);
          continue;
        }

        const productResult = await createProduct({
          name: item.name,
          description: item.description,
          donationType: item.donationType,
          targetAmount: item.targetAmount,
          categoryIds: [item.categoryId],
          imagePath,
          isPublished: item.isPublished,
        });

        if (productResult.success && productResult.data) {
          results.push({
            rowIndex,
            name: item.name,
            success: true,
            productId: productResult.data.id,
          });
          console.log(`bulkCreateProducts: item ${i + 1}/${validated.items.length} - success: productId=${productResult.data.id}`);
        } else {
          const errorMsg = productResult.error ?? 'Erro ao criar produto';
          results.push({
            rowIndex,
            name: item.name,
            success: false,
            error: errorMsg,
          });
          console.log(`bulkCreateProducts: item ${i + 1}/${validated.items.length} - failed: ${errorMsg}`);
        }
      } catch (itemError) {
        console.error(`bulkCreateProducts error on item ${i}:`, itemError);
        results.push({
          rowIndex,
          name: item.name,
          success: false,
          error: 'Erro ao processar item',
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    console.log(`bulkCreateProducts: completed ${successCount}/${validated.items.length}`);

    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/admin/products');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/import');

    return {
      success: true,
      data: { results },
    };
  } catch (error) {
    console.error('bulkCreateProducts error:', error);

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
      details: { message: 'Erro ao criar produtos em lote' },
    };
  }
}
