import { AdminLayout } from '@/components/admin/AdminLayout';
import { SyncContestClient } from '@/components/admin/SyncContestClient';
import type { Metadata } from 'next';
import { auth } from '@root/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Sync Contest — Admin', robots: { index: false } };

export default async function SyncContestPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
    redirect('/');
  }
  return (
    <AdminLayout>
      <div>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ color: '#fff', fontWeight: 900, fontSize: 28, marginBottom: 6 }}>Sync Contest</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            Preview CF standings, review & edit scores, then commit to database.
            Supports private group contests via authenticated API.
          </p>
        </div>
        <SyncContestClient />
      </div>
    </AdminLayout>
  );
}
