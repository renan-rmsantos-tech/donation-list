/**
 * Parse Brazilian Real string to number
 * @param value String like "1.500,50" or "500,50" or "500"
 * @returns Parsed number (e.g. 1500.5, 500.5, 500)
 */
export const parseBRLToNumber = (value: string): number => {
  if (!value || typeof value !== 'string') return 0;
  const trimmed = value.trim().replace(/\s/g, '');
  if (!trimmed) return 0;
  const cleaned = trimmed.replace(/[R$\s]/g, '');
  const hasComma = cleaned.includes(',');
  if (hasComma) {
    // Brazilian: 1.234,56 -> 1234.56
    const [intPart, decPart] = cleaned.split(',');
    const intNum = (intPart?.replace(/\D/g, '') ?? '') || '0';
    const decNum = (decPart?.replace(/\D/g, '') ?? '').slice(0, 2) || '0';
    return parseFloat(`${intNum}.${decNum}`) || 0;
  }
  if (cleaned.includes('.')) {
    const [intPart, decPart] = cleaned.split('.');
    // 500.50 -> decimal; 1.500 -> thousands
    if (decPart && decPart.length <= 2) {
      return parseFloat(cleaned) || 0;
    }
    return parseFloat(cleaned.replace(/\./g, '')) || 0;
  }
  return parseFloat(cleaned.replace(',', '.')) || 0;
};

/**
 * Format number to Brazilian Real display (without R$)
 * @param value Number in reais
 * @returns Formatted string (e.g. "1.500,50")
 */
export const formatToBRLDisplay = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Format an amount in cents to currency
 * @param cents Amount in cents (integer)
 * @param locale Optional locale (default: pt-BR). Use 'en-US' for US English formatting.
 * @returns Formatted string (e.g. "R$ 123,45" for pt-BR, "R$ 123.45" for en-US)
 */
export const formatCurrency = (
  cents: number,
  locale: string = 'pt-BR'
): string => {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(cents / 100);
};

/**
 * Calculate progress percentage
 * @param current Current amount
 * @param target Target amount
 * @returns Percentage 0-100 (capped at 100)
 */
export const calculateProgressPercentage = (
  current: number,
  target: number
): number => {
  if (target <= 0) return 0;
  const percentage = Math.round((current / target) * 100);
  return Math.min(percentage, 100);
};

/**
 * Check if a string is a valid Brazilian phone number
 * @param phone Phone number string
 * @returns true if valid
 */
export const isValidBrazilianPhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  return /^(\+?55)?\d{10,11}$/.test(digits);
};

/**
 * Generate a unique storage path for uploads
 * @param bucket Bucket name (e.g., 'receipts', 'pix-qr')
 * @param fileExtension File extension (e.g., 'jpg', 'png')
 * @returns Path string like "receipts/2024-02-18-uuid.jpg"
 */
export const generateStoragePath = (
  bucket: string,
  fileExtension: string
): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  const uuid = crypto.getRandomValues(new Uint8Array(16));
  const hex = Array.from(uuid)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${bucket}/${timestamp}-${hex}.${fileExtension}`;
};
