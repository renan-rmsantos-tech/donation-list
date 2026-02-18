import { z } from 'zod';

export const updatePixSettingsSchema = z.object({
  qrCodeImagePath: z.string().optional(),
  copiaEColaCode: z.string().optional(),
});

export type UpdatePixSettingsInput = z.infer<typeof updatePixSettingsSchema>;
