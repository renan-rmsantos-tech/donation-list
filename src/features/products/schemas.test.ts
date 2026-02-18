import { describe, it, expect } from 'vitest';
import {
  createProductSchema,
  updateProductSchema,
} from './schemas';

describe('Product Schemas', () => {
  describe('createProductSchema', () => {
    it('should accept valid monetary product with targetAmount', () => {
      const result = createProductSchema.safeParse({
        name: 'Cadeira',
        description: 'Cadeira para igreja',
        donationType: 'monetary',
        targetAmount: 50000,
        categoryIds: [],
      });
      expect(result.success).toBe(true);
    });

    it('should accept valid physical product without targetAmount', () => {
      const result = createProductSchema.safeParse({
        name: 'Vela',
        description: 'Velas para altar',
        donationType: 'physical',
        categoryIds: [],
      });
      expect(result.success).toBe(true);
    });

    it('should reject monetary product without targetAmount', () => {
      const result = createProductSchema.safeParse({
        name: 'Cadeira',
        description: 'Desc',
        donationType: 'monetary',
        categoryIds: [],
      });
      expect(result.success).toBe(false);
    });

    it('should reject monetary product with zero targetAmount', () => {
      const result = createProductSchema.safeParse({
        name: 'Cadeira',
        description: 'Desc',
        donationType: 'monetary',
        targetAmount: 0,
        categoryIds: [],
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const result = createProductSchema.safeParse({
        name: '',
        description: 'Desc',
        donationType: 'physical',
        categoryIds: [],
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid categoryIds', () => {
      const result = createProductSchema.safeParse({
        name: 'Produto',
        description: 'Desc',
        donationType: 'physical',
        categoryIds: ['not-a-uuid'],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateProductSchema', () => {
    it('should accept partial update', () => {
      const result = updateProductSchema.safeParse({
        name: 'Novo Nome',
      });
      expect(result.success).toBe(true);
    });

    it('should accept targetAmount null for physical', () => {
      const result = updateProductSchema.safeParse({
        donationType: 'physical',
        targetAmount: null,
      });
      expect(result.success).toBe(true);
    });
  });
});
