import { getCategories } from '@/features/categories/queries';
import { CategoryManager } from '@/features/categories/components/CategoryManager';

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <CategoryManager categories={categories} />
    </div>
  );
}
