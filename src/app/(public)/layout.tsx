import type { Metadata } from 'next';
import { ScrollToHash } from './components/ScrollToHash';

export const metadata: Metadata = {
  title: 'Colégio São José',
  description: 'Catálogo público de itens para doação ao Colégio São José',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <ScrollToHash />
      {children}
    </div>
  );
}
