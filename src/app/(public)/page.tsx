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
    <main className="container max-w-5xl mx-auto px-4 py-8">
      <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        <Image
          src="/logo.png"
          alt="Colégio São José"
          width={120}
          height={120}
          className="shrink-0 mx-auto sm:mx-0"
          priority
        />
        <div className="min-w-0 flex-1 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Doações para o Colégio São José
            </h1>
            <ThemeToggle className="shrink-0 sm:pt-1" />
          </div>
          <div className="space-y-4 text-base leading-relaxed text-foreground/90">
            <p>
              O nosso Colégio São José, finalmente nasceu e recorre à sua generosidade.
            </p>
            <p>
              Somos como uma grande família: “em seus inícios, enfrenta muitos desafios, com
              grandes esforços e gastos, até alcançar a estabilidade, quando os irmãos mais velhos
              já podem ajudar os mais novos.” Desde já, agradecemos sua liberalidade, pois dela
              depende o futuro de nossas crianças, o crescimento de nossa Fraternidade e a esperança
              do nosso Brasil.
            </p>
            <blockquote className="border-l-4 border-primary/30 pl-4 text-muted-foreground italic">
              “Há quem dá liberalmente e se torna mais rico; há quem retém mais do que é justo e
              acaba na pobreza.” (Provérbios 11:24)
            </blockquote>
            <p>
              Aqui encontraram gastos e objetos concretos que necessitamos. Podem ajudar em
              dinheiro ou com o bem físico.
            </p>
            <div className="space-y-1 pt-2 not-italic">
              <p>Muito obrigado</p>
              <p>Que Deus os abençoe</p>
              <p className="pt-2 font-medium text-foreground">
                Pe. João Maria Ferreira da Costa, Diretor
              </p>
            </div>
          </div>
        </div>
      </header>

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
