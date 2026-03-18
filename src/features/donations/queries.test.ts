import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getFundTransfers, getProductsForTransfer } from './queries';

const mockFundTransfersFindMany = vi.fn();
const mockProductsFindMany = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      fundTransfers: {
        findMany: (...args: unknown[]) => mockFundTransfersFindMany(...args),
      },
      products: {
        findMany: (...args: unknown[]) => mockProductsFindMany(...args),
      },
    },
  },
}));

describe('donations queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFundTransfers', () => {
    it('returns transfer history with source/target context', async () => {
      mockFundTransfersFindMany.mockResolvedValueOnce([
        {
          id: 'transfer-1',
          sourceProductId: 'source-1',
          targetProductId: 'target-1',
          amount: 500,
          adminUsername: 'admin',
          createdAt: new Date('2026-03-17T10:00:00.000Z'),
          sourceProduct: { id: 'source-1', name: 'Produto A' },
          targetProduct: { id: 'target-1', name: 'Produto B' },
        },
      ]);

      const result = await getFundTransfers();

      expect(result).toHaveLength(1);
      expect(result[0].sourceProduct?.name).toBe('Produto A');
      expect(result[0].targetProduct?.name).toBe('Produto B');
    });

    it('filters history when productId is provided', async () => {
      mockFundTransfersFindMany.mockResolvedValueOnce([
        {
          id: 'transfer-1',
          sourceProductId: 'source-1',
          targetProductId: 'target-1',
          amount: 500,
          adminUsername: 'admin',
          createdAt: new Date('2026-03-17T10:00:00.000Z'),
        },
        {
          id: 'transfer-2',
          sourceProductId: 'source-2',
          targetProductId: 'target-2',
          amount: 300,
          adminUsername: 'admin',
          createdAt: new Date('2026-03-16T10:00:00.000Z'),
        },
      ]);

      const result = await getFundTransfers({ productId: 'source-1' });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('transfer-1');
    });

    it('returns empty list when query throws', async () => {
      mockFundTransfersFindMany.mockRejectedValueOnce(new Error('db failure'));

      const result = await getFundTransfers();

      expect(result).toEqual([]);
    });
  });

  describe('getProductsForTransfer', () => {
    it('returns sourceProducts with balance >= R$ 1,00 and targetProducts not fulfilled', async () => {
      mockProductsFindMany
        .mockResolvedValueOnce([
          { id: 'p-1', name: 'Produto A', currentAmount: 1000 },
          { id: 'p-2', name: 'Produto B', currentAmount: 2500 },
        ])
        .mockResolvedValueOnce([
          { id: 'p-1', name: 'Produto A', currentAmount: 1000 },
          { id: 'p-2', name: 'Produto B', currentAmount: 2500 },
          { id: 'p-3', name: 'Produto C', currentAmount: 500 },
        ]);

      const result = await getProductsForTransfer();

      expect(result.sourceProducts).toHaveLength(2);
      expect(result.sourceProducts[1].currentAmount).toBe(2500);
      expect(result.targetProducts).toHaveLength(3);
      expect(mockProductsFindMany).toHaveBeenCalledTimes(2);
    });

    it('returns empty sourceProducts when no product has balance >= R$ 1,00', async () => {
      mockProductsFindMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          { id: 'p-1', name: 'Produto A', currentAmount: 0 },
          { id: 'p-2', name: 'Produto B', currentAmount: 50 },
        ]);

      const result = await getProductsForTransfer();

      expect(result.sourceProducts).toEqual([]);
      expect(result.targetProducts).toHaveLength(2);
    });

    it('returns empty targetProducts when all products are fulfilled', async () => {
      mockProductsFindMany
        .mockResolvedValueOnce([
          { id: 'p-1', name: 'Produto A', currentAmount: 5000 },
        ])
        .mockResolvedValueOnce([]);

      const result = await getProductsForTransfer();

      expect(result.sourceProducts).toHaveLength(1);
      expect(result.targetProducts).toEqual([]);
    });

    it('returns empty lists when products query throws', async () => {
      mockProductsFindMany.mockRejectedValueOnce(new Error('db failure'));

      const result = await getProductsForTransfer();

      expect(result).toEqual({ sourceProducts: [], targetProducts: [] });
    });
  });
});
