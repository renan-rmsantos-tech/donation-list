import Image from 'next/image';
import { PRODUCT_PLACEHOLDER_IMAGE } from '@/lib/constants';

export function PlaceholderImage({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Image
        src={PRODUCT_PLACEHOLDER_IMAGE}
        alt=""
        fill
        className="object-cover"
        sizes="48px"
      />
    </div>
  );
}
