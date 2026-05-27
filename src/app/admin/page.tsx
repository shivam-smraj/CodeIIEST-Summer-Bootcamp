import type { Metadata } from 'next';
import { auth } from '@root/auth';
import { redirect } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
    redirect('/');
  }

  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  );
}
