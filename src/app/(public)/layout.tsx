import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Colégio São José - Doações',
  description: 'Catálogo público de itens para doação ao Colégio São José',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
