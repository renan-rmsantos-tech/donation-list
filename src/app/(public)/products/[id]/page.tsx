import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedProductById } from '@/features/products/queries';
import { getPixSettings } from '@/features/pix/queries';
import { getPublicUrl } from '@/lib/storage/supabase';
import { ProgressBar } from '@/features/products/components/ProgressBar';
import { FulfilledBadge } from '@/features/products/components/FulfilledBadge';
import { MonetaryDonationForm } from '@/features/donations/components/MonetaryDonationForm';
import { PhysicalPledgeForm } from '@/features/donations/components/PhysicalPledgeForm';
import { formatCurrency } from '@/lib/utils/format';
import { BackButton } from '@/components/back-button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const [product, pixSettings] = await Promise.all([
    getPublishedProductById(id),
    getPixSettings(),
  ]);

  if (!product) {
    notFound();
  }

  const qrCodeImageUrl =
    pixSettings?.qrCodeImagePath
      ? getPublicUrl('pix-qr', pixSettings.qrCodeImagePath)
      : null;

  const categoryNames = product.productCategories
    .map((pc) => pc.categories.name)
    .join(', ');

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <BackButton href="/">Voltar ao catálogo</BackButton>
        <ThemeToggle />
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{product.name}</h1>
                  <Badge variant="secondary" className="shrink-0">
                    {product.donationType === 'monetary' ? 'Monetária' : 'Física'}
                  </Badge>
                </div>
                {categoryNames && (
                  <p className="text-sm text-muted-foreground">
                    Categorias: {categoryNames}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Descrição</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>

            {/* Status/Progress Section */}
            <div className="p-6 bg-muted/50 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Status</h2>

              {product.donationType === 'monetary' ? (
                <div>
                  <ProgressBar
                    currentAmount={product.currentAmount}
                    targetAmount={product.targetAmount || 0}
                  />
                  <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded text-sm">
                    <p className="font-medium mb-1">Meta: {formatCurrency(product.targetAmount || 0)}</p>
                    <p>Valor arrecadado: {formatCurrency(product.currentAmount)}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <FulfilledBadge isFulfilled={product.isFulfilled} />
                  </div>
                  <Alert
                    variant="default"
                    className={
                      product.isFulfilled
                        ? 'border-green-200 bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-200'
                        : 'border-orange-200 bg-orange-50 dark:bg-orange-950/30 text-orange-800 dark:text-orange-200'
                    }
                  >
                    <AlertDescription>
                      {product.isFulfilled
                        ? 'Este item foi atendido'
                        : 'Este item ainda é necessário'}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>

            {/* Donation Forms */}
            {product.donationType === 'monetary' && (
              <>
                {product.targetAmount != null &&
                product.currentAmount >= product.targetAmount ? (
                  <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30">
                    <AlertDescription>
                      Esta campanha atingiu a meta. Obrigado pelo seu apoio!
                    </AlertDescription>
                  </Alert>
                ) : (
                  <MonetaryDonationForm
                    productId={product.id}
                    targetAmount={product.targetAmount ?? 0}
                    currentAmount={product.currentAmount}
                    qrCodeImageUrl={qrCodeImageUrl}
                    copiaEColaCode={pixSettings?.copiaEColaCode ?? null}
                  />
                )}
              </>
            )}
            {product.donationType === 'physical' && (
              <>
                {product.isFulfilled ? (
                  <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30">
                    <AlertDescription>
                      Este item foi atendido. Obrigado pelo seu apoio!
                    </AlertDescription>
                  </Alert>
                ) : (
                  <PhysicalPledgeForm productId={product.id} />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
