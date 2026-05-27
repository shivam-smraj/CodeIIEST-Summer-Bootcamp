import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminSessionsClient } from '@/components/admin/AdminSessionsClient';
import type { Metadata } from 'next';
import { auth } from '@root/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Sessions CMS — Admin', robots: { index: false } };

export default async function AdminSessionsPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) redirect('/');
  return (
    <AdminLayout>
      <div>
        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 11,
              background: 'rgba(139,92,246,0.12)',
              border: '1px solid rgba(139,92,246,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
            }}>
              📅
            </div>
            <div>
              <p style={{ color: '#a78bfa', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>
                Content Management
              </p>
              <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em' }}>
                Sessions CMS
              </h1>
            </div>
          </div>
          <p style={{ color: '#4b5563', fontSize: 13, marginLeft: 54 }}>
            Unlock weeks, post contest links, add recordings and editorials for each session.
          </p>
        </div>

        <AdminSessionsClient />
      </div>
    </AdminLayout>
  );
}
