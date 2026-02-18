import { describe, it, expect } from 'vitest';
import { updatePixSettingsSchema } from './schemas';

describe('PIX Schemas', () => {
  describe('updatePixSettingsSchema', () => {
    it('should accept copiaEColaCode only', () => {
      const result = updatePixSettingsSchema.safeParse({
        copiaEColaCode: '00020126580014br.gov.bcb.pix...',
      });
      expect(result.success).toBe(true);
    });

    it('should accept qrCodeImagePath only', () => {
      const result = updatePixSettingsSchema.safeParse({
        qrCodeImagePath: 'pix-qr/2024-02-18-abc.png',
      });
      expect(result.success).toBe(true);
    });

    it('should accept both fields', () => {
      const result = updatePixSettingsSchema.safeParse({
        copiaEColaCode: '00020126...',
        qrCodeImagePath: 'pix-qr/path.png',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty object', () => {
      const result = updatePixSettingsSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});
