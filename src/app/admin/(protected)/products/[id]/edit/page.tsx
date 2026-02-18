import { notFound } from 'next/navigation';
import { getCategories } from '@/features/categories/queries';
import { getProductById } from '@/features/products/queries';
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
          productCategories: product.productCategories,
        }}
        categories={categories}
      />
    </div>
  );
}
