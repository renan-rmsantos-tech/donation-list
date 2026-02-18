import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from './actions';
import { validateSession } from '@/lib/auth/session';

vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    query: {
      products: { findFirst: vi.fn() },
    },
  },
}));

vi.mock('@/lib/auth/session', () => ({
  validateSession: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Product Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateSession).mockResolvedValue(true);
  });

  describe('createProduct', () => {
    it('should reject when unauthorized', async () => {
      vi.mocked(validateSession).mockResolvedValueOnce(false);

      const result = await createProduct({
        name: 'Produto',
        description: 'Desc',
        donationType: 'physical',
        categoryIds: [],
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('UNAUTHORIZED');
    });

    it('should reject monetary product without targetAmount', async () => {
      const result = await createProduct({
        name: 'Produto',
        description: 'Desc',
        donationType: 'monetary',
        categoryIds: [],
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('VALIDATION_ERROR');
    });

    it('should create physical product when valid', async () => {
      const { db } = await import('@/lib/db');

      vi.mocked(db.insert).mockImplementation(
        () =>
          ({
            values: () => ({
              returning: () => Promise.resolve([{ id: 'prod-123' }]),
            }),
          }) as never
      );

      const result = await createProduct({
        name: 'Vela',
        description: 'Velas',
        donationType: 'physical',
        categoryIds: [],
      });

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('prod-123');
    });

    it('should create monetary product with targetAmount', async () => {
      const { db } = await import('@/lib/db');

      vi.mocked(db.insert).mockImplementation(
        () =>
          ({
            values: () => ({
              returning: () => Promise.resolve([{ id: 'prod-456' }]),
            }),
          }) as never
      );

      const result = await createProduct({
        name: 'Cadeira',
        description: 'Cadeira',
        donationType: 'monetary',
        targetAmount: 50000,
        categoryIds: [],
      });

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('prod-456');
    });
  });

  describe('updateProduct', () => {
    it('should reject when unauthorized', async () => {
      vi.mocked(validateSession).mockResolvedValueOnce(false);

      const result = await updateProduct('prod-123', { name: 'Novo' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('UNAUTHORIZED');
    });

    it('should update product when valid', async () => {
      const { db } = await import('@/lib/db');

      vi.mocked(db.update).mockReturnValue({
        set: () => ({
          where: () => Promise.resolve(undefined),
        }),
      } as never);

      vi.mocked(db.delete).mockReturnValue({
        where: () => Promise.resolve(undefined),
      } as never);

      vi.mocked(db.insert).mockReturnValue({
        values: () => Promise.resolve(undefined),
      } as never);

      const result = await updateProduct('prod-123', {
        name: 'Atualizado',
        description: 'Nova desc',
      });

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('prod-123');
    });
  });

  describe('deleteProduct', () => {
    it('should reject when unauthorized', async () => {
      vi.mocked(validateSession).mockResolvedValueOnce(false);

      const result = await deleteProduct('prod-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('UNAUTHORIZED');
    });

    it('should delete product when authorized', async () => {
      const { db } = await import('@/lib/db');

      vi.mocked(db.delete).mockReturnValue({
        where: () => Promise.resolve(undefined),
      } as never);

      const result = await deleteProduct('prod-123');

      expect(result.success).toBe(true);
    });
  });
});
