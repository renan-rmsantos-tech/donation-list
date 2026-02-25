import { z } from 'zod';

export const searchPexelsPhotosSchema = z.object({
  query: z
    .string()
    .min(1, 'Query é obrigatório')
    .max(200, 'Query é muito longo (máximo 200 caracteres)'),
  perPage: z
    .number()
    .int()
    .min(1, 'perPage deve ser no mínimo 1')
    .max(15, 'perPage deve ser no máximo 15')
    .optional()
    .default(3),
});

export type SearchPexelsPhotosInput = z.infer<typeof searchPexelsPhotosSchema>;

export const downloadAndUploadPhotoSchema = z.object({
  photoUrl: z
    .string()
    .url('URL de foto é inválida')
    .refine(
      (url) => url.startsWith('https://images.pexels.com'),
      'URL deve ser de images.pexels.com'
    ),
  productName: z
    .string()
    .min(1, 'Nome do produto é obrigatório'),
});

export type DownloadAndUploadPhotoInput = z.infer<typeof downloadAndUploadPhotoSchema>;

export const bulkCreateProductSchema = z.object({
  items: z
    .array(
      z.object({
        name: z
          .string()
          .min(1, 'Nome é obrigatório')
          .max(200, 'Nome é muito longo'),
        description: z
          .string()
          .min(1, 'Descrição é obrigatória')
          .max(1000, 'Descrição é muito longa'),
        donationType: z.enum(['monetary', 'physical']),
        targetAmount: z
          .number()
          .int()
          .positive('Valor deve ser positivo')
          .optional(),
        categoryId: z.string().uuid('ID da categoria é inválido'),
        photoUrl: z
          .string()
          .url('URL de foto é inválida'),
        isPublished: z.boolean().optional().default(true),
      })
      .refine(
        (data) =>
          data.donationType !== 'monetary' ||
          (data.targetAmount !== undefined && data.targetAmount > 0),
        {
          message: 'Valor é obrigatório para produtos monetários',
          path: ['targetAmount'],
        }
      )
    )
    .min(1, 'Pelo menos um item é obrigatório')
    .max(50, 'Máximo de 50 itens permitido'),
});

export type BulkCreateProductInput = z.infer<typeof bulkCreateProductSchema>;
