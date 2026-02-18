import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from './actions';
import { validateSession } from '@/lib/auth/session';

vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    query: {
      categories: {
        findFirst: vi.fn(),
      },
    },
  },
}));

vi.mock('@/lib/auth/session', () => ({
  validateSession: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Category Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateSession).mockResolvedValue(true);
  });

  describe('createCategory', () => {
    it('should reject when unauthorized', async () => {
      vi.mocked(validateSession).mockResolvedValueOnce(false);

      const result = await createCategory({ name: 'Test' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('UNAUTHORIZED');
    });

    it('should reject invalid payload', async () => {
      const result = await createCategory({ name: '' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('VALIDATION_ERROR');
    });

    it('should create category when valid', async () => {
      const { db } = await import('@/lib/db');

      vi.mocked(db.insert).mockReturnValue({
        values: () => ({
          returning: () => Promise.resolve([{ id: 'cat-123' }]),
        }),
      } as never);

      const result = await createCategory({ name: 'Sacristia' });

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('cat-123');
    });

    it('should return DUPLICATE_NAME on unique constraint', async () => {
      const { db } = await import('@/lib/db');

      vi.mocked(db.insert).mockReturnValue({
        values: () => ({
          returning: () =>
            Promise.reject(new Error('unique constraint violated')),
        }),
      } as never);

      const result = await createCategory({ name: 'Existing' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('DUPLICATE_NAME');
    });
  });

  describe('updateCategory', () => {
    it('should reject when unauthorized', async () => {
      vi.mocked(validateSession).mockResolvedValueOnce(false);

      const result = await updateCategory('cat-123', { name: 'New' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('UNAUTHORIZED');
    });

    it('should reject invalid payload', async () => {
      const result = await updateCategory('cat-123', { name: '' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('VALIDATION_ERROR');
    });

    it('should update category when valid', async () => {
      const { db } = await import('@/lib/db');

      vi.mocked(db.update).mockReturnValue({
        set: () => ({
          where: () => Promise.resolve(undefined),
        }),
      } as never);

      const result = await updateCategory('cat-123', { name: 'Updated' });

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('cat-123');
    });
  });

  describe('deleteCategory', () => {
    it('should reject when unauthorized', async () => {
      vi.mocked(validateSession).mockResolvedValueOnce(false);

      const result = await deleteCategory('cat-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('UNAUTHORIZED');
    });

    it('should delete category when authorized', async () => {
      const { db } = await import('@/lib/db');

      vi.mocked(db.delete).mockReturnValue({
        where: () => Promise.resolve(undefined),
      } as never);

      const result = await deleteCategory('cat-123');

      expect(result.success).toBe(true);
    });
  });
});
