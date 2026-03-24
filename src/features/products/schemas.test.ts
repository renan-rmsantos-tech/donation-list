import { describe, it, expect } from 'vitest';
import {
  createProductSchema,
  updateProductSchema,
  generateProductPhotoUploadUrlSchema,
} from './schemas';

describe('Product Schemas', () => {
  describe('createProductSchema', () => {
    it('should accept valid product with targetAmount', () => {
      const result = createProductSchema.safeParse({
        name: 'Cadeira',
        description: 'Cadeira para igreja',
        targetAmount: 50000,
        categoryIds: [],
      });
      expect(result.success).toBe(true);
    });

    it('should reject product without targetAmount', () => {
      const result = createProductSchema.safeParse({
        name: 'Cadeira',
        description: 'Desc',
        categoryIds: [],
      });
      expect(result.success).toBe(false);
    });

    it('should reject product with zero targetAmount', () => {
      const result = createProductSchema.safeParse({
        name: 'Cadeira',
        description: 'Desc',
        targetAmount: 0,
        categoryIds: [],
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const result = createProductSchema.safeParse({
        name: '',
        description: 'Desc',
        targetAmount: 10000,
        categoryIds: [],
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid categoryIds', () => {
      const result = createProductSchema.safeParse({
        name: 'Produto',
        description: 'Desc',
        targetAmount: 10000,
        categoryIds: ['not-a-uuid'],
      });
      expect(result.success).toBe(false);
    });

    // imagePath tests
    it('should accept product without imagePath', () => {
      const result = createProductSchema.safeParse({
        name: 'Produto',
        description: 'Descrição',
        targetAmount: 10000,
      });
      expect(result.success).toBe(true);
      expect(result.data?.imagePath).toBeUndefined();
    });

    it('should accept product with valid imagePath string', () => {
      const result = createProductSchema.safeParse({
        name: 'Produto',
        description: 'Descrição',
        targetAmount: 10000,
        imagePath: 'product-photos/2024-02-18-abc123.jpg',
      });
      expect(result.success).toBe(true);
      expect(result.data?.imagePath).toBe('product-photos/2024-02-18-abc123.jpg');
    });

    it('should accept product with imagePath null', () => {
      const result = createProductSchema.safeParse({
        name: 'Produto',
        description: 'Descrição',
        targetAmount: 10000,
        imagePath: null,
      });
      expect(result.success).toBe(true);
      expect(result.data?.imagePath).toBeNull();
    });

    it('should reject imagePath longer than 500 characters', () => {
      const result = createProductSchema.safeParse({
        name: 'Produto',
        description: 'Descrição',
        targetAmount: 10000,
        imagePath: 'a'.repeat(501),
      });
      expect(result.success).toBe(false);
    });

    it('should accept imagePath with exactly 500 characters', () => {
      const result = createProductSchema.safeParse({
        name: 'Produto',
        description: 'Descrição',
        targetAmount: 10000,
        imagePath: 'a'.repeat(500),
      });
      expect(result.success).toBe(true);
    });

    // donationMode tests
    it('should accept valid donationMode: monetary', () => {
      const result = createProductSchema.safeParse({
        name: 'Produto',
        description: 'Descrição',
        targetAmount: 10000,
        donationMode: 'monetary',
      });
      expect(result.success).toBe(true);
      expect(result.data?.donationMode).toBe('monetary');
    });

    it('should accept valid donationMode: physical', () => {
      const result = createProductSchema.safeParse({
        name: 'Produto',
        description: 'Descrição',
        targetAmount: 10000,
        donationMode: 'physical',
      });
      expect(result.success).toBe(true);
      expect(result.data?.donationMode).toBe('physical');
    });

    it('should accept valid donationMode: both', () => {
      const result = createProductSchema.safeParse({
        name: 'Produto',
        description: 'Descrição',
        targetAmount: 10000,
        donationMode: 'both',
      });
      expect(result.success).toBe(true);
      expect(result.data?.donationMode).toBe('both');
    });

    it('should default donationMode to "both" when omitted', () => {
      const result = createProductSchema.safeParse({
        name: 'Produto',
        description: 'Descrição',
        targetAmount: 10000,
      });
      expect(result.success).toBe(true);
      expect(result.data?.donationMode).toBe('both');
    });

    it('should reject invalid donationMode value', () => {
      const result = createProductSchema.safeParse({
        name: 'Produto',
        description: 'Descrição',
        targetAmount: 10000,
        donationMode: 'invalid',
      });
      expect(result.success).toBe(false);
    });

    it('should reject donationMode as number', () => {
      const result = createProductSchema.safeParse({
        name: 'Produto',
        description: 'Descrição',
        targetAmount: 10000,
        donationMode: 123,
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

    it('should accept targetAmount null', () => {
      const result = updateProductSchema.safeParse({
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

    // donationMode tests
    it('should accept optional donationMode: monetary', () => {
      const result = updateProductSchema.safeParse({
        donationMode: 'monetary',
      });
      expect(result.success).toBe(true);
      expect(result.data?.donationMode).toBe('monetary');
    });

    it('should accept optional donationMode: physical', () => {
      const result = updateProductSchema.safeParse({
        donationMode: 'physical',
      });
      expect(result.success).toBe(true);
      expect(result.data?.donationMode).toBe('physical');
    });

    it('should accept optional donationMode: both', () => {
      const result = updateProductSchema.safeParse({
        donationMode: 'both',
      });
      expect(result.success).toBe(true);
      expect(result.data?.donationMode).toBe('both');
    });

    it('should not have donationMode defined when omitted', () => {
      const result = updateProductSchema.safeParse({
        name: 'Updated Name',
      });
      expect(result.success).toBe(true);
      expect(result.data?.donationMode).toBeUndefined();
    });

    it('should reject invalid donationMode in update', () => {
      const result = updateProductSchema.safeParse({
        donationMode: 'invalid',
      });
      expect(result.success).toBe(false);
    });

    it('should allow updating donationMode with other fields', () => {
      const result = updateProductSchema.safeParse({
        name: 'Updated Name',
        donationMode: 'physical',
      });
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Updated Name');
      expect(result.data?.donationMode).toBe('physical');
    });

    it('should allow updating imagePath and donationMode together', () => {
      const result = updateProductSchema.safeParse({
        imagePath: 'new-photo.jpg',
        donationMode: 'monetary',
      });
      expect(result.success).toBe(true);
      expect(result.data?.imagePath).toBe('new-photo.jpg');
      expect(result.data?.donationMode).toBe('monetary');
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
