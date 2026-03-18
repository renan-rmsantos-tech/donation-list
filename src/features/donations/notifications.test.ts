import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sendDonationConfirmation } from './notifications';

const originalEnv = {
  url: process.env.DONATION_NOTIFICATION_WEBHOOK_URL,
  token: process.env.DONATION_NOTIFICATION_WEBHOOK_TOKEN,
};

describe('sendDonationConfirmation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.DONATION_NOTIFICATION_WEBHOOK_URL;
    delete process.env.DONATION_NOTIFICATION_WEBHOOK_TOKEN;
  });

  afterEach(() => {
    if (originalEnv.url) {
      process.env.DONATION_NOTIFICATION_WEBHOOK_URL = originalEnv.url;
    } else {
      delete process.env.DONATION_NOTIFICATION_WEBHOOK_URL;
    }

    if (originalEnv.token) {
      process.env.DONATION_NOTIFICATION_WEBHOOK_TOKEN = originalEnv.token;
    } else {
      delete process.env.DONATION_NOTIFICATION_WEBHOOK_TOKEN;
    }
  });

  it('returns NOTIFICATION_CONFIG_ERROR when webhook URL is missing', async () => {
    const result = await sendDonationConfirmation({
      donorName: 'Donor',
      donorEmail: 'donor@example.com',
      productName: 'Product',
      donationType: 'physical',
      donationDate: new Date('2026-03-18T00:00:00.000Z').toISOString(),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('NOTIFICATION_CONFIG_ERROR');
    }
  });

  it('sends payload and amount field for monetary donations', async () => {
    process.env.DONATION_NOTIFICATION_WEBHOOK_URL = 'https://example.com/hooks/donations';
    process.env.DONATION_NOTIFICATION_WEBHOOK_TOKEN = 'token-123';

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
    });
    vi.stubGlobal('fetch', fetchMock);

    const payload = {
      donorName: 'Donor',
      donorEmail: 'donor@example.com',
      productName: 'Projector',
      donationType: 'monetary' as const,
      donationDate: new Date('2026-03-18T00:00:00.000Z').toISOString(),
      amount: 1500,
    };

    const result = await sendDonationConfirmation(payload);

    expect(result).toEqual({ success: true });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/hooks/donations',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer token-123',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(payload),
      })
    );
  });

  it('returns NOTIFICATION_DELIVERY_ERROR when endpoint responds with failure', async () => {
    process.env.DONATION_NOTIFICATION_WEBHOOK_URL = 'https://example.com/hooks/donations';

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error',
      })
    );

    const result = await sendDonationConfirmation({
      donorName: 'Donor',
      donorEmail: 'donor@example.com',
      productName: 'Product',
      donationType: 'physical',
      donationDate: new Date('2026-03-18T00:00:00.000Z').toISOString(),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('NOTIFICATION_DELIVERY_ERROR');
    }
  });
});
