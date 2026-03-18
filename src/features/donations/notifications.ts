type DonationNotificationType = 'monetary' | 'physical';

export type DonationConfirmationPayload = {
  donorName: string;
  donorEmail: string;
  productName: string;
  donationType: DonationNotificationType;
  donationDate: string;
  amount?: number;
};

export type NotificationResult =
  | { success: true }
  | {
      success: false;
      error: 'NOTIFICATION_CONFIG_ERROR' | 'NOTIFICATION_DELIVERY_ERROR';
      details?: unknown;
    };

function getNotificationEndpoint(): string | null {
  const endpoint = process.env.DONATION_NOTIFICATION_WEBHOOK_URL;
  if (!endpoint || endpoint.trim().length === 0) {
    return null;
  }

  try {
    const parsed = new URL(endpoint);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export async function sendDonationConfirmation(
  payload: DonationConfirmationPayload
): Promise<NotificationResult> {
  const endpoint = getNotificationEndpoint();
  if (!endpoint) {
    return {
      success: false,
      error: 'NOTIFICATION_CONFIG_ERROR',
      details: {
        message:
          'DONATION_NOTIFICATION_WEBHOOK_URL is missing or invalid.',
      },
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.DONATION_NOTIFICATION_WEBHOOK_TOKEN
          ? {
              Authorization: `Bearer ${process.env.DONATION_NOTIFICATION_WEBHOOK_TOKEN}`,
            }
          : {}),
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        success: false,
        error: 'NOTIFICATION_DELIVERY_ERROR',
        details: {
          status: response.status,
          statusText: response.statusText,
        },
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'NOTIFICATION_DELIVERY_ERROR',
      details: {
        message: error instanceof Error ? error.message : String(error),
      },
    };
  }
}
