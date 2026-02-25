import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getPublishedProducts,
  getAllProducts,
  getProductById,
  getPublishedProductById,
  getProductsByCategory,
} from './queries';
import { db } from '@/lib/db';

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    query: {
      products: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      productCategories: {
        findMany: vi.fn(),
      },
    },
  },
}));

describe('Product Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPublishedProducts', () => {
    it('should return only published products', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Product 1',
          description: 'Desc 1',
          donationType: 'monetary' as const,
          targetAmount: 10000,
          currentAmount: 5000,
          isFulfilled: false,
          isPublished: true,
          imagePath: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          productCategories: [],
        },
      ];

      vi.mocked(db.query.products.findMany).mockResolvedValueOnce(mockProducts);

      const result = await getPublishedProducts();

      expect(result).toEqual(mockProducts);
      expect(db.query.products.findMany).toHaveBeenCalled();
    });

    it('should return empty array on error', async () => {
      vi.mocked(db.query.products.findMany).mockRejectedValueOnce(new Error('DB Error'));

      const result = await getPublishedProducts();

      expect(result).toEqual([]);
    });
  });

  describe('getAllProducts', () => {
    it('should return all products regardless of published status', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Product 1',
          description: 'Desc 1',
          donationType: 'monetary' as const,
          targetAmount: 10000,
          currentAmount: 0,
          isFulfilled: false,
          isPublished: false,
          imagePath: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          productCategories: [],
        },
      ];

      vi.mocked(db.query.products.findMany).mockResolvedValueOnce(mockProducts);

      const result = await getAllProducts();

      expect(result).toEqual(mockProducts);
    });

    it('should return empty array on error', async () => {
      vi.mocked(db.query.products.findMany).mockRejectedValueOnce(new Error('DB Error'));

      const result = await getAllProducts();

      expect(result).toEqual([]);
    });
  });

  describe('getProductById', () => {
    it('should return product by id', async () => {
      const mockProduct = {
        id: '1',
        name: 'Product 1',
        description: 'Desc 1',
        donationType: 'monetary' as const,
        targetAmount: 10000,
        currentAmount: 5000,
        isFulfilled: false,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        productCategories: [],
      };

      vi.mocked(db.query.products.findFirst).mockResolvedValueOnce(mockProduct);

      const result = await getProductById('1');

      expect(result).toEqual(mockProduct);
    });

    it('should return null when product not found', async () => {
      vi.mocked(db.query.products.findFirst).mockResolvedValueOnce(null as never);

      const result = await getProductById('nonexistent');

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      vi.mocked(db.query.products.findFirst).mockRejectedValueOnce(new Error('DB Error'));

      const result = await getProductById('1');

      expect(result).toBeNull();
    });
  });

  describe('getPublishedProductById', () => {
    it('should return published product by id', async () => {
      const mockProduct = {
        id: '1',
        name: 'Product 1',
        description: 'Desc 1',
        donationType: 'monetary' as const,
        targetAmount: 10000,
        currentAmount: 5000,
        isFulfilled: false,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        productCategories: [],
      };

      vi.mocked(db.query.products.findFirst).mockResolvedValueOnce(mockProduct);

      const result = await getPublishedProductById('1');

      expect(result).toEqual(mockProduct);
      expect(db.query.products.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.anything(),
        })
      );
    });

    it('should return null when product not found', async () => {
      vi.mocked(db.query.products.findFirst).mockResolvedValueOnce(null as never);

      const result = await getPublishedProductById('nonexistent');

      expect(result).toBeNull();
    });

    it('should return null for unpublished product', async () => {
      vi.mocked(db.query.products.findFirst).mockResolvedValueOnce(null as never);

      const result = await getPublishedProductById('1');

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      vi.mocked(db.query.products.findFirst).mockRejectedValueOnce(new Error('DB Error'));

      const result = await getPublishedProductById('1');

      expect(result).toBeNull();
    });
  });

  describe('getProductsByCategory', () => {
    it('should return published products for a category', async () => {
      const mockProductCategories = [
        {
          productId: '1',
          categoryId: 'cat-1',
          products: {
            id: '1',
            name: 'Product 1',
            description: 'Desc 1',
            donationType: 'monetary' as const,
            targetAmount: 10000,
            currentAmount: 5000,
            isFulfilled: false,
            isPublished: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            productCategories: [],
          },
        },
      ];

      vi.mocked(db.query.productCategories.findMany).mockResolvedValueOnce(mockProductCategories as any);

      const result = await getProductsByCategory('cat-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should filter out unpublished products', async () => {
      const mockProductCategories = [
        {
          productId: '1',
          categoryId: 'cat-1',
          products: {
            id: '1',
            name: 'Product 1',
            description: 'Desc 1',
            donationType: 'monetary' as const,
            targetAmount: 10000,
            currentAmount: 0,
            isFulfilled: false,
            isPublished: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            productCategories: [],
          },
        },
      ];

      vi.mocked(db.query.productCategories.findMany).mockResolvedValueOnce(mockProductCategories as any);

      const result = await getProductsByCategory('cat-1');

      expect(result).toHaveLength(0);
    });

    it('should return empty array on error', async () => {
      vi.mocked(db.query.productCategories.findMany).mockRejectedValueOnce(new Error('DB Error'));

      const result = await getProductsByCategory('cat-1');

      expect(result).toEqual([]);
    });
  });
});
