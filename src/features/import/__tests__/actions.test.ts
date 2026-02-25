import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as sessionModule from '@/lib/auth/session';
import * as storageModule from '@/lib/storage/supabase';
import * as productsModule from '@/features/products/actions';
import { searchPexelsPhotos, downloadAndUploadPhoto, bulkCreateProducts } from '../actions';

// Mock dependencies
vi.mock('@/lib/auth/session');
vi.mock('@/lib/storage/supabase');
vi.mock('@/features/products/actions');
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

const mockValidateSession = vi.mocked(sessionModule.validateSession);
const mockUploadFileDirect = vi.mocked(storageModule.uploadFileDirect);
const mockCreateProduct = vi.mocked(productsModule.createProduct);

// Set environment variable for tests
beforeEach(() => {
  process.env.PEXELS_API_KEY = 'test-api-key';
});

afterEach(() => {
  delete process.env.PEXELS_API_KEY;
});

describe('searchPexelsPhotos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 3 photos with correct shape on valid query', async () => {
    mockValidateSession.mockResolvedValue(true);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        photos: [
          {
            id: 1,
            src: { medium: 'https://images.pexels.com/photos/1/medium.jpg' },
            src_large: 'https://images.pexels.com/photos/1/large.jpg',
            alt: 'Photo 1',
            photographer: 'Photographer 1',
          },
          {
            id: 2,
            src: { medium: 'https://images.pexels.com/photos/2/medium.jpg' },
            src_large: 'https://images.pexels.com/photos/2/large.jpg',
            alt: 'Photo 2',
            photographer: 'Photographer 2',
          },
          {
            id: 3,
            src: { medium: 'https://images.pexels.com/photos/3/medium.jpg' },
            src_large: 'https://images.pexels.com/photos/3/large.jpg',
            alt: 'Photo 3',
            photographer: 'Photographer 3',
          },
        ],
      }),
    });

    global.fetch = mockFetch;

    const result = await searchPexelsPhotos({
      query: 'camera',
      perPage: 3,
    });

    expect(result.success).toBe(true);
    expect(result.data?.photos).toHaveLength(3);
    expect(result.data?.photos[0]).toMatchObject({
      id: 1,
      src: 'https://images.pexels.com/photos/1/medium.jpg',
      srcLarge: 'https://images.pexels.com/photos/1/large.jpg',
      alt: 'Photo 1',
      photographer: 'Photographer 1',
    });
  });

  it('should return EXTERNAL_API_ERROR on 429 rate limit', async () => {
    mockValidateSession.mockResolvedValue(true);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
    });

    global.fetch = mockFetch;

    const result = await searchPexelsPhotos({
      query: 'camera',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('EXTERNAL_API_ERROR');
    expect(result.details).toMatchObject({
      statusCode: 429,
      message: 'Limite de busca excedido. Tente novamente em alguns minutos.',
    });
  });

  it('should return EXTERNAL_API_ERROR on network failure', async () => {
    mockValidateSession.mockResolvedValue(true);

    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));

    global.fetch = mockFetch;

    const result = await searchPexelsPhotos({
      query: 'camera',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('EXTERNAL_API_ERROR');
  });

  it('should return UNAUTHORIZED when no admin session', async () => {
    mockValidateSession.mockResolvedValue(false);

    const result = await searchPexelsPhotos({
      query: 'camera',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('UNAUTHORIZED');
  });

  it('should return VALIDATION_ERROR on invalid query (over 200 chars)', async () => {
    mockValidateSession.mockResolvedValue(true);

    const longQuery = 'a'.repeat(201);

    const result = await searchPexelsPhotos({
      query: longQuery,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('VALIDATION_ERROR');
  });

  it('should return empty photos array when no results found', async () => {
    mockValidateSession.mockResolvedValue(true);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        photos: [],
      }),
    });

    global.fetch = mockFetch;

    const result = await searchPexelsPhotos({
      query: 'xyznonexistent',
    });

    expect(result.success).toBe(true);
    expect(result.data?.photos).toHaveLength(0);
  });
});

describe('downloadAndUploadPhoto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch photo and upload to Supabase, returning imagePath', async () => {
    mockValidateSession.mockResolvedValue(true);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'image/jpeg']]),
      arrayBuffer: async () => new ArrayBuffer(100),
    });

    global.fetch = mockFetch;
    mockUploadFileDirect.mockResolvedValue({ path: 'product-photos/2026-02-25-abc123.jpeg' });

    const result = await downloadAndUploadPhoto({
      photoUrl: 'https://images.pexels.com/photos/123/large.jpg',
      productName: 'Camera',
    });

    expect(result.success).toBe(true);
    expect(result.data?.imagePath).toMatch(/^product-photos\/\d{4}-\d{2}-\d{2}-[a-f0-9]+\.jpeg$/);
    expect(mockUploadFileDirect).toHaveBeenCalledWith(
      'product-photos',
      expect.stringMatching(/^product-photos\//),
      expect.any(Buffer),
      { contentType: 'image/jpeg' }
    );
  });

  it('should return VALIDATION_ERROR on non-Pexels URL', async () => {
    mockValidateSession.mockResolvedValue(true);

    const result = await downloadAndUploadPhoto({
      photoUrl: 'https://example.com/photo.jpg',
      productName: 'Camera',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('VALIDATION_ERROR');
  });

  it('should return EXTERNAL_API_ERROR on download failure', async () => {
    mockValidateSession.mockResolvedValue(true);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    global.fetch = mockFetch;

    const result = await downloadAndUploadPhoto({
      photoUrl: 'https://images.pexels.com/photos/notfound/large.jpg',
      productName: 'Camera',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('EXTERNAL_API_ERROR');
  });

  it('should return STORAGE_ERROR on upload failure', async () => {
    mockValidateSession.mockResolvedValue(true);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'image/jpeg']]),
      arrayBuffer: async () => new ArrayBuffer(100),
    });

    global.fetch = mockFetch;
    mockUploadFileDirect.mockRejectedValue(new Error('Upload failed'));

    const result = await downloadAndUploadPhoto({
      photoUrl: 'https://images.pexels.com/photos/123/large.jpg',
      productName: 'Camera',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('STORAGE_ERROR');
  });

  it('should detect PNG content type correctly', async () => {
    mockValidateSession.mockResolvedValue(true);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'image/png']]),
      arrayBuffer: async () => new ArrayBuffer(100),
    });

    global.fetch = mockFetch;
    mockUploadFileDirect.mockResolvedValue({ path: 'product-photos/2026-02-25-abc123.png' });

    const result = await downloadAndUploadPhoto({
      photoUrl: 'https://images.pexels.com/photos/123/large.jpg',
      productName: 'Camera',
    });

    expect(result.success).toBe(true);
    expect(mockUploadFileDirect).toHaveBeenCalledWith(
      'product-photos',
      expect.stringMatching(/\.png$/),
      expect.any(Buffer),
      { contentType: 'image/png' }
    );
  });

  it('should return UNAUTHORIZED when no admin session', async () => {
    mockValidateSession.mockResolvedValue(false);

    const result = await downloadAndUploadPhoto({
      photoUrl: 'https://images.pexels.com/photos/123/large.jpg',
      productName: 'Camera',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('UNAUTHORIZED');
  });
});

describe('bulkCreateProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PEXELS_API_KEY = 'test-api-key';

    // Mock successful image download/upload by default
    mockUploadFileDirect.mockResolvedValue({ path: 'product-photos/2026-02-25-abc123.jpeg' });
  });

  it('should create all valid items successfully', async () => {
    mockValidateSession.mockResolvedValue(true);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'image/jpeg']]),
      arrayBuffer: async () => new ArrayBuffer(100),
    });

    global.fetch = mockFetch;
    mockCreateProduct.mockResolvedValue({
      success: true,
      data: { id: 'product-1' },
    });

    const result = await bulkCreateProducts({
      items: [
        {
          name: 'Item 1',
          description: 'Description 1',
          donationType: 'monetary',
          targetAmount: 10000,
          categoryId: '550e8400-e29b-41d4-a716-446655440001',
          photoUrl: 'https://images.pexels.com/photos/1/large.jpg',
          isPublished: true,
        },
        {
          name: 'Item 2',
          description: 'Description 2',
          donationType: 'physical',
          categoryId: '550e8400-e29b-41d4-a716-446655440002',
          photoUrl: 'https://images.pexels.com/photos/2/large.jpg',
          isPublished: true,
        },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.data?.results).toHaveLength(2);
    expect(result.data?.results[0]).toMatchObject({
      rowIndex: 0,
      name: 'Item 1',
      success: true,
      productId: 'product-1',
    });
    expect(result.data?.results[1]).toMatchObject({
      rowIndex: 1,
      name: 'Item 2',
      success: true,
      productId: 'product-1',
    });
    expect(mockCreateProduct).toHaveBeenCalledTimes(2);
  });

  it('should handle partial failure (some items fail, others succeed)', async () => {
    mockValidateSession.mockResolvedValue(true);

    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'image/jpeg']]),
        arrayBuffer: async () => new ArrayBuffer(100),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

    global.fetch = mockFetch;
    mockUploadFileDirect.mockResolvedValueOnce({ path: 'product-photos/2026-02-25-abc123.jpeg' });
    mockCreateProduct.mockResolvedValueOnce({
      success: true,
      data: { id: 'product-1' },
    });

    const result = await bulkCreateProducts({
      items: [
        {
          name: 'Item 1',
          description: 'Description 1',
          donationType: 'monetary',
          targetAmount: 10000,
          categoryId: '550e8400-e29b-41d4-a716-446655440001',
          photoUrl: 'https://images.pexels.com/photos/1/large.jpg',
          isPublished: true,
        },
        {
          name: 'Item 2',
          description: 'Description 2',
          donationType: 'physical',
          categoryId: '550e8400-e29b-41d4-a716-446655440002',
          photoUrl: 'https://images.pexels.com/photos/2/large.jpg',
          isPublished: true,
        },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.data?.results).toHaveLength(2);
    expect(result.data?.results[0].success).toBe(true);
    expect(result.data?.results[1].success).toBe(false);
    expect(result.data?.results[1].error).toBeDefined();
    expect(mockCreateProduct).toHaveBeenCalledTimes(1); // Only first item succeeds with photo, second fails on download
  });

  it('should return UNAUTHORIZED when no admin session', async () => {
    mockValidateSession.mockResolvedValue(false);

    const result = await bulkCreateProducts({
      items: [
        {
          name: 'Item 1',
          description: 'Description 1',
          donationType: 'monetary',
          targetAmount: 10000,
          categoryId: '550e8400-e29b-41d4-a716-446655440001',
          photoUrl: 'https://images.pexels.com/photos/1/large.jpg',
        },
      ],
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('UNAUTHORIZED');
  });

  it('should return VALIDATION_ERROR on invalid input array', async () => {
    mockValidateSession.mockResolvedValue(true);

    const result = await bulkCreateProducts({
      items: [], // Empty array
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('VALIDATION_ERROR');
  });

  it('should return VALIDATION_ERROR on missing required fields', async () => {
    mockValidateSession.mockResolvedValue(true);

    const result = await bulkCreateProducts({
      items: [
        {
          name: '', // Empty name
          description: 'Description 1',
          donationType: 'monetary',
          targetAmount: 10000,
          categoryId: '550e8400-e29b-41d4-a716-446655440001',
          photoUrl: 'https://images.pexels.com/photos/1/large.jpg',
        },
      ],
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('VALIDATION_ERROR');
  });

  it('should enforce monetary products have targetAmount', async () => {
    mockValidateSession.mockResolvedValue(true);

    const result = await bulkCreateProducts({
      items: [
        {
          name: 'Item 1',
          description: 'Description 1',
          donationType: 'monetary',
          // Missing targetAmount
          categoryId: '550e8400-e29b-41d4-a716-446655440001',
          photoUrl: 'https://images.pexels.com/photos/1/large.jpg',
        },
      ],
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('VALIDATION_ERROR');
  });

  it('should handle product creation failure but continue with other items', async () => {
    mockValidateSession.mockResolvedValue(true);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'image/jpeg']]),
      arrayBuffer: async () => new ArrayBuffer(100),
    });

    global.fetch = mockFetch;
    mockUploadFileDirect.mockResolvedValue({ path: 'product-photos/2026-02-25-abc123.jpeg' });
    mockCreateProduct
      .mockResolvedValueOnce({
        success: false,
        error: 'INTERNAL_ERROR',
      })
      .mockResolvedValueOnce({
        success: true,
        data: { id: 'product-2' },
      });

    const result = await bulkCreateProducts({
      items: [
        {
          name: 'Item 1',
          description: 'Description 1',
          donationType: 'monetary',
          targetAmount: 10000,
          categoryId: '550e8400-e29b-41d4-a716-446655440001',
          photoUrl: 'https://images.pexels.com/photos/1/large.jpg',
          isPublished: true,
        },
        {
          name: 'Item 2',
          description: 'Description 2',
          donationType: 'physical',
          categoryId: '550e8400-e29b-41d4-a716-446655440002',
          photoUrl: 'https://images.pexels.com/photos/2/large.jpg',
          isPublished: true,
        },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.data?.results).toHaveLength(2);
    expect(result.data?.results[0].success).toBe(false);
    expect(result.data?.results[1].success).toBe(true);
    expect(mockCreateProduct).toHaveBeenCalledTimes(2);
  });

  it('should include rowIndex and name in results', async () => {
    mockValidateSession.mockResolvedValue(true);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'image/jpeg']]),
      arrayBuffer: async () => new ArrayBuffer(100),
    });

    global.fetch = mockFetch;
    mockUploadFileDirect.mockResolvedValue({ path: 'product-photos/2026-02-25-abc123.jpeg' });
    mockCreateProduct.mockResolvedValue({
      success: true,
      data: { id: 'product-1' },
    });

    const result = await bulkCreateProducts({
      items: [
        {
          name: 'Camera',
          description: 'A great camera',
          donationType: 'monetary',
          targetAmount: 5000,
          categoryId: '550e8400-e29b-41d4-a716-446655440001',
          photoUrl: 'https://images.pexels.com/photos/1/large.jpg',
          isPublished: true,
        },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.data?.results[0]).toMatchObject({
      rowIndex: 0,
      name: 'Camera',
      success: true,
    });
  });
});
