import { getCategories } from '@/features/categories/queries';
import { ProductForm } from '@/features/products/components/ProductForm';

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
      <ProductForm categories={categories} />
    </div>
  );
}
