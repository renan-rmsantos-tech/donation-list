import { describe, it, expect } from 'vitest';
import {
  createProductSchema,
  updateProductSchema,
  generateProductPhotoUploadUrlSchema,
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

    // imagePath tests
    it('should accept product without imagePath', () => {
      const result = createProductSchema.safeParse({
        name: 'Produto',
        description: 'Descrição',
        donationType: 'physical',
      });
      expect(result.success).toBe(true);
      expect(result.data?.imagePath).toBeUndefined();
    });

    it('should accept product with valid imagePath string', () => {
      const result = createProductSchema.safeParse({
        name: 'Produto',
        description: 'Descrição',
        donationType: 'physical',
        imagePath: 'product-photos/2024-02-18-abc123.jpg',
      });
      expect(result.success).toBe(true);
      expect(result.data?.imagePath).toBe('product-photos/2024-02-18-abc123.jpg');
    });

    it('should accept product with imagePath null', () => {
      const result = createProductSchema.safeParse({
        name: 'Produto',
        description: 'Descrição',
        donationType: 'physical',
        imagePath: null,
      });
      expect(result.success).toBe(true);
      expect(result.data?.imagePath).toBeNull();
    });

    it('should reject imagePath longer than 500 characters', () => {
      const result = createProductSchema.safeParse({
        name: 'Produto',
        description: 'Descrição',
        donationType: 'physical',
        imagePath: 'a'.repeat(501),
      });
      expect(result.success).toBe(false);
    });

    it('should accept imagePath with exactly 500 characters', () => {
      const result = createProductSchema.safeParse({
        name: 'Produto',
        description: 'Descrição',
        donationType: 'physical',
        imagePath: 'a'.repeat(500),
      });
      expect(result.success).toBe(true);
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

    // imagePath tests
    it('should accept update with imagePath string', () => {
      const result = updateProductSchema.safeParse({
        imagePath: 'product-photos/2024-02-18-abc123.jpg',
      });
      expect(result.success).toBe(true);
      expect(result.data?.imagePath).toBe('product-photos/2024-02-18-abc123.jpg');
    });

    it('should accept update with imagePath null', () => {
      const result = updateProductSchema.safeParse({
        imagePath: null,
      });
      expect(result.success).toBe(true);
      expect(result.data?.imagePath).toBeNull();
    });

    it('should accept update without imagePath', () => {
      const result = updateProductSchema.safeParse({
        name: 'Updated Name',
      });
      expect(result.success).toBe(true);
      expect(result.data?.imagePath).toBeUndefined();
    });

    it('should reject imagePath longer than 500 characters', () => {
      const result = updateProductSchema.safeParse({
        imagePath: 'a'.repeat(501),
      });
      expect(result.success).toBe(false);
    });

    it('should accept imagePath with exactly 500 characters', () => {
      const result = updateProductSchema.safeParse({
        imagePath: 'a'.repeat(500),
      });
      expect(result.success).toBe(true);
    });
  });

  describe('generateProductPhotoUploadUrlSchema', () => {
    it('should accept jpg extension', () => {
      const result = generateProductPhotoUploadUrlSchema.safeParse({
        fileExtension: 'jpg',
      });
      expect(result.success).toBe(true);
    });

    it('should accept jpeg extension', () => {
      const result = generateProductPhotoUploadUrlSchema.safeParse({
        fileExtension: 'jpeg',
      });
      expect(result.success).toBe(true);
    });

    it('should accept png extension', () => {
      const result = generateProductPhotoUploadUrlSchema.safeParse({
        fileExtension: 'png',
      });
      expect(result.success).toBe(true);
    });

    it('should reject gif extension', () => {
      const result = generateProductPhotoUploadUrlSchema.safeParse({
        fileExtension: 'gif',
      });
      expect(result.success).toBe(false);
    });

    it('should reject webp extension', () => {
      const result = generateProductPhotoUploadUrlSchema.safeParse({
        fileExtension: 'webp',
      });
      expect(result.success).toBe(false);
    });

    it('should reject pdf extension', () => {
      const result = generateProductPhotoUploadUrlSchema.safeParse({
        fileExtension: 'pdf',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty extension', () => {
      const result = generateProductPhotoUploadUrlSchema.safeParse({
        fileExtension: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject extension longer than 10 characters', () => {
      const result = generateProductPhotoUploadUrlSchema.safeParse({
        fileExtension: 'a'.repeat(11),
      });
      expect(result.success).toBe(false);
    });

    it('should reject uppercase jpg extension', () => {
      const result = generateProductPhotoUploadUrlSchema.safeParse({
        fileExtension: 'JPG',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing fileExtension', () => {
      const result = generateProductPhotoUploadUrlSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject null fileExtension', () => {
      const result = generateProductPhotoUploadUrlSchema.safeParse({
        fileExtension: null,
      });
      expect(result.success).toBe(false);
    });

    it('should reject extension with spaces', () => {
      const result = generateProductPhotoUploadUrlSchema.safeParse({
        fileExtension: 'j p g',
      });
      expect(result.success).toBe(false);
    });

    it('should reject extension with special characters', () => {
      const result = generateProductPhotoUploadUrlSchema.safeParse({
        fileExtension: 'jpg!',
      });
      expect(result.success).toBe(false);
    });
  });
});
