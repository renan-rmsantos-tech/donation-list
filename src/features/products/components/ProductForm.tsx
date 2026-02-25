'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createProduct, updateProduct, generateProductPhotoUploadUrl } from '../actions';
import { formatCurrency } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/back-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ProductPhotoUpload } from './ProductPhotoUpload';
import { toast } from 'sonner';

const productFormSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório').max(200, 'Nome muito longo'),
    description: z
      .string()
      .min(1, 'Descrição é obrigatória')
      .max(1000, 'Descrição muito longa'),
    donationType: z.enum(['monetary', 'physical']),
    targetAmountDisplay: z.string().optional(),
    isPublished: z.boolean(),
    categoryIds: z.array(z.string()),
  })
  .refine(
    (data) =>
      data.donationType !== 'monetary' ||
      (data.targetAmountDisplay &&
        !Number.isNaN(parseFloat(data.targetAmountDisplay)) &&
        parseFloat(data.targetAmountDisplay) > 0),
    {
      message: 'Valor alvo é obrigatório para produtos monetários',
      path: ['targetAmountDisplay'],
    }
  );

type ProductFormValues = z.infer<typeof productFormSchema>;

type Category = {
  id: string;
  name: string;
};

type ProductFormProps = {
  categories: Category[];
  product?: {
    id: string;
    name: string;
    description: string;
    donationType: 'monetary' | 'physical';
    targetAmount: number | null;
    currentAmount: number;
    isFulfilled: boolean;
    isPublished: boolean;
    imagePath?: string | null;
    productCategories?: { categoryId: string }[];
  };
  imageUrl?: string | null;
};

export function ProductForm({ categories, product, imageUrl }: ProductFormProps) {
  const isEdit = !!product;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name ?? '',
      description: product?.description ?? '',
      donationType: product?.donationType ?? 'monetary',
      targetAmountDisplay:
        product?.donationType === 'monetary' && product?.targetAmount
          ? String(product.targetAmount / 100)
          : '',
      isPublished: product?.isPublished ?? true,
      categoryIds: product?.productCategories?.map((pc) => pc.categoryId) ?? [],
    },
  });

  const donationType = form.watch('donationType');

  const onSubmit = async (values: ProductFormValues) => {
    setIsUploading(true);

    try {
      const targetAmountCents =
        values.donationType === 'monetary' && values.targetAmountDisplay
          ? Math.round(parseFloat(values.targetAmountDisplay) * 100)
          : undefined;

      let imagePath: string | undefined;

      // Handle file upload if a new file was selected
      if (selectedFile) {
        const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase() || 'jpg';

        const uploadUrlResult = await generateProductPhotoUploadUrl({
          fileExtension,
        });

        if (!uploadUrlResult.success || !uploadUrlResult.data) {
          const detail =
            uploadUrlResult.details &&
            typeof uploadUrlResult.details === 'object' &&
            'message' in uploadUrlResult.details
              ? String(uploadUrlResult.details.message)
              : null;
          toast.error(
            uploadUrlResult.error === 'UNAUTHORIZED'
              ? 'Sessão expirada. Faça login novamente.'
              : detail
                ? `Erro ao preparar upload: ${detail}`
                : 'Erro ao preparar upload. Tente novamente.'
          );
          setIsUploading(false);
          return;
        }

        // Upload file to Supabase
        try {
          const response = await fetch(uploadUrlResult.data.signedUrl, {
            method: 'PUT',
            body: selectedFile,
            headers: {
              'Content-Type': selectedFile.type,
            },
          });

          if (!response.ok) {
            toast.error('Erro ao enviar foto. Tente novamente.');
            setIsUploading(false);
            return;
          }

          imagePath = uploadUrlResult.data.path;
        } catch {
          toast.error('Erro ao enviar foto. Tente novamente.');
          setIsUploading(false);
          return;
        }
      }

      const payload: Record<string, unknown> = {
        name: values.name.trim(),
        description: values.description.trim(),
        donationType: values.donationType,
        targetAmount: targetAmountCents,
        isPublished: values.isPublished,
        categoryIds: values.categoryIds,
      };

      if (imagePath !== undefined) {
        payload.imagePath = imagePath;
      }

      const result = isEdit
        ? await updateProduct(product.id, payload)
        : await createProduct(payload);

      if (result.success) {
        if (isEdit) {
          toast.success('Produto atualizado com sucesso.');
          setSelectedFile(null);
        } else if (result.data?.id) {
          toast.success('Produto criado com sucesso. Redirecionando...');
          setSelectedFile(null);
          window.location.href = `/admin/products/${result.data.id}/edit`;
        }
      } else {
        toast.error(
          result.error === 'VALIDATION_ERROR'
            ? 'Verifique os campos. Valor alvo é obrigatório para produtos monetários.'
            : result.error === 'UNAUTHORIZED'
              ? 'Sessão expirada. Faça login novamente.'
              : 'Erro ao salvar. Tente novamente.'
        );
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">
          {isEdit ? 'Editar Produto' : 'Novo Produto'}
        </h1>
        <BackButton href="/admin/products">Voltar</BackButton>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={200} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={4} maxLength={1000} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="donationType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de doação</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="monetary">Monetária</SelectItem>
                    <SelectItem value="physical">Física</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {donationType === 'monetary' && (
            <FormField
              control={form.control}
              name="targetAmountDisplay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor alvo (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Ex: 500.00"
                      {...field}
                    />
                  </FormControl>
                  {product?.donationType === 'monetary' &&
                    product?.targetAmount && (
                      <FormDescription>
                        Atual: {formatCurrency(product.currentAmount)} de{' '}
                        {formatCurrency(product.targetAmount)}
                      </FormDescription>
                    )}
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="isPublished"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-normal">
                    Publicado (visível no catálogo)
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryIds"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel>Categorias</FormLabel>
                </div>
                <div className="flex flex-wrap gap-4">
                  {categories.map((cat) => (
                    <FormField
                      key={cat.id}
                      control={form.control}
                      name="categoryIds"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(cat.id)}
                              onCheckedChange={(checked) => {
                                const next = checked
                                  ? [...(field.value ?? []), cat.id]
                                  : (field.value ?? []).filter((id) => id !== cat.id);
                                field.onChange(next);
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{cat.name}</FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </FormItem>
            )}
          />

          <ProductPhotoUpload
            currentImageUrl={imageUrl ?? null}
            onFileSelect={setSelectedFile}
            selectedFile={selectedFile}
          />

          <div className="flex gap-2">
            <Button type="submit" disabled={isUploading}>
              {isUploading ? 'Enviando...' : isEdit ? 'Salvar' : 'Criar'}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/products">Cancelar</Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
