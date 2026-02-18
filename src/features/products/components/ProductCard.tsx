import Link from 'next/link';
import type { products } from '@/lib/db/schema';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from './ProgressBar';
import { FulfilledBadge } from './FulfilledBadge';

type Product = typeof products.$inferSelect;

interface ProductCardProps {
  product: Product & {
    productCategories: Array<{
      categories: { id: string; name: string };
    }>;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const categoryNames = product.productCategories
    .map((pc) => pc.categories.name)
    .join(', ');

  return (
    <Link href={`/products/${product.id}`} className="block h-full">
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer flex flex-col">
        <CardHeader className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold line-clamp-2">{product.name}</h3>
            <Badge variant="secondary">
              {product.donationType === 'monetary' ? 'Monetária' : 'Física'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {product.description}
          </p>
          {categoryNames && (
            <p className="text-xs text-muted-foreground">
              Categorias: {categoryNames}
            </p>
          )}
        </CardHeader>
        <CardFooter className="flex flex-col gap-4 pt-4 border-t">
          {product.donationType === 'monetary' ? (
            <ProgressBar
              currentAmount={product.currentAmount}
              targetAmount={product.targetAmount || 0}
            />
          ) : (
            <FulfilledBadge isFulfilled={product.isFulfilled} />
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
