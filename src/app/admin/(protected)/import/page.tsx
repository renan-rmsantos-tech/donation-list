import { getCategories } from '@/features/categories/queries';
import { ImportWizard } from '@/features/import/components/ImportWizard';

export const metadata = {
  title: 'Importar Itens',
};

export default async function ImportPage() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto py-8">
      <ImportWizard categories={categories} />
    </div>
  );
}
