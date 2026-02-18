import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Colégio São José - Admin',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
