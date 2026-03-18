// @ts-nocheck - Mock chain types don't match Drizzle's PgSelectBuilder
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDashboardStats } from './queries';

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
        groupBy: vi.fn().mockResolvedValue([]),
      }),
    }),
    query: {
      products: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    },
  },
}));

describe('getDashboardStats', () => {
  beforeEach(async () => {
    const { db } = await import('@/lib/db');
    vi.mocked(db.select).mockReset();
    vi.mocked(db.query.products.findMany).mockResolvedValue([]);
  });

  describe('monetary aggregation', () => {
    it('should sum total monetary donations across all monetary donations', async () => {
      const { db } = await import('@/lib/db');
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ total: 15000 }]),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockResolvedValue([]),
          }),
        });

      const result = await getDashboardStats();

      expect(result.totalMonetaryDonations).toBe(15000);
      expect(result.hasTransfersAvailable).toBe(false);
    });

    it('should aggregate multiple monetary donations across products', async () => {
      const { db } = await import('@/lib/db');
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ total: 50000 }]),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockResolvedValue([
              { isFulfilled: false, count: 2 },
              { isFulfilled: true, count: 1 },
            ]),
          }),
        });

      const result = await getDashboardStats();

      expect(result.totalMonetaryDonations).toBe(50000);
      expect(result.totalPhysicalFulfilled).toBe(1);
      expect(result.totalPhysicalPending).toBe(2);
    });

    it('should return 0 when no monetary donations exist', async () => {
      const { db } = await import('@/lib/db');
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ total: null }]),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockResolvedValue([]),
          }),
        });

      const result = await getDashboardStats();

      expect(result.totalMonetaryDonations).toBe(0);
    });

    it('should handle sum returning null (empty donations table)', async () => {
      const { db } = await import('@/lib/db');
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockResolvedValue([]),
          }),
        });

      const result = await getDashboardStats();

      expect(result.totalMonetaryDonations).toBe(0);
    });
  });

  describe('physical fulfilled/pending counts', () => {
    it('should count physical products by fulfillment status', async () => {
      const { db } = await import('@/lib/db');
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ total: 0 }]),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockResolvedValue([
              { isFulfilled: true, count: 3 },
              { isFulfilled: false, count: 5 },
            ]),
          }),
        });

      const result = await getDashboardStats();

      expect(result.totalPhysicalFulfilled).toBe(3);
      expect(result.totalPhysicalPending).toBe(5);
    });

    it('should return 0 for fulfilled when no physical products are fulfilled', async () => {
      const { db } = await import('@/lib/db');
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ total: 0 }]),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockResolvedValue([{ isFulfilled: false, count: 4 }]),
          }),
        });

      const result = await getDashboardStats();

      expect(result.totalPhysicalFulfilled).toBe(0);
      expect(result.totalPhysicalPending).toBe(4);
    });

    it('should return 0 for pending when all physical products are fulfilled', async () => {
      const { db } = await import('@/lib/db');
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ total: 0 }]),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockResolvedValue([{ isFulfilled: true, count: 2 }]),
          }),
        });

      const result = await getDashboardStats();

      expect(result.totalPhysicalFulfilled).toBe(2);
      expect(result.totalPhysicalPending).toBe(0);
    });

    it('should return 0 for both when no physical products exist', async () => {
      const { db } = await import('@/lib/db');
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ total: 0 }]),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockResolvedValue([]),
          }),
        });

      const result = await getDashboardStats();

      expect(result.totalPhysicalFulfilled).toBe(0);
      expect(result.totalPhysicalPending).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should return zeros when no products and no donations', async () => {
      const { db } = await import('@/lib/db');
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ total: null }]),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockResolvedValue([]),
          }),
        });

      const result = await getDashboardStats();

      expect(result).toEqual({
        totalMonetaryDonations: 0,
        totalPhysicalFulfilled: 0,
        totalPhysicalPending: 0,
        hasTransfersAvailable: false,
      });
    });

    it('should handle mixed dataset: monetary only', async () => {
      const { db } = await import('@/lib/db');
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ total: 25000 }]),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockResolvedValue([]),
          }),
        });

      const result = await getDashboardStats();

      expect(result.totalMonetaryDonations).toBe(25000);
      expect(result.totalPhysicalFulfilled).toBe(0);
      expect(result.totalPhysicalPending).toBe(0);
    });

    it('should handle mixed dataset: physical only', async () => {
      const { db } = await import('@/lib/db');
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ total: null }]),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockResolvedValue([
              { isFulfilled: true, count: 1 },
              { isFulfilled: false, count: 2 },
            ]),
          }),
        });

      const result = await getDashboardStats();

      expect(result.totalMonetaryDonations).toBe(0);
      expect(result.totalPhysicalFulfilled).toBe(1);
      expect(result.totalPhysicalPending).toBe(2);
    });

    it('should return zeros on database error', async () => {
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockRejectedValue(new Error('DB connection failed')),
        }),
      });

      const result = await getDashboardStats();

      expect(result).toEqual({
        totalMonetaryDonations: 0,
        totalPhysicalFulfilled: 0,
        totalPhysicalPending: 0,
        hasTransfersAvailable: false,
      });
    });
  });

  describe('consistency with product/donation semantics', () => {
    it('should reflect product isFulfilled for physical counts', async () => {
      const { db } = await import('@/lib/db');
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ total: 0 }]),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockResolvedValue([
              { isFulfilled: true, count: 1 },
              { isFulfilled: false, count: 1 },
            ]),
          }),
        });

      const result = await getDashboardStats();

      expect(result.totalPhysicalFulfilled).toBe(1);
      expect(result.totalPhysicalPending).toBe(1);
    });

    it('should use donations.amount for monetary total (not product.currentAmount)', async () => {
      const { db } = await import('@/lib/db');
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ total: 100000 }]),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockResolvedValue([]),
          }),
        });

      const result = await getDashboardStats();

      expect(result.totalMonetaryDonations).toBe(100000);
    });
  });

  describe('hasTransfersAvailable', () => {
    it('should return true when 2+ products and at least one has balance >= R$ 1,00', async () => {
      const { db } = await import('@/lib/db');
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ total: 0 }]),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockResolvedValue([]),
          }),
        });
      vi.mocked(db.query.products.findMany).mockResolvedValue([
        { id: 'p1', currentAmount: 500 },
        { id: 'p2', currentAmount: 0 },
      ]);

      const result = await getDashboardStats();

      expect(result.hasTransfersAvailable).toBe(true);
    });

    it('should return false when only one product', async () => {
      const { db } = await import('@/lib/db');
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ total: 0 }]),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockResolvedValue([]),
          }),
        });
      vi.mocked(db.query.products.findMany).mockResolvedValue([
        { id: 'p1', currentAmount: 500 },
      ]);

      const result = await getDashboardStats();

      expect(result.hasTransfersAvailable).toBe(false);
    });

    it('should return false when no product has balance >= R$ 1,00', async () => {
      const { db } = await import('@/lib/db');
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ total: 0 }]),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockResolvedValue([]),
          }),
        });
      vi.mocked(db.query.products.findMany).mockResolvedValue([
        { id: 'p1', currentAmount: 50 },
        { id: 'p2', currentAmount: 0 },
      ]);

      const result = await getDashboardStats();

      expect(result.hasTransfersAvailable).toBe(false);
    });
  });
});
