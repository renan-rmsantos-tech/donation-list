import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getPublishedProductById } from '@/features/products/queries';
import { getPixSettings } from '@/features/pix/queries';
import { getPublicUrl } from '@/lib/storage/supabase';
import { DonationTabs } from '@/features/donations/components/DonationTabs';
import { formatCurrency, calculateProgressPercentage } from '@/lib/utils/format';
import { ThemeToggle } from '@/components/theme-toggle';

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

  const productImageUrl = product.imagePath
    ? getPublicUrl('product-photos', product.imagePath)
    : null;

  const categoryNames = product.productCategories
    .map((pc) => pc.categories.name)
    .join(', ');

  const percentage = calculateProgressPercentage(
    product.currentAmount,
    product.targetAmount || 0
  );

  const isFullyFunded =
    product.targetAmount != null &&
    product.currentAmount >= product.targetAmount;

  return (
    <div className="min-h-screen bg-[#EDE9DE]">
      <div className="max-w-[768px] mx-auto px-4 md:px-16 pt-10 pb-20">

        {/* Nav */}
        <div className="flex items-center justify-between mb-8 max-w-[640px] mx-auto">
          <Link
            href="/"
            className="flex items-center gap-2 font-serif text-[15px] leading-[18px] text-[#4A3728] hover:opacity-70 transition-opacity"
          >
            <ChevronLeft className="w-[18px] h-[18px]" strokeWidth={2} />
            Voltar ao catálogo
          </Link>
          <ThemeToggle className="w-9 h-9 rounded-full border border-[#C8B99A] text-[#4A3728] hover:bg-transparent" />
        </div>

        {/* Card */}
        <div className="bg-[#F5F2EA] border border-[#D9CFBE] rounded-xl overflow-hidden max-w-[640px] mx-auto">

          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-[#E4DDD1]">
            <h1 className="font-serif font-bold text-[32px] leading-[1.2] tracking-[-0.02em] text-[#2C4A5A] mb-2">
              {product.name}
            </h1>
            {categoryNames && (
              <p className="text-[13px] leading-[16px] text-[#8C7B6B] uppercase tracking-[0.04em]">
                Categorias: {categoryNames}
              </p>
            )}
          </div>

          {/* Photo */}
          <div className="px-8 py-6">
            {productImageUrl ? (
              <div className="w-full aspect-square rounded-lg overflow-hidden border border-[#D9CFBE]">
                <Image
                  src={productImageUrl}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                  sizes="(max-width: 768px) 100vw, 600px"
                />
              </div>
            ) : (
              <div
                className="w-full aspect-square rounded-lg overflow-hidden border border-[#D9CFBE] flex flex-col items-center justify-center gap-3"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, #3D5A6C 0%, #2C3F4A 50%, #3A5C3E 100%)',
                }}
              >
                <svg
                  width="56"
                  height="56"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span className="text-[13px] text-white/50">Foto do produto</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="px-8 pb-7 pt-2 border-b border-[#E4DDD1]">
            <h2 className="font-serif font-semibold text-[18px] leading-[22px] text-[#2C4A5A] mb-3">
              Descrição
            </h2>
            <p className="text-[15px] leading-[1.7] text-[#5C4F43] whitespace-pre-wrap">
              {product.description}
            </p>
          </div>

          {/* Status */}
          <div className="bg-[#EDE9DE] px-8 py-7 border-b border-[#E4DDD1]">
            <h2 className="font-serif font-semibold text-[18px] leading-[22px] text-[#2C4A5A] mb-5">
              Status
            </h2>

            {/* Money donations */}
            <div className="mb-6">
              <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#8C7B6B] mb-2.5">
                Doações em Dinheiro
              </p>
              <div className="h-[6px] bg-[#D9CFBE] rounded-[3px] mb-1 overflow-hidden">
                <div
                  className="h-full bg-[#B5824A] rounded-[3px] transition-all"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <p className="text-[12px] text-[#8C7B6B] mb-3">{percentage}%</p>
              <div
                className="rounded-lg px-4 py-3.5 border"
                style={{
                  backgroundColor: 'rgba(44, 74, 90, 0.05)',
                  borderColor: 'rgba(44, 74, 90, 0.15)',
                }}
              >
                <p className="text-[14px] font-semibold text-[#2C4A5A] mb-1">
                  Meta: {formatCurrency(product.targetAmount || 0)}
                </p>
                <p className="text-[14px] text-[#5C4F43]">
                  Valor arrecadado: {formatCurrency(product.currentAmount)}
                </p>
              </div>
            </div>

            {/* Material donations */}
            <div>
              <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#8C7B6B] mb-2.5">
                Doações de Material
              </p>
              <div
                className="rounded-lg px-4 py-3.5 border"
                style={
                  product.isFulfilled
                    ? { backgroundColor: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.3)' }
                    : { backgroundColor: 'rgba(181,130,74,0.08)', borderColor: 'rgba(181,130,74,0.3)' }
                }
              >
                <p
                  className="text-[14px]"
                  style={{ color: product.isFulfilled ? '#166534' : '#7A5C2E' }}
                >
                  {product.isFulfilled
                    ? 'Este item foi atendido. Obrigado!'
                    : 'Este item ainda é necessário. Você pode contribuir em dinheiro ou doando o material.'}
                </p>
              </div>
            </div>
          </div>

          {/* Donation section */}
          {isFullyFunded || product.isFulfilled ? (
            <div className="px-8 py-7">
              <div
                className="rounded-lg px-4 py-3.5 border"
                style={{ backgroundColor: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.3)' }}
              >
                <p className="text-[14px]" style={{ color: '#166534' }}>
                  {isFullyFunded
                    ? 'Esta campanha atingiu a meta. Obrigado pelo seu apoio!'
                    : 'Este item foi atendido. Obrigado pelo seu apoio!'}
                </p>
              </div>
            </div>
          ) : (
            <div className="px-8 pt-7 pb-8">
              <h2 className="font-serif font-semibold text-[18px] leading-[22px] text-[#2C4A5A] mb-5">
                Como deseja contribuir?
              </h2>
              <DonationTabs
                productId={product.id}
                targetAmount={product.targetAmount}
                currentAmount={product.currentAmount}
                qrCodeImageUrl={qrCodeImageUrl}
                copiaEColaCode={pixSettings?.copiaEColaCode ?? null}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
