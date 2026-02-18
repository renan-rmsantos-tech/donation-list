import Link from 'next/link';
import Image from 'next/image';
import { getPublishedProducts, getProductsByCategory } from '@/features/products/queries';
import { getCategories } from '@/features/categories/queries';
import { ProductGrid } from '@/features/products/components/ProductGrid';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

interface CatalogPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const { category: categoryId } = await searchParams;

  const [categories, products] = await Promise.all([
    getCategories(),
    categoryId
      ? getProductsByCategory(categoryId)
      : getPublishedProducts(),
  ]);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <Image
          src="/logo.png"
          alt="Colégio São José"
          width={120}
          height={120}
          className="shrink-0"
          priority
        />
        <div>
          <h1 className="text-4xl font-bold mb-2">Doações para o Colégio São José</h1>
        <p className="text-muted-foreground">
          Fazer uma descrição aqui.
        </p>
        </div>
        <ThemeToggle className="sm:ml-auto" />
        </div>
      </div>

      {categories.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Filtrar por categoria</h2>
          <div className="flex gap-2 flex-wrap">
            <Button variant={!categoryId ? 'default' : 'secondary'} asChild>
              <Link href="/">Todas as categorias</Link>
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={categoryId === category.id ? 'default' : 'secondary'}
                asChild
              >
                <Link href={`/?category=${category.id}`}>{category.name}</Link>
              </Button>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-semibold mb-4">Produtos</h2>
        <ProductGrid
          products={products}
          emptyMessage={
            categoryId
              ? 'Nenhum produto encontrado nesta categoria.'
              : 'Nenhum produto disponível no momento.'
          }
        />
      </section>
    </main>
  );
}
