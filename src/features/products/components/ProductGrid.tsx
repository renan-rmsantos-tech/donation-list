import type { products } from '@/lib/db/schema';
import { ProductCard } from './ProductCard';

type Product = typeof products.$inferSelect;

interface ProductGridProps {
  products: Array<Product & {
    productCategories: Array<{
      categories: { id: string; name: string };
    }>;
  }>;
  emptyMessage?: string;
}

export function ProductGrid({
  products: items,
  emptyMessage = 'Nenhum produto encontrado.',
}: ProductGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
