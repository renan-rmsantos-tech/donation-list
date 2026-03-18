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
    it('returns published products when 2+ products and at least one has balance >= R$ 1,00', async () => {
      mockProductsFindMany.mockResolvedValueOnce([
        { id: 'p-1', name: 'Produto A', currentAmount: 1000 },
        { id: 'p-2', name: 'Produto B', currentAmount: 2500 },
      ]);

      const result = await getProductsForTransfer();

      expect(result).toHaveLength(2);
      expect(result[1].currentAmount).toBe(2500);
      expect(mockProductsFindMany).toHaveBeenCalledTimes(1);
      expect(mockProductsFindMany.mock.calls[0][0]).toMatchObject({
        where: expect.anything(),
      });
    });

    it('returns empty list when only one product', async () => {
      mockProductsFindMany.mockResolvedValueOnce([
        { id: 'p-1', name: 'Produto A', currentAmount: 5000 },
      ]);

      const result = await getProductsForTransfer();

      expect(result).toEqual([]);
    });

    it('returns empty list when no product has balance >= R$ 1,00', async () => {
      mockProductsFindMany.mockResolvedValueOnce([
        { id: 'p-1', name: 'Produto A', currentAmount: 50 },
        { id: 'p-2', name: 'Produto B', currentAmount: 0 },
      ]);

      const result = await getProductsForTransfer();

      expect(result).toEqual([]);
    });

    it('returns empty list when products query throws', async () => {
      mockProductsFindMany.mockRejectedValueOnce(new Error('db failure'));

      const result = await getProductsForTransfer();

      expect(result).toEqual([]);
    });
  });
});
