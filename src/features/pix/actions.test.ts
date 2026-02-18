import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updatePixSettings } from './actions';
import { validateSession } from '@/lib/auth/session';

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      pixSettings: {
        findFirst: vi.fn(),
      },
    },
    update: vi.fn(),
    insert: vi.fn(),
  },
}));

vi.mock('@/lib/auth/session', () => ({
  validateSession: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('PIX Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateSession).mockResolvedValue(true);
  });

  describe('updatePixSettings', () => {
    it('should reject when unauthorized', async () => {
      vi.mocked(validateSession).mockResolvedValueOnce(false);

      const result = await updatePixSettings({
        copiaEColaCode: '00020126...',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('UNAUTHORIZED');
    });

    it('should update existing settings with WHERE clause', async () => {
      const { db } = await import('@/lib/db');

      vi.mocked(db.query.pixSettings.findFirst).mockResolvedValueOnce({
        id: 'pix-123',
        qrCodeImagePath: null,
        copiaEColaCode: 'old',
        updatedAt: new Date(),
      });

      vi.mocked(db.update).mockReturnValue({
        set: () => ({
          where: () => Promise.resolve(undefined),
        }),
      } as never);

      const result = await updatePixSettings({
        copiaEColaCode: '00020126580014br.gov.bcb.pix...',
      });

      expect(result.success).toBe(true);
      expect(db.update).toHaveBeenCalled();
    });

    it('should insert when no existing settings', async () => {
      const { db } = await import('@/lib/db');

      vi.mocked(db.query.pixSettings.findFirst).mockResolvedValueOnce(null);

      vi.mocked(db.insert).mockReturnValue({
        values: () => Promise.resolve(undefined),
      } as never);

      const result = await updatePixSettings({
        copiaEColaCode: 'new-code',
        qrCodeImagePath: 'pix-qr/path.png',
      });

      expect(result.success).toBe(true);
      expect(db.insert).toHaveBeenCalled();
    });
  });
});
