import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { adminLogout } from '@/lib/auth/actions';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session.isAdmin) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Colégio São José"
                width={40}
                height={40}
              />
              <h1 className="text-2xl font-bold">Admin</h1>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle className="text-primary-foreground hover:bg-primary-foreground/10" />
              <Separator orientation="vertical" className="h-5 bg-primary-foreground/30" />
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/dashboard" className="text-primary-foreground hover:bg-primary-foreground/10">
                  Painel
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-5 bg-primary-foreground/30" />
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/products" className="text-primary-foreground hover:bg-primary-foreground/10">
                  Produtos
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-5 bg-primary-foreground/30" />
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/categories" className="text-primary-foreground hover:bg-primary-foreground/10">
                  Categorias
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-5 bg-primary-foreground/30" />
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/pix" className="text-primary-foreground hover:bg-primary-foreground/10">
                  PIX
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-5 bg-primary-foreground/30" />
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/import" className="text-primary-foreground hover:bg-primary-foreground/10">
                  Importar
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-5 bg-primary-foreground/30" />
              <form action={adminLogout} className="inline">
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Sair
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
