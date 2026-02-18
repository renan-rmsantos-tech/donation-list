import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';

export default async function AdminPage() {
  const session = await getSession();

  if (session.isAdmin) {
    redirect('/admin/dashboard');
  }

  redirect('/admin/login');
}
