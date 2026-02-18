import { describe, it, expect } from 'vitest';
import {
  createMonetaryDonationSchema,
  createPhysicalPledgeSchema,
  generateUploadUrlSchema,
} from './schemas';

describe('Donation Schemas', () => {
  describe('createMonetaryDonationSchema', () => {
    it('should validate a valid monetary donation', () => {
      const input = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 10000, // R$ 100
        donorName: 'João Silva',
        receiptPath: 'receipts/2024-02-18-uuid.jpg',
      };

      const result = createMonetaryDonationSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject negative amount', () => {
      const input = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        amount: -1000,
        receiptPath: 'receipts/2024-02-18-uuid.jpg',
      };

      const result = createMonetaryDonationSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject amount less than minimum', () => {
      const input = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 50, // less than R$ 1.00
        receiptPath: 'receipts/2024-02-18-uuid.jpg',
      };

      const result = createMonetaryDonationSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject non-integer amount', () => {
      const input = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 100.5,
        receiptPath: 'receipts/2024-02-18-uuid.jpg',
      };

      const result = createMonetaryDonationSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should accept optional donor name', () => {
      const input = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 10000,
        receiptPath: 'receipts/2024-02-18-uuid.jpg',
      };

      const result = createMonetaryDonationSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject invalid product ID', () => {
      const input = {
        productId: 'not-a-uuid',
        amount: 10000,
        receiptPath: 'receipts/2024-02-18-uuid.jpg',
      };

      const result = createMonetaryDonationSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject missing receipt path', () => {
      const input = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 10000,
        receiptPath: '',
      };

      const result = createMonetaryDonationSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject malformed payload with extra invalid fields', () => {
      const input = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 'invalid',
        receiptPath: 'receipts/test.jpg',
      };

      const result = createMonetaryDonationSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('createPhysicalPledgeSchema', () => {
    it('should validate a valid physical pledge', () => {
      const input = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        donorName: 'Maria Santos',
        donorPhone: '+5585987654321',
        donorEmail: 'maria@example.com',
      };

      const result = createPhysicalPledgeSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should validate pledge without email', () => {
      const input = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        donorName: 'Maria Santos',
        donorPhone: '+5585987654321',
      };

      const result = createPhysicalPledgeSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject pledge without name', () => {
      const input = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        donorPhone: '+5585987654321',
      };

      const result = createPhysicalPledgeSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject pledge without phone', () => {
      const input = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        donorName: 'Maria Santos',
      };

      const result = createPhysicalPledgeSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should accept Brazilian phone format variations', () => {
      const validPhones = [
        '+5585987654321',
        '5585987654321',
        '85987654321',
        '+55 85 98765-4321',
        '(85) 98765-4321',
      ];

      for (const phone of validPhones) {
        const input = {
          productId: '123e4567-e89b-12d3-a456-426614174000',
          donorName: 'Test Donor',
          donorPhone: phone,
        };

        const result = createPhysicalPledgeSchema.safeParse(input);
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid email', () => {
      const input = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        donorName: 'Maria Santos',
        donorPhone: '+5585987654321',
        donorEmail: 'not-an-email',
      };

      const result = createPhysicalPledgeSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('generateUploadUrlSchema', () => {
    it('should validate receipts bucket', () => {
      const input = {
        bucket: 'receipts',
        fileExtension: 'jpg',
      };

      const result = generateUploadUrlSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should validate pix-qr bucket', () => {
      const input = {
        bucket: 'pix-qr',
        fileExtension: 'png',
      };

      const result = generateUploadUrlSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject invalid bucket', () => {
      const input = {
        bucket: 'invalid-bucket',
        fileExtension: 'jpg',
      };

      const result = generateUploadUrlSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject invalid file extension', () => {
      const input = {
        bucket: 'receipts',
        fileExtension: 'jpg@invalid',
      };

      const result = generateUploadUrlSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});
