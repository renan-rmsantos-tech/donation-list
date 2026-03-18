import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMonetaryDonation,
  createPhysicalPledge,
} from './actions';

const mockFindFirst = vi.fn();
const mockInsertReturning = vi.fn();
const mockUpdateWhere = vi.fn();

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/auth/session', () => ({
  validateSession: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      products: {
        findFirst: (...args: unknown[]) => mockFindFirst(...args),
      },
    },
    insert: () => ({
      values: () => ({
        returning: (...args: unknown[]) => mockInsertReturning(...args),
      }),
    }),
    update: () => ({
      set: () => ({
        where: (...args: unknown[]) => mockUpdateWhere(...args),
      }),
    }),
  },
}));

describe('donation confirmation integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DONATION_NOTIFICATION_WEBHOOK_URL =
      'https://example.com/hooks/donations';
    delete process.env.DONATION_NOTIFICATION_WEBHOOK_TOKEN;

    mockFindFirst.mockResolvedValue({
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
    mockInsertReturning.mockResolvedValue([
      {
        id: 'donation-uuid-123',
        createdAt: new Date('2026-03-18T00:00:00.000Z'),
      },
    ]);
    mockUpdateWhere.mockResolvedValue(undefined);
  });

  it('triggers confirmation dispatch on end-to-end monetary action flow', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await createMonetaryDonation({
      productId: '123e4567-e89b-12d3-a456-426614174000',
      amount: 10000,
      donorName: 'Maria',
      donorEmail: 'maria@example.com',
      receiptPath: 'receipts/test.jpg',
    });

    expect(result.success).toBe(true);
    expect(result.data?.notificationSent).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/hooks/donations',
      expect.objectContaining({
        method: 'POST',
      })
    );
    expect(fetchMock.mock.calls[0][1].body).toContain('"donationType":"monetary"');
  });

  it('triggers confirmation dispatch on end-to-end physical action flow', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await createPhysicalPledge({
      productId: '123e4567-e89b-12d3-a456-426614174000',
      donorName: 'Joao',
      donorPhone: '+5585987654321',
      donorEmail: 'joao@example.com',
    });

    expect(result.success).toBe(true);
    expect(result.data?.notificationSent).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/hooks/donations',
      expect.objectContaining({
        method: 'POST',
      })
    );
    expect(fetchMock.mock.calls[0][1].body).toContain('"donationType":"physical"');
  });
});
