import Link from 'next/link';
import Image from 'next/image';
import type { products } from '@/lib/db/schema';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { ProgressBar } from './ProgressBar';
import { FulfilledBadge } from './FulfilledBadge';
import { getPublicUrl } from '@/lib/storage/supabase';
import { PRODUCT_PLACEHOLDER_IMAGE } from '@/lib/constants';

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

  const imageUrl = product.imagePath
    ? getPublicUrl('product-photos', product.imagePath)
    : PRODUCT_PLACEHOLDER_IMAGE;

  return (
    <Link href={`/products/${product.id}`} className="block h-full">
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer flex flex-col">
        {/* Product Photo/Placeholder */}
        <div className="w-full aspect-square bg-muted/50 rounded-t-lg overflow-hidden flex items-center justify-center">
          <Image
            src={imageUrl}
            alt={product.imagePath ? product.name : 'Produto sem foto'}
            width={300}
            height={300}
            className="w-full h-full object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 300px"
          />
        </div>

        <CardHeader className="flex-1">
          <h3 className="text-lg font-semibold line-clamp-2">{product.name}</h3>
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
          <ProgressBar
            currentAmount={product.currentAmount}
            targetAmount={product.targetAmount || 0}
          />
          <div className="flex flex-col gap-1">
            <FulfilledBadge isFulfilled={product.isFulfilled} />
            {!product.isFulfilled && (
              <p className="text-xs text-muted-foreground">
                Aceita doação em dinheiro ou em espécie
              </p>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
