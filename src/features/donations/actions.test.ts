import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createMonetaryDonation,
  createPhysicalPledge,
  generateUploadUrl,
} from './actions';

// Mock the database and external services
const mockInsertReturning = vi.fn().mockResolvedValue([{ id: 'donation-uuid-123' }]);
const mockUpdateWhere = vi.fn().mockResolvedValue(undefined);

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      products: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: mockInsertReturning,
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: mockUpdateWhere,
      })),
    })),
  },
}));

vi.mock('@/lib/storage/supabase', () => ({
  generateSignedUploadUrl: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Donation Actions', () => {
  beforeEach(async () => {
    const { db } = await import('@/lib/db');
    vi.mocked(db.query.products.findFirst).mockReset();
    mockInsertReturning.mockResolvedValue([{ id: 'donation-uuid-123' }]);
    mockUpdateWhere.mockResolvedValue(undefined);
  });

  describe('createMonetaryDonation', () => {
    it('should reject invalid input', async () => {
      const result = await createMonetaryDonation({
        productId: 'invalid-uuid',
        amount: 100,
        receiptPath: 'receipts/test.jpg',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('VALIDATION_ERROR');
    });

    it('should reject if product not found', async () => {
      const { db } = await import('@/lib/db');

      vi.mocked(db.query.products.findFirst).mockResolvedValueOnce(undefined);

      const result = await createMonetaryDonation({
        productId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 10000,
        receiptPath: 'receipts/test.jpg',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('PRODUCT_NOT_FOUND');
    });

    it('should reject if product is not monetary type', async () => {
      const { db } = await import('@/lib/db');

      vi.mocked(db.query.products.findFirst).mockResolvedValueOnce({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Product',
        description: 'Test',
        donationType: 'physical',
        targetAmount: null,
        currentAmount: 0,
        isFulfilled: false,
        isPublished: true,
  imagePath: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await createMonetaryDonation({
        productId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 10000,
        receiptPath: 'receipts/test.jpg',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_DONATION_TYPE');
    });

    it('should reject missing receipt path', async () => {
      const { db } = await import('@/lib/db');

      vi.mocked(db.query.products.findFirst).mockResolvedValueOnce({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Product',
        description: 'Test',
        donationType: 'monetary',
        targetAmount: 50000,
        currentAmount: 0,
        isFulfilled: false,
        isPublished: true,
  imagePath: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await createMonetaryDonation({
        productId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 10000,
        receiptPath: '',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('VALIDATION_ERROR');
    });

    it('should reject when product is already fully funded', async () => {
      const { db } = await import('@/lib/db');

      vi.mocked(db.query.products.findFirst).mockResolvedValueOnce({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Product',
        description: 'Test',
        donationType: 'monetary',
        targetAmount: 10000,
        currentAmount: 10000,
        isFulfilled: false,
        isPublished: true,
  imagePath: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await createMonetaryDonation({
        productId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 100,
        receiptPath: 'receipts/test.jpg',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('ALREADY_FUNDED');
    });

    it('should process valid monetary donation', async () => {
      const { db } = await import('@/lib/db');

      vi.mocked(db.query.products.findFirst).mockResolvedValueOnce({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Product',
        description: 'Test',
        donationType: 'monetary',
        targetAmount: 50000,
        currentAmount: 0,
        isFulfilled: false,
        isPublished: true,
  imagePath: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await createMonetaryDonation({
        productId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 10000,
        donorName: 'Test Donor',
        receiptPath: 'receipts/test.jpg',
      });

      expect(result.success).toBe(true);
      expect(result.data?.donationId).toBe('donation-uuid-123');
    });
  });

  describe('createPhysicalPledge', () => {
    it('should reject invalid input', async () => {
      const result = await createPhysicalPledge({
        productId: 'invalid-uuid',
        donorName: 'Test',
        donorPhone: '1234567890',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('VALIDATION_ERROR');
    });

    it('should reject if product not found', async () => {
      const { db } = await import('@/lib/db');

      vi.mocked(db.query.products.findFirst).mockResolvedValueOnce(undefined);

      const result = await createPhysicalPledge({
        productId: '123e4567-e89b-12d3-a456-426614174000',
        donorName: 'Test Donor',
        donorPhone: '+5585987654321',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('PRODUCT_NOT_FOUND');
    });

    it('should reject if product is not physical type', async () => {
      const { db } = await import('@/lib/db');

      vi.mocked(db.query.products.findFirst).mockResolvedValueOnce({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Product',
        description: 'Test',
        donationType: 'monetary',
        targetAmount: 50000,
        currentAmount: 0,
        isFulfilled: false,
        isPublished: true,
  imagePath: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await createPhysicalPledge({
        productId: '123e4567-e89b-12d3-a456-426614174000',
        donorName: 'Test Donor',
        donorPhone: '+5585987654321',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_DONATION_TYPE');
    });

    it('should reject if product already fulfilled', async () => {
      const { db } = await import('@/lib/db');

      vi.mocked(db.query.products.findFirst).mockResolvedValueOnce({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Product',
        description: 'Test',
        donationType: 'physical',
        targetAmount: null,
        currentAmount: 0,
        isFulfilled: true,
        isPublished: true,
  imagePath: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await createPhysicalPledge({
        productId: '123e4567-e89b-12d3-a456-426614174000',
        donorName: 'Test Donor',
        donorPhone: '+5585987654321',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('ALREADY_FULFILLED');
    });

    it('should process valid physical pledge without optional email', async () => {
      const { db } = await import('@/lib/db');

      vi.mocked(db.query.products.findFirst).mockResolvedValueOnce({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Product',
        description: 'Test',
        donationType: 'physical',
        targetAmount: null,
        currentAmount: 0,
        isFulfilled: false,
        isPublished: true,
  imagePath: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await createPhysicalPledge({
        productId: '123e4567-e89b-12d3-a456-426614174000',
        donorName: 'Test Donor',
        donorPhone: '+5585987654321',
      });

      expect(result.success).toBe(true);
      expect(result.data?.donationId).toBeDefined();
    });

    it('should process valid physical pledge', async () => {
      const { db } = await import('@/lib/db');

      vi.mocked(db.query.products.findFirst).mockResolvedValueOnce({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Product',
        description: 'Test',
        donationType: 'physical',
        targetAmount: null,
        currentAmount: 0,
        isFulfilled: false,
        isPublished: true,
  imagePath: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await createPhysicalPledge({
        productId: '123e4567-e89b-12d3-a456-426614174000',
        donorName: 'Test Donor',
        donorPhone: '+5585987654321',
        donorEmail: 'test@example.com',
      });

      expect(result.success).toBe(true);
      expect(result.data?.donationId).toBeDefined();
    });
  });

  describe('generateUploadUrl', () => {
    it('should reject invalid input', async () => {
      const result = await generateUploadUrl({
        bucket: 'invalid-bucket',
        fileExtension: 'jpg',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('VALIDATION_ERROR');
    });

    it('should generate upload URL for receipts', async () => {
      const { generateSignedUploadUrl: mockGenerateUrl } = await import(
        '@/lib/storage/supabase'
      );

      vi.mocked(mockGenerateUrl).mockResolvedValueOnce({
        signedUrl: 'https://signed-url.example.com',
        path: 'receipts/2024-02-18-uuid.jpg',
      });

      const result = await generateUploadUrl({
        bucket: 'receipts',
        fileExtension: 'jpg',
      });

      expect(result.success).toBe(true);
      expect(result.data?.signedUrl).toBeDefined();
      expect(result.data?.path).toContain('receipts');
    });

    it('should generate upload URL for PIX QR', async () => {
      const { generateSignedUploadUrl: mockGenerateUrl } = await import(
        '@/lib/storage/supabase'
      );

      vi.mocked(mockGenerateUrl).mockResolvedValueOnce({
        signedUrl: 'https://signed-url.example.com',
        path: 'pix-qr/2024-02-18-uuid.png',
      });

      const result = await generateUploadUrl({
        bucket: 'pix-qr',
        fileExtension: 'png',
      });

      expect(result.success).toBe(true);
      expect(result.data?.path).toContain('pix-qr');
    });
  });
});
