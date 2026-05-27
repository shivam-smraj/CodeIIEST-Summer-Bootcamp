import { AdminLayout } from '@/components/admin/AdminLayout';
import { ScoreManagerClient } from '@/components/admin/ScoreManagerClient';
import type { Metadata } from 'next';
import { auth } from '@root/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Score Manager — Admin', robots: { index: false } };

export default async function ScoreManagerPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
    redirect('/');
  }
  return (
    <AdminLayout>
      <div>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ color: '#fff', fontWeight: 900, fontSize: 28, marginBottom: 6 }}>Score Manager</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            Edit any user&apos;s score for any week. Changes are highlighted until saved.
            Scores use &ldquo;Best 6 of 8&rdquo; — total recalculates automatically.
          </p>
        </div>
        <ScoreManagerClient />
      </div>
    </AdminLayout>
  );
}
