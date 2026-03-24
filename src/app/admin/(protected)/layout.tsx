import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { adminLogout } from '@/lib/auth/actions';
import { AdminNavLinks } from './components/AdminNavLinks';

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
    <div className="min-h-screen bg-[#F0EBE3]">
      <nav className="flex items-center justify-between h-16 bg-[#1E3D59] px-10 flex-shrink-0">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Colégio São José"
              width={36}
              height={36}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-serif font-bold text-[20px] leading-6 text-[#FAF8F5]">
            Admin
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <AdminNavLinks />
          <div className="w-px h-5 bg-[#FAF8F540] flex-shrink-0 mx-1" />
          <form action={adminLogout} className="inline">
            <button
              type="submit"
              className="py-1.5 px-3.5 rounded-md text-[14px] leading-[18px] text-[#FAF8F5CC] hover:text-[#FAF8F5] hover:bg-[#FAF8F526] transition-colors"
            >
              Sair
            </button>
          </form>
        </div>
      </nav>

      <main className="px-20 py-12">{children}</main>
    </div>
  );
}
