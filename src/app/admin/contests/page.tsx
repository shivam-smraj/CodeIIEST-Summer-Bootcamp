import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminContestsClient } from '@/components/admin/AdminContestsClient';
import type { Metadata } from 'next';
import { auth } from '@root/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Contest Log — Admin', robots: { index: false } };

export default async function AdminContestsPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) redirect('/');
  return (
    <AdminLayout>
      <div>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ color: '#fff', fontWeight: 900, fontSize: 28, marginBottom: 6 }}>Contest Log</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            Full audit trail of all synced contests. Expand each row to see complete standings with participant details.
          </p>
        </div>
        <AdminContestsClient />
      </div>
    </AdminLayout>
  );
}
