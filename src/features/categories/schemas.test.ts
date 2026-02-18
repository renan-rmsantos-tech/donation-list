import { describe, it, expect } from 'vitest';
import {
  createCategorySchema,
  updateCategorySchema,
} from './schemas';

describe('Category Schemas', () => {
  describe('createCategorySchema', () => {
    it('should accept valid name', () => {
      const result = createCategorySchema.safeParse({ name: 'Sacristia' });
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const result = createCategorySchema.safeParse({ name: '' });
      expect(result.success).toBe(false);
    });

    it('should reject name longer than 100 chars', () => {
      const result = createCategorySchema.safeParse({
        name: 'a'.repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing name', () => {
      const result = createCategorySchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject non-string name', () => {
      const result = createCategorySchema.safeParse({ name: 123 });
      expect(result.success).toBe(false);
    });
  });

  describe('updateCategorySchema', () => {
    it('should accept valid name', () => {
      const result = updateCategorySchema.safeParse({ name: 'Jardim' });
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const result = updateCategorySchema.safeParse({ name: '' });
      expect(result.success).toBe(false);
    });
  });
});
