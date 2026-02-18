import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type BackButtonProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function BackButton({ href, children, className }: BackButtonProps) {
  return (
    <Button variant="outline" size="sm" asChild className={cn('gap-1.5', className)}>
      <Link href={href}>
        <ChevronLeft className="h-4 w-4" />
        {children}
      </Link>
    </Button>
  );
}
