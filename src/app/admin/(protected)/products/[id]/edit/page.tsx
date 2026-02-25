import { notFound } from 'next/navigation';
import { getCategories } from '@/features/categories/queries';
import { getProductById } from '@/features/products/queries';
import { getPublicUrl } from '@/lib/storage/supabase';
import { ProductForm } from '@/features/products/components/ProductForm';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductById(id),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  const imageUrl = product.imagePath
    ? getPublicUrl('product-photos', product.imagePath)
    : null;

  return (
    <div>
      <ProductForm
        product={{
          id: product.id,
          name: product.name,
          description: product.description,
          donationType: product.donationType,
          targetAmount: product.targetAmount,
          currentAmount: product.currentAmount,
          isFulfilled: product.isFulfilled,
          isPublished: product.isPublished,
          imagePath: product.imagePath,
          productCategories: product.productCategories,
        }}
        categories={categories}
        imageUrl={imageUrl}
      />
    </div>
  );
}
