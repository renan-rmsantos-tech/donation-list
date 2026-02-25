import Link from 'next/link';
import Image from 'next/image';
import type { products } from '@/lib/db/schema';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from './ProgressBar';
import { FulfilledBadge } from './FulfilledBadge';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { getPublicUrl } from '@/lib/storage/supabase';

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
    : null;

  return (
    <Link href={`/products/${product.id}`} className="block h-full">
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer flex flex-col">
        {/* Product Photo/Placeholder */}
        <div className="w-full aspect-square bg-muted/50 rounded-t-lg overflow-hidden flex items-center justify-center">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              width={300}
              height={300}
              className="w-full h-full object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 300px"
            />
          ) : (
            <PlaceholderImage className="w-full h-full" />
          )}
        </div>

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
