import { z } from 'zod';

export const createProductSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(200, 'Name is too long'),
    description: z
      .string()
      .min(1, 'Description is required')
      .max(1000, 'Description is too long'),
    donationType: z.enum(['monetary', 'physical']),
    targetAmount: z
      .number()
      .int()
      .positive('Target amount must be positive')
      .optional(),
    isPublished: z.boolean().optional().default(true),
    categoryIds: z.array(z.string().uuid()).optional().default([]),
  })
  .refine(
    (data) =>
      data.donationType !== 'monetary' ||
      (data.targetAmount !== undefined && data.targetAmount > 0),
    {
      message: 'Target amount is required for monetary products',
      path: ['targetAmount'],
    }
  );

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().min(1).max(1000).optional(),
    donationType: z.enum(['monetary', 'physical']).optional(),
    targetAmount: z.number().int().positive().nullish(),
    isPublished: z.boolean().optional(),
    categoryIds: z.array(z.string().uuid()).optional(),
  })
  .refine(
    (data) => {
      if (data.donationType === 'monetary' && data.targetAmount !== undefined && data.targetAmount !== null) {
        return data.targetAmount > 0;
      }
      return true;
    },
    { message: 'Target amount must be positive for monetary', path: ['targetAmount'] }
  );

export type UpdateProductInput = z.infer<typeof updateProductSchema>;
