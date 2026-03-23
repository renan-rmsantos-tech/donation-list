'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin/dashboard', label: 'Painel' },
  { href: '/admin/products', label: 'Produtos' },
  { href: '/admin/categories', label: 'Categorias' },
  { href: '/admin/pix', label: 'PIX' },
  { href: '/admin/transfers', label: 'Transferências' },
];

export function AdminNavLinks() {
  const pathname = usePathname();

  return (
    <>
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Button key={item.href} variant="ghost" size="sm" asChild>
            <Link
              href={item.href}
              className={cn(
                'text-primary-foreground hover:bg-primary-foreground/10',
                isActive &&
                  'bg-primary-foreground/15 ring-1 ring-primary-foreground/30 rounded'
              )}
            >
              {item.label}
            </Link>
          </Button>
        );
      })}
    </>
  );
}
